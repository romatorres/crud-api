import { useEffect, useState } from "react";
import type { Pessoa } from "./types/pessoas";
import type { SyntheticEvent } from "react";
import Dropdown from "./component/dropdown";
import Modal from "./component/modal";
import Input from "./component/input";

import { getPessoas } from "./services/pessoa"


function App() {
  //Lista
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [listError, setListError] = useState("");
  const [loading, setloading] = useState(true);

  //Formulario
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false)
  const [selectPessoa, setSelectPessoa] = useState<Pessoa | null>(null) //Estado para guardar a pessoa a ser deletada
  const [isDeleting, setIsDeleting] = useState(false)  //Estado para o spin de carregamento 



  useEffect(() => {
    async function loadData() {
      try {
        const dados = await getPessoas();
        setPessoas(dados);

      } catch (e) {
        setListError(
          e instanceof Error ? e.message : "Erro desconhecido"
        );

      } finally {
        setloading(false);
      }
    }

    loadData();
  }, []);

  function startEditing(p: Pessoa) {
    setEditandoId(p.id);
    setNome(p.nome);
    setTelefone(p.telefone);
    setEmail(p.email);
    setErroForm("");
  }

  function clearForm() {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setEmail("");
  }

  /* METODO POST e PUT */
  async function sendData(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroForm("");
    setEnviando(true);

    const editando = editandoId !== null;
    const url = editando ? `${API}/pessoas/${editandoId}` : `${API}/pessoas`;

    try {
      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, email }),
      });

      const dados = await response.json();
      if (!response.ok) {
        setErroForm(dados.erro ?? `Erro HTTP: ${response.status}`);
        return;
      }
      if (editando) {
        setPessoas((atual) =>
          atual.map((p) => (p.id === editandoId ? (dados as Pessoa) : p)),
        );
      } else {
        setPessoas((atual) => [...atual, dados as Pessoa]);
      }
      clearForm();
    } catch {
      setErroForm("Não foi possivel conectar ao servidor!");
    } finally {
      setEnviando(false);
    }
  }

  /* METODO DELETE */
  async function deleteData(id: number) {
    setListError("");
    setIsDeleting(true)

    try {
      const response = await fetch(`${API}/pessoas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const dados = await response.json();
        setListError(dados.erro ?? `Erro HTTP: ${response.status}`);
        return;
      }

      setPessoas((atual) => atual.filter((p) => p.id !== id));

      if (editandoId === id) clearForm();

      // Exclusão concluída: fecha o modal
      setIsOpen(false);
      setSelectPessoa(null);

    } catch {
      setListError("Não foi possivel conectar ao servidor!");
    } finally {
      setIsDeleting(false)
    }
  }

  function openModal(p: Pessoa) {
    setSelectPessoa(p)
    setIsOpen(true)
  }

  function handleConfirm() {
    if (selectPessoa) {
      deleteData(selectPessoa.id)
    }
  }


  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100 flex flex-col items-center">
      <h1 className="mb-6 text-3xl font-bold text-pink-400">Pessoas</h1>

      <form
        onSubmit={sendData}
        className="mb-8 min-w-xl space-y-3 rounded-lg bg-slate-800 p-4"
      >
        <Input
          type="text"
          label="Nome"
          value={nome}
          placeholder="Digite seu nome:"
          onChange={(e) => setNome(e.target.value)}
        />

        <Input
          type="tel"
          label="Telefone"
          value={telefone}
          placeholder="Digite seu telefone"
          onChange={(e) => setTelefone(e.target.value)}
        />
        <Input
          type="email"
          label="E-mail"
          value={email}
          placeholder="Digite seu e-mail"
          onChange={(e) => setEmail(e.target.value)}
        />

        {erroForm && <p className="text-red-400">{erroForm}</p>}

        <div className="flex gap-2 mt-8">
          <button
            type="submit"
            disabled={enviando}
            className="cursor-pointer rounded-lg w-full bg-pink-500 px-4 py-3 font-semibold text-white hover:bg-pink-400 disabled:opacity-50"
          >
            {enviando
              ? "Salvando..."
              : editandoId !== null
                ? "Salvar alteração"
                : "Cadastrar"}
          </button>

          {editandoId !== null && (
            <button
              type="button"
              onClick={clearForm}
              className="cursor-pointer w-full rounded-lg bg-slate-600 px-4 py-2 hover:bg-slate-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading && <p>Carregando...</p>}
      {listError && <p className="text-red-400">{listError}</p>}

      <div className="border border-slate-700 rounded-xl p-4">
        <h2 className="mb-4 text-xl">Lista de Pessoas</h2>
        <ul className="flex flex-col gap-2 w-2xl">
          {pessoas.map((p) => (
            <li
              key={p.id}
              className="relative bg-slate-800 border border-slate-700 rounded-xl p-3 w-full"
            >
              {
                <Dropdown
                  onEdit={() => startEditing(p)}
                  onDelete={() => openModal(p)}
                />
              }
              <p>{p.nome}</p>
              <p className="text-sm text-slate-400">
                {p.telefone} · {p.email}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {/* TESTE MODAL */}
      <div className="flex items-center justify-center">
        <Modal
          isOpen={isOpen}
          onClose={() => {
            if (isDeleting) return

            setSelectPessoa(null)
            setIsOpen(false)
          }}
          title="Apagar essa pessoa?"
          message={`Tem certeza que deseja apagar ${selectPessoa?.nome}?`}
          variant="danger"
          confirmBtnText="Confirmar"
          cancelBtnText="Cancelar"
          onConfirm={handleConfirm}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}

export default App;
