import { useState, useEffect, useRef } from "react";

interface DropdownProps {
    onEdit: () => void
    onDelete: () => void
}

export default function Dropdown({ onEdit, onDelete }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)

    /* Responsavel pelo click fora fecha menu */
    const elementRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (elementRef.current && !elementRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
    return (
        <div ref={elementRef} className="relative">
            <button onClick={() => (setIsOpen(!isOpen))} className="absolute top-0 right-2 cursor-pointer text-xl hover:bg-slate-600 px-1 rounded-2xl transition-colors">&#8942;</button>
            {isOpen && (
                <div className="absolute top-5 right-5 flex flex-col w-30 py-2 z-10 border border-slate-700 bg-slate-900 px-1 rounded-md">
                    <button onClick={() => { onEdit(), setIsOpen(false) }} className="px-2 py-0.5 w-full text-left hover:bg-slate-600 rounded-md cursor-pointer transition-colors">Editar</button>
                    <button onClick={() => { onDelete(), setIsOpen(false) }} className="px-2 py-0.5 w-full text-left text-red-400 hover:bg-slate-600 rounded-md cursor-pointer transition-colors">Excluir</button>
                </div>
            )}
        </div>
    )
}