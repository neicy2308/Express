const Database = require("better-sqlite3")

const db = new Database("database.db")

db.prepare(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT UNIQUE NOT NULL
    )
    `).run()

module.exports = db