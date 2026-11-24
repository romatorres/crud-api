import { useState } from "react";
import type { FormEvent } from "react"
import Input from "../component/input";
import { createPessoa } from "./services";
import type { Pessoa } from "../types/pessoas";
import { messageError } from "../utils/erroMessage";

interface PessoaFormProps {
    onPessoaCreated: (pessoa: Pessoa) => void
    onCancel: () => void
}


export default function PessoaForm({ onPessoaCreated, onCancel }: PessoaFormProps) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [telefone, setTelefone] = useState("")

    const [sending, setSending] = useState(false)
    const [erroForm, setErroForm] = useState("")

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        setSending(true)
        setErroForm("")

        try {
            const newPessoa = await createPessoa({
                nome,
                email,
                telefone,
            })
            onPessoaCreated(newPessoa)

            setNome("")
            setEmail("")
            setTelefone("")

        } catch (erro) {
            setErroForm(messageError(erro))
        } finally { setSending(false) }
    }

    return (
        <section>
            <div className="flex flex-col">
                <form className="space-y-3 mt-4" onSubmit={handleSubmit}>
                    <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} label="Nome" placeholder="Digite seu nome" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} label="E-mail" placeholder="teste@teste.com" />
                    <Input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} label="Telefone" placeholder="(99)98854412" />

                    {erroForm && (<div className="text-red-500">{erroForm}</div>)}

                    <div className="flex gap-4 w-full">
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-pink-500 hover:bg-pink-400 transition py-3 px-8 rounded-lg cursor-pointer">
                            {sending ? "Salvando..." : "Confirmar"}
                        </button>
                        <button
                            type="button"
                            disabled={sending}
                            onClick={onCancel}
                            className="w-full bg-slate-900 hover:bg-slate-800 transition py-3 px-8 rounded-lg cursor-pointer">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}