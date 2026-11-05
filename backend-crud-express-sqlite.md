# Backend CRUD: Express + TypeScript + SQLite nativo

Guia para replicar o backend do cadastro de pessoas (nome, telefone, e-mail). Tudo aqui foi testado no Windows com Node 22.12.0 e npm 11.

## Visão geral

```
frontend (Vite + React, porta 5173)  →  fetch  →  Express (porta 3001)  →  SQLite (arquivo pessoas.db)
```

- Quem lê e escreve no banco é **só o backend**. O frontend conhece apenas as rotas e o formato das respostas.
- Os dois projetos ficam em pastas separadas dentro de uma pasta geral.

```
crud-api/
├── frontend/
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .gitignore
    ├── pessoas.db        ← gerado automaticamente
    └── src/
        ├── db.ts         ← abre o banco e cria a tabela
        └── index.ts      ← servidor e rotas
```

## Pré-requisitos

- Node 22.12 ou superior (`node -v`).
- Com Node 22.12, o SQLite nativo exige a flag `--experimental-sqlite`. Em versões mais novas ela pode não ser mais necessária.

## Decisão importante: SQLite nativo do Node

O `better-sqlite3` falhou na instalação/execução no Windows (ele tem uma parte nativa que precisa ser compilada). A solução foi usar o módulo embutido `node:sqlite`, que não exige instalar nada.

- O Node mostra um `ExperimentalWarning` ao subir. É só um aviso: o módulo ainda é experimental e a API pode mudar.
- A API é parecida com a do `better-sqlite3` (`db.prepare(...).run/get/all`), com duas diferenças que importam aqui:
  - `lastInsertRowid` pode vir como `bigint`, então é convertido com `Number(...)` antes do `res.json` (o JSON não serializa `bigint`).
  - O erro de e-mail duplicado não vem com um código tipo `SQLITE_CONSTRAINT_UNIQUE`; a verificação é feita pela mensagem (`UNIQUE constraint failed`).

## Passo a passo

### 1. Criar o projeto

```bash
mkdir backend
cd backend
npm init -y
```

### 2. Instalar dependências

```bash
npm install express cors
npm install -D typescript tsx @types/node @types/express @types/cors
```

| Pacote | Função |
|---|---|
| `express` | Servidor HTTP e rotas |
| `cors` | Envia o cabeçalho `Access-Control-Allow-Origin`, para o navegador deixar o React ler as respostas |
| `typescript` | Verificação de tipos |
| `tsx` | Executa arquivos `.ts` direto |
| `@types/*` | Tipos das bibliotecas |

### 3. Ajustar o `package.json`

Garanta estas duas coisas (o resto pode ficar como o `npm init` criou):

```json
{
  "type": "module",
  "scripts": {
    "dev": "node --experimental-sqlite --import tsx --watch src/index.ts"
  }
}
```

- `"type": "module"` permite usar `import`/`export`.
- `--import tsx` faz o Node entender TypeScript.
- `--watch` reinicia o servidor ao salvar um arquivo.

### 4. Criar o `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

### 5. Criar o `.gitignore`

```
node_modules
pessoas.db
```

O banco é um arquivo de dados e não deve ir para o Git.

### 6. Criar `src/db.ts`

```typescript
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
```

- O `resolve` garante que o `pessoas.db` fica sempre na pasta `backend`, não importa de onde o servidor foi iniciado.
- `CREATE TABLE IF NOT EXISTS` roda só na primeira vez.
- `telefone` é texto (por causa de DDD, `+55`, parênteses). `email` é `UNIQUE`.
- Observação: `__dirname` não existe em ESM puro. Aqui funciona porque o `tsx` o fornece. Se um dia rodar sem o `tsx`, troque por `import.meta.dirname` (Node recente) ou use `fileURLToPath(import.meta.url)`.

### 7. Criar `src/index.ts`

```typescript
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
    res.status(400).json({ erro: "Informe nome, telefone e email" });
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
      .prepare("UPDATE pessoas SET nome = ?, telefone = ?, email = ? WHERE id = ?")
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
```

Pontos que importam na ordem do arquivo:

- `app.use(cors(...))` e `app.use(express.json())` vêm **antes** das rotas, porque o Express executa na ordem em que está escrito. Sem o `express.json()`, `req.body` chega vazio.
- Os `?` no SQL são preenchidos pelos valores de `.run(...)`. Nunca monte SQL concatenando texto do usuário (risco de SQL injection).
- Se o frontend rodar em outra porta ou domínio, ajuste a `origin` do `cors`.

### 8. Rodar

```bash
npm run dev
```

Saída esperada:

```
Banco SQLite pronto em: ...\backend\pessoas.db
Servidor rodando em http://localhost:3001
```

## Contrato da API

| Ação | Método e rota | Corpo enviado | Sucesso | Erros possíveis |
|---|---|---|---|---|
| Listar | `GET /pessoas` | nenhum | `200` + array | |
| Buscar um | `GET /pessoas/:id` | nenhum | `200` + objeto | `400` id inválido, `404` |
| Criar | `POST /pessoas` | `{nome, telefone, email}` | `201` + objeto com `id` | `400` campo faltando, `409` e-mail repetido |
| Atualizar | `PUT /pessoas/:id` | `{nome, telefone, email}` | `200` + objeto | `400`, `404`, `409` |
| Apagar | `DELETE /pessoas/:id` | nenhum | `204`, **sem corpo** | `400`, `404` |

- Todo erro devolve JSON no formato `{ "erro": "mensagem" }`.
- Envio de corpo exige o cabeçalho `Content-Type: application/json` e `JSON.stringify` no `body`.
- O `DELETE` responde 204 sem corpo: chamar `.json()` nessa resposta gera erro, então o frontend deve tratar esse caso.

## Testes rápidos

No navegador:

1. `http://localhost:3001/health` → `{"api":"ok","banco":"ok"}`
2. `http://localhost:3001/pessoas` → array com as pessoas cadastradas
3. `http://localhost:3001/pessoas/1` → uma pessoa
4. `http://localhost:3001/pessoas/999` → `{"erro":"Pessoa não encontrada"}`

Criar uma pessoa (no console do navegador, em uma aba da própria API, `http://localhost:3001`, que está na mesma origem):

```javascript
fetch("http://localhost:3001/pessoas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome: "Roma", telefone: "71999999999", email: "roma@teste.com" }),
}).then(async (r) => console.log(r.status, await r.json()));
```

Resultados esperados: `201` na primeira vez, `409` ao repetir o e-mail, `400` se faltar campo.

## Problemas encontrados e soluções

| Sintoma | Causa | Solução |
|---|---|---|
| `npm run dev` sem erro, mas sem mensagem e sem `pessoas.db` | `better-sqlite3` (parte nativa) falhando no Windows | Usar o `node:sqlite` nativo com `--experimental-sqlite` |
| `404` em `POST /pessoas` e `Unexpected token '<'` no `.json()` | A rota não estava no `index.ts` (o Express respondeu 404 em HTML) | Registrar a rota e reiniciar o servidor |
| `req.body` vazio ou `undefined` | `express.json()` ausente ou depois das rotas | Colocar `app.use(express.json())` antes das rotas |
| Erro ao serializar a resposta do INSERT | `lastInsertRowid` vem como `bigint` | `Number(resultado.lastInsertRowid)` |
| Servidor não reinicia ao salvar | `--watch` às vezes falha no Windows | Parar com Ctrl+C e rodar `npm run dev` de novo |
| Import de arquivo local falha | Com `"type": "module"`, imports locais levam extensão `.js` | `import db from "./db.js"` (mesmo o arquivo sendo `.ts`) |
| Navegador bloqueia a leitura da resposta no React | CORS | `app.use(cors({ origin: "http://localhost:5173" }))` |

## Próximos passos possíveis (não implementados)

- `PATCH /pessoas/:id` para atualização parcial.
- Validação mais rígida (formato de e-mail e telefone).
- Separar rotas em arquivos próprios quando o projeto crescer.
- Variáveis de ambiente (`.env`) para porta e origem do CORS.
