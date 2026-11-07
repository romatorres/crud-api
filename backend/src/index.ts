import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ---------- funções auxiliares ----------

function lerId(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function emailDuplicado(e: unknown): boolean {
  return e instanceof Error && e.message.includes("UNIQUE constraint failed");
}

// ---------- rotas de teste ----------

app.get("/health", (_req, res) => {
  db.prepare("SELECT 1").get();
  res.json({ api: "ok", banco: "ok" });
});

// ---------- CRUD de pessoas ----------

// LISTAR todas
app.get("/pessoas", (_req, res) => {
  const pessoas = db.prepare("SELECT * FROM pessoas ORDER BY id").all();
  res.json(pessoas);
});

// BUSCAR uma
app.get("/pessoas/:id", (req, res) => {
  const id = lerId(req.params.id);
  if (id === null) {
    res.status(400).json({ erro: "Id inválido" });
    return;
  }

  const pessoa = db.prepare("SELECT * FROM pessoas WHERE id = ?").get(id);
  if (!pessoa) {
    res.status(404).json({ erro: "Pessoa não encontrada" });
    return;
  }

  res.json(pessoa);
});

// CRIAR
app.post("/pessoas", (req, res) => {
  const { nome, telefone, email } = req.body;

  if (!nome || !telefone || !email) {
    res.status(400).json({ erro: "Informe nome, telefone e email!" });
    return;
  }

  try {
    const resultado = db
      .prepare("INSERT INTO pessoas (nome, telefone, email) VALUES (?, ?, ?)")
      .run(nome, telefone, email);

    res.status(201).json({
      id: Number(resultado.lastInsertRowid),
      nome,
      telefone,
      email,
    });
  } catch (e) {
    if (emailDuplicado(e)) {
      res.status(409).json({ erro: "Esse e-mail já está cadastrado" });
      return;
    }
    console.error(e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// ATUALIZAR (substitui os três campos)
app.put("/pessoas/:id", (req, res) => {
  const id = lerId(req.params.id);
  if (id === null) {
    res.status(400).json({ erro: "Id inválido" });
    return;
  }

  const { nome, telefone, email } = req.body;
  if (!nome || !telefone || !email) {
    res.status(400).json({ erro: "Informe nome, telefone e email" });
    return;
  }

  try {
    const resultado = db
      .prepare(
        "UPDATE pessoas SET nome = ?, telefone = ?, email = ? WHERE id = ?",
      )
      .run(nome, telefone, email, id);

    if (resultado.changes === 0) {
      res.status(404).json({ erro: "Pessoa não encontrada" });
      return;
    }

    res.json({ id, nome, telefone, email });
  } catch (e) {
    if (emailDuplicado(e)) {
      res.status(409).json({ erro: "Esse e-mail já está cadastrado" });
      return;
    }
    console.error(e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// APAGAR
app.delete("/pessoas/:id", (req, res) => {
  const id = lerId(req.params.id);
  if (id === null) {
    res.status(400).json({ erro: "Id inválido" });
    return;
  }

  const resultado = db.prepare("DELETE FROM pessoas WHERE id = ?").run(id);

  if (resultado.changes === 0) {
    res.status(404).json({ erro: "Pessoa não encontrada" });
    return;
  }

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
