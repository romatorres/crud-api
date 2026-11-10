import { AlertTriangle, Info, X, Loader2 } from "lucide-react"

export type ModalVariant = "danger" | "warning" | "info"


interface ModalProps {
    isOpen: boolean,
    onClose: () => void,
    onConfirm: () => void,
    title: string,
    message: string,
    confirmBtnText?: string,
    cancelBtnText?: string,
    variant?: ModalVariant,
    isLoading?: boolean,
}

const variants = {
    danger: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        iconBg: "bg-red-100",
        button: "bg-red-500 hover:bg-red-600 focus:ring-red-600",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        iconBg: "bg-yellow-100",
        button: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
        icon: Info,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
        button: "bg-blue-600 hover:bg-blue-700"
    }
}

export default function Modal({ isOpen = false, onClose, onConfirm, title, message, confirmBtnText, cancelBtnText, variant = "danger", isLoading = false }: ModalProps) {
    if (!isOpen) return null

    const style = variants[variant]
    const Icon = style.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative w-full max-w-120 rounded-xl bg-slate-700 p-6 border border-slate-500">
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 cursor-pointer hover:text-gray-400 transition-colors bg-slate-600 rounded-full p-1">
                    <X size={20} />
                </button>
                <div className="flex justify-center items-center mt-4 mb-3">
                    <div className={`${style.iconBg} rounded-full w-16 h-16 flex justify-center items-center`}>
                        <Icon size={44} className={style.iconColor} />
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-2xl font-semibold">{title}</p>
                    <p>{message}</p>
                </div>
                <div className="flex gap-4 justify-end">
                    <button onClick={onConfirm} disabled={isLoading} className={`${style.button} px-6 py-2 rounded-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {isLoading ? "Excluindo..." : confirmBtnText}
                    </button>
                    <button onClick={onClose} disabled={isLoading} className="px-6 py-2 rounded-md bg-gray-950 hover:bg-gray-900 cursor-pointer">
                        {cancelBtnText}
                    </button>
                </div>
            </div>
        </div >
    )
}
