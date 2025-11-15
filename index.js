const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("./db")
const express = require("express")


const salt = "secret-key"
const SECRET = "this-is-for-JWT"

const app = express()

app.use(express.json())

app.post("/register", (req,res) => {
    try{
        const {email, name, password} = req.body
    
        if (!email || !name || !password){ return res.status(400).json({"error": "Не хватаент данных"})
        }
        const syncSalt = bcrypt.genSaltSync(10)
        const hashed = bcrypt.hashSync(password, syncSalt)
        const query = db.prepare(`INSERT INTO users (email, name, password) VALUES (?, ?, ?)`)
        const info = query.run(email, name, hashed)
        const newUser = db.prepare(`SELECT * FROM users WHERE ID = ?`).get(info.lastInsertRowid)
        res.status(201).json(newUser)
    }
    catch(error){
        console.error(error)
    }
})

app.use(express.json())

const authMiddleware = (req, res, next)=>{
    const authHeader = req.headers.authorization
    if (!authHeader) res.status(401).json({error: "Нет токена аворизации"})
    if (!(authHeader.split(" ")[1])) res.status(401).json({error: "Неверный формат токена"})

    try{
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    }
    catch(error){
        console.error(error)
    }
        
}

app.post("/login", (req,res) =>{
    try{
        const {email, password} = req.body
        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

        if (!user) res.status(404).json({error: "Неправильные данные"})
        const valid = bcrypt.compareSync(password, user.password)

        if (!valid) res.status(401).json({error:"Неправильные данные"})

        const token = jwt.sign({...user}, SECRET, {expiresIn: '24h'})

        const {password: p, ...response} = user
        res.status(200).json({token: token, ...response })
    }
    catch(error){
        console.error(error)
    }
})

app.get("/users", (_, res) => {
    const data = db.prepare("SELECT * FROM users").all()
    res.json(data)
})


app.delete("/users/:id", authMiddleware, (req, res) => {
    const {id} = req.params
    const query = db.prepare(`DELETE FROM users WHERE id = ?`)
    const result = query.run(id)
    if (result.changes === 0 ) res.status(404).json({error:"Пользователя нет"})
    res.status(200).json({message: "Пользователь удален"})
})


app.get("/todoes", (_, res) => {
    const data = db.prepare("SELECT * FROM todos").all()
    res.json(data)
})

app.post("/todoes", authMiddleware, (req, res) =>{
    const {name, status} = req.body
    try{
        if (!name|| !status){ return res.status(400).json({"error": "Не хватаент данных"})
        }
    const query = db.prepare(`INSERT INTO todos (name, status) VALUES (?, ?)`)
    const info = query.run(name, status)
    const newTodo = db.prepare(`SELECT * FROM todos WHERE ID = ?`).get(info.lastInsertRowid)
    res.status(201).json(newTodo)
    }
    catch(error){
        console.error(error)
    }
})

app.patch("/todoes/:id/toggle", authMiddleware, (req, res) => {
    try{
        const {id} = req.params
        const query = db.prepare(
            `UPDATE todos SET status = 1 - status WHERE id = ?`
        )
        const result = query.run(id)
        if (result.changes === 0 ) res.status(404).json({error:"Задачи нет"})
        res.status(200).json({message: "Задача изменена"})
    }
    
        catch (error) {
            console.error(error)
        }
    
})

app.patch("/users/:id", authMiddleware,(req, res) => {
    try{
        const {id} = req.params
        const {name} = req.body
        const query = db.prepare(
            `UPDATE users SET name = ? WHERE id = ?`
        )
        const result = query.run(name, id )
        if (result.changes === 0 ) res.status(404).json({error:"пользователя нет"})
        res.status(200).json({message: "Имя изменено"})
    }
    
        catch (error) {
            console.error(error)
        }
    
})

app.get("/users/:id", (req, res) => {
    const {id} = req.params
    const data = db.prepare("SELECT * FROM users WHERE id = ?").all(id)
    res.status(200).json(data)
})
app.get("/todos/:id", (req, res) => {
    const {id} = req.params
    const data = db.prepare("SELECT * FROM todos WHERE id = ?").all(id)
    res.status(200).json(data)
})

app.delete("/todoes/:id", authMiddleware, (req, res) => {
    const {id} = req.params
    const query = db.prepare(`DELETE FROM todos WHERE id = ?`)
    const result = query.run(id)
    if (result.changes === 0 ) res.status(404).json({error:"Задачи нет"})
    res.status(200).json({message: "Задача удалена"})
})

app.listen("3000", ()=>{
    console.log("Сервер запущен на порту три тысячи:3")
})

