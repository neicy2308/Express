const db = require("./db")
const express = require("express")

const app = express()

app.use(express.json())

app.get("/", (_, res) => {
    res.send("jucie wrld")
})

app.post("/", (req, res) => {
    console.log(req.body)
    res.send("Кто читает тот лох")
})

app.get("/users", (_, res) => {
    const data = db.prepare("SELECT * FROM users").all()
    res.json(data)
})

app.post("/users", (req, res) =>{
    const {email, name} = req.body
    try{
        if (!email || !name){ return res.status(400).json({"error": "Не хватаент данных"})
        }
    const query = db.prepare(`INSERT INTO users (email, name) VALUES (?, ?)`)
    const info = query.run(email, name)
    const newUser = db.prepare(`SELECT * FROM users WHERE ID = ?`).get(info.lastInsertRowid)
    res.status(201).json(newUser)
    }
    catch(error){
        console.error(error)
    }
})

app.delete("/users/:id", (req, res) => {
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

app.post("/todoes", (req, res) =>{
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

app.patch("/todoes/:id/toggle", (req, res) => {
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

app.patch("/users/:id", (req, res) => {
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

app.delete("/todoes/:id", (req, res) => {
    const {id} = req.params
    const query = db.prepare(`DELETE FROM todos WHERE id = ?`)
    const result = query.run(id)
    if (result.changes === 0 ) res.status(404).json({error:"Задачи нет"})
    res.status(200).json({message: "Задача удалена"})
})

app.listen("3000", ()=>{
    console.log("Сервер запущен на порту три тысячи:3")
})

