import { useState, useEffect, useRef } from "react"

interface DropdownMenuProps {
    onEdit: () => void
    onDelete: () => void
}

export default function Dropdown({ onEdit, onDelete }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    })
    return (
        <div className="absolute top-2 right-2" ref={dropdownRef}>
            {/* Botão de três pontos */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-gray-400 hover:bg-slate-700 hover:text-gray-100 focus:outline-none transition-colors"
                aria-label="Opções de cadastro"
            >
                &#8942;
            </button>

            {/* Menu Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onEdit();
                                setIsOpen(false);
                            }}
                            className="flex w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => {
                                onDelete();
                                setIsOpen(false);
                            }}
                            className="flex w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );


}