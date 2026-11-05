import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = resolve(__dirname, "../pessoas.db");
const db = new DatabaseSync(databasePath);
db.exec(`
  CREATE TABLE IF NOT EXISTS pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )
`);
console.log("Banco SQLite pronto em:", databasePath);

export default db;