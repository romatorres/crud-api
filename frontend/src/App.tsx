import { useEffect, useState } from "react";
import type { Pessoa } from "./types";
import type { SyntheticEvent } from "react";

const API = "http://localhost:3001";

function App() {
  //Lista
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [erroLista, setErroLista] = useState("");
  const [carregando, setCarregando] = useState(true);

  //Formulario
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const response = await fetch(`${API}/pessoas`)
        if (!response.ok) throw new Error(`Erro HTTS: ${response.status}`)

        const dados: Pessoa[] = await response.json()
        setPessoas(dados)
      } catch (e) {
        setErroLista(e instanceof Error ? e.message : "Erro desconhecido")
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  async function enviar(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault
    setErroForm("")
    setEnviando(true)

    try {
      const response = await fetch(`${API}/pessoas`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, email })
      })

      const dados = await response.json()
      if (!response.ok) {
        setErroForm(dados.erro ?? `Erro HTTP: ${response.status}`)
        return
      }
      setPessoas((atual) => [...atual, dados as Pessoa])
      setNome("")
      setTelefone("")
      setEmail("")
    } catch {
      setErroForm("Não foi possivel conectar ao servidor!")
    } finally {
      setEnviando(false)
    }
  }

  const campo = "w-full rounded-lg bg-slate-700 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-pink-400";

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <h1 className="mb-6 text-3xl font-bold text-pink-400">Pessoas</h1>

      <form onSubmit={enviar} className="mb-8 max-w-md space-y-3 rounded-lg bg-slate-800 p-4">
        <input className={campo} placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className={campo} placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <input className={campo} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {erroForm && <p className="text-red-400">{erroForm}</p>}

        <button type="submit" disabled={enviando} className="cursor-pointer rounded-lg bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-400 disabled:opacity-50">
          {enviando ? "Salvando" : "Cadastrar"}
        </button>
      </form>

      {carregando && <p>Carregando...</p>}
      {erroLista && <p className="text-red-400">{erroLista}</p>}

      <ul className="flex flex-col gap-2 max-w-md">
        {pessoas.map((p) => (
          <li key={p.id} className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <p>{p.nome}</p>
            <p className="text-sm text-slate-400">
              {p.telefone} · {p.email}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;