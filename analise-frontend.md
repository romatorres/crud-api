# 📋 Análise do Frontend — CRUD Pessoas

> [!NOTE]
> Projeto acadêmico: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons, consumindo uma API Express/SQLite local.

---

## ✅ O que está bem feito

### Stack moderna e correta
Você escolheu uma stack excelente para o mercado Junior em 2025:
- **React 19** com hooks funcionais (sem class components)
- **TypeScript** com tipagem explícita (`Pessoa`, `ModalVariant`, `DropdownProps`, etc.)
- **Vite** como bundler — padrão do mercado atual
- **Tailwind CSS v4** — versão mais recente
- **Lucide-react** para ícones — biblioteca muito usada no mercado

### Boas práticas já presentes
| Prática | Onde aparece |
|---|---|
| Tipagem com TypeScript | `types.ts`, todas as props dos componentes |
| Separação em componentes | `Dropdown`, `Modal` — bem isolados e reutilizáveis |
| `interface` para props | `DropdownProps`, `ModalProps` |
| Optimistic UI / State local | `setPessoas` atualiza sem refetch |
| Tratamento de erro com `try/catch` | Em `Enviar` e `Apagar` |
| Estado de loading | `carregando`, `enviando`, `isDeleting` |
| Fechar dropdown ao clicar fora | `useRef` + `addEventListener` no `Dropdown` |
| `StrictMode` ativado | `main.tsx` |
| `lang="pt-BR"` no HTML | `index.html` ✔️ |
| Variantes de estilo via objeto | `variants` no `Modal` |

### Componentes bem estruturados
O `Modal` é um destaque positivo: variantes (`danger`, `warning`, `info`) com ícones e cores configuráveis, loading state com spinner, e props com valores padrão. Isso mostra maturidade de design de componente.

---

## 🔧 Melhorias sugeridas (sem complexidade extra)

### 1. Convencionar nomes de funções (camelCase)
Em React/JS, funções e variáveis usam `camelCase`. Letras maiúsculas no início são reservadas para **componentes** e **classes**.

```tsx
// ❌ Atual
function IniciarEdicao(p: Pessoa) { ... }
function LimpaForm() { ... }
async function Enviar(...) { ... }
async function Apagar(id: number) { ... }
function OpenModal(p: Pessoa) { ... }

// ✅ Correto
function iniciarEdicao(p: Pessoa) { ... }
function limpaForm() { ... }
async function enviar(...) { ... }
async function apagar(id: number) { ... }
function openModal(p: Pessoa) { ... }
```

> [!IMPORTANT]
> Essa é a convenção mais verificada em code reviews de agências e empresas. É simples de corrigir e faz muita diferença na impressão que o código causa.

---

### 2. Extrair a URL da API para variável de ambiente
Nunca deixar URLs hardcoded no código — isso é um problema na hora do deploy.

```ts
// ❌ Atual — App.tsx linha 7
const API = "http://localhost:3001";

// ✅ Correto — crie um arquivo .env na raiz do frontend:
// frontend/.env
VITE_API_URL=http://localhost:3001

// E no código:
const API = import.meta.env.VITE_API_URL;
```

> [!TIP]
> No Vite, toda variável de ambiente precisa começar com `VITE_`. Adicione o `.env` ao `.gitignore` e crie um `.env.example` com valores fictícios para documentar.

---

### 3. Adicionar `label` nos inputs do formulário (acessibilidade)
Inputs sem `<label>` falham em testes de acessibilidade e são penalizados em avaliações de code quality.

```tsx
// ❌ Atual — só placeholder, sem label
<input className={campo} placeholder="Nome" value={nome} onChange={...} />

// ✅ Com label
<div>
  <label htmlFor="nome" className="text-sm text-slate-400">Nome</label>
  <input id="nome" className={campo} placeholder="Nome" value={nome} onChange={...} />
</div>
```

---

### 4. Corrigir os typos
```tsx
// ❌ App.tsx linha 30 — "HTTS" em vez de "HTTP"
throw new Error(`Erro HTTS: ${response.status}`);
// ✅
throw new Error(`Erro HTTP: ${response.status}`);

// ❌ App.tsx linha 228 — "Apagara" (falta acento: "Apagará")
title="Apagara essa pessoa?"
// ✅
title="Apagará essa pessoa?"
```

---

### 5. Mover a string de classe CSS para fora do componente
A variável `campo` está dentro do `App` e é recriada a cada render. Para strings estáticas, declare fora:

```tsx
// ❌ Dentro do componente App (linha 136)
const campo = "w-full rounded-lg ...";

// ✅ Fora do componente
const campoStyle = "w-full rounded-lg bg-slate-700 px-3 py-2 ...";

function App() { ... }
```

---

### 6. Adicionar `type="email"` e `type="tel"` nos inputs corretos
Melhora UX em mobile e ativa validação nativa do browser.

```tsx
<input type="email" ... placeholder="Email" />
<input type="tel"   ... placeholder="Telefone" />
```

---

### 7. Dar um título real ao `index.html`
```html
<!-- ❌ Atual -->
<title>frontend</title>

<!-- ✅ -->
<title>Cadastro de Pessoas</title>
```

---

### 8. Separar as chamadas de API em um arquivo `api.ts`
Quando o `App` cresce, é boa prática mover os `fetch` para um arquivo separado. Isso é chamado de **service layer**.

```
frontend/src/
├── api.ts         ← funções fetch (getPessoas, createPessoa, etc.)
├── App.tsx        ← só lógica de estado e JSX
├── types.ts
└── component/
    ├── dropdown.tsx
    └── modal.tsx
```

Exemplo básico:
```ts
// api.ts
const API = import.meta.env.VITE_API_URL;

export async function getPessoas(): Promise<Pessoa[]> {
  const res = await fetch(`${API}/pessoas`);
  if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
  return res.json();
}
```

> [!NOTE]
> Não é obrigatório para o projeto estar academicamente correto, mas é o padrão que você verá em qualquer empresa. Demonstra organização e conhecimento de arquitetura.

---

### 9. Verificar se a lista está vazia

```tsx
{!carregando && pessoas.length === 0 && (
  <p className="text-slate-400 text-center py-4">Nenhuma pessoa cadastrada.</p>
)}
```

---

## 📚 Dicas de aprendizado para vaga Junior

### O que agências e empresas avaliam no portfólio Junior

| Critério | Status no seu projeto |
|---|---|
| TypeScript básico | ✅ Bem usado |
| Componentização | ✅ Separado |
| Consumo de API REST | ✅ Implementado |
| Tratamento de erros | ✅ Presente |
| Estados de loading | ✅ Presentes |
| Nomeação de funções (camelCase) | ⚠️ Precisa ajustar |
| Variáveis de ambiente | ⚠️ Precisa adicionar |
| Acessibilidade básica (labels) | ⚠️ Faltam labels |
| README descritivo | ⚠️ Atual é o padrão Vite — personalize |

### Próximos passos de aprendizado (sem sair do básico)

1. **React Router** — navegação entre páginas. Mesmo projeto, mas com rotas `/` e `/cadastrar`.
2. **Validação de formulário** — com `react-hook-form` (mais usada no mercado) ou validação manual com mensagens de erro por campo.
3. **Feedback visual (Toast)** — em vez de erros em `<p>`, usar a lib `sonner` (simples, muito usada).
4. **Custom hooks** — extrair a lógica de `useEffect` + `fetch` para um hook `usePessoas()`. É um conceito muito cobrado em entrevistas.
5. **GitHub Actions básico** — um workflow que roda `eslint` a cada push. Impressiona para o perfil Junior.

---

## 🔑 Resumo executivo

O projeto tem uma **base muito sólida** para um estudo acadêmico de nível Junior. A stack escolhida é exatamente o que o mercado pede, os componentes estão bem isolados, e o uso de TypeScript já demonstra maturidade.

As principais correções são simples e de alto impacto visual em um code review:

| Prioridade | Ação |
|---|---|
| 🔴 Alta | Renomear funções para `camelCase` |
| 🔴 Alta | Mover URL da API para `.env` |
| 🟡 Média | Adicionar `<label>` nos inputs |
| 🟡 Média | Corrigir os typos (`HTTS` → `HTTP`, `Apagara` → `Apagará`) |
| 🟢 Baixa | `type="email"` e `type="tel"` nos inputs |
| 🟢 Baixa | Dar título real ao `index.html` |
| 🟢 Baixa | Mover `campo` para fora do componente |
