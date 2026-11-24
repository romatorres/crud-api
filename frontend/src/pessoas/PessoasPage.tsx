import { useEffect, useState } from "react";
import { getPessoas } from "./services";
import type { Pessoa } from "../types/pessoas";
import { messageError } from "../utils/erroMessage";
import { Mail, Smartphone } from "lucide-react";
import PessoaForm from "./PessoasForm";
import Modal from "../component/modal";

type ModalMode = "create" | "edit" | "delete" | null

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [erroList, setErroList] = useState("")
  const [loading, setLoading] = useState(true)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [pessoaSelected, setPessoaSelected] = useState<Pessoa | null>(null);

  const hasPessoas = pessoas.length > 0;

  useEffect(() => {
    async function loadPessoas() {
      try {
        const data = await getPessoas();

        setPessoas(data);
      } catch (e) {
        setErroList(messageError(e));
      } finally {
        setLoading(false);
      }
    }
    loadPessoas();
  }, []);

  function openRegisterModal() {
    setPessoaSelected(null);
    setModalMode("create");
  }

  function closeModal() {
    setPessoaSelected(null);
    setModalMode(null);
  }

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto py-6 px-10">
        <div className="flex justify-between items-center py-8">
          <h1 className="text-2xl">Cadastro de Pessoas</h1>
          <button
            onClick={openRegisterModal}
            className="py-3 px-6 bg-pink-500 hover:bg-pink-600 transition cursor-pointer rounded-xl">
            Nova Pessoa
          </button>
        </div>

        <Modal
          isOpen={modalMode !== null}
          onClose={closeModal}
          title={modalMode === "create" ? "Cria uma Nova Pessoa" : modalMode === "edit" ? "Editar pessoa" : "Deletar pessoa"}
          showIcon={false}
          message="Cadastre seu novo contato!!"
        >

          {(modalMode === "create" || modalMode === "edit") && (
            <PessoaForm
              onPessoaCreated={(newPessoa) => {
                setPessoas((atual) => [...atual, newPessoa])
                setModalMode(null)
              }}
              onCancel={closeModal}
            />
          )}

        </Modal>

        {loading && (
          <div className="flex items-center gap-4 justify-center">
            <div className="w-6 h-6 border-4 rounded-full border-t-white border-pink-400 animate-spin" />
            <p>Carregando...</p>
          </div>
        )}
        {erroList && <p className="bg-red-400 text-center py-1">{erroList}</p>}
        {!loading && !erroList && !hasPessoas && (
          <p className="text-center">Nenhuma pessoa cadastrada</p>
        )}

        {!erroList && !loading && hasPessoas && (
          <div className="border border-slate-800 bg-slate-900 p-6 rounded-xl">
            <h3 className="text-lg mb-6">Pessoas cadastradas</h3>
            <ul className="flex flex-col gap-3">
              {pessoas.map((p) => (
                <li
                  key={p.id}
                  className="border border-slate-800 p-4 rounded-xl"
                >
                  <p className="font-semibold mb-1">{p.nome}</p>
                  <p className="text-xs text-gray-400 flex gap-2 items-center">
                    <span>
                      <Smartphone size={15} />
                    </span>
                    {p.telefone}
                  </p>
                  <p className="text-sm text-gray-400 flex gap-2 items-center">
                    <span>
                      <Mail size={15} />
                    </span>
                    {p.email}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
