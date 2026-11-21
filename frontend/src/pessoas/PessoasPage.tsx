import { useEffect, useState } from "react"
import { getPessoas } from "./services"
import type { Pessoa } from "../types/pessoas"
import { Mail, Smartphone } from "lucide-react"

export default function () {
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);

    useEffect(() => {
        async function loadPessoas() {
            const data = await getPessoas()

            setPessoas(data)
        }
        loadPessoas()
    }, [])

    return (
        <section className=" bg-slate-950 text-white">
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center py-8">
                    <h1 className="text-2xl">Cadastro de Pessoas</h1>
                    <button className="py-3 px-6 bg-pink-500 hover:bg-PINK-600 transition cursor-pointer rounded-xl">Nova Pessoa</button>
                </div>
                <div className="border border-slate-800 bg-slate-900 p-6 rounded-xl">
                    <h3 className="text-lg mb-6">Pessoas cadastradas</h3>
                    <ul className="flex flex-col gap-3">
                        {pessoas.map((p) => (
                            <li key={p.id} className="border border-slate-800 p-4 rounded-xl">
                                <p className="font-semibold mb-1">{p.nome}</p>
                                <p className="text-xs text-gray-400 flex gap-2"><span><Smartphone size={15} /></span>{p.telefone}</p>
                                <p className="text-sm text-gray-400 flex gap-2 items-center"><span><Mail size={15} /></span>{p.email}</p>
                            </li>


                        ))}

                    </ul>
                </div>
            </div>
        </section>
    )
}