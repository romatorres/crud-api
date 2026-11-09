import { AlertTriangle, Info, X } from "lucide-react"

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
}

const variants = {
    danger: {
        icon: AlertTriangle,
        iconColor: "text-red-500",
        iconBg: "bg-red-200",
        button: "bg-red-600 hover:bg-red-500 focus:ring-red-500",
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

export default function Modal({ isOpen = false, onClose, onConfirm, title, message, confirmBtnText, cancelBtnText, variant = "danger" }: ModalProps) {
    if (!isOpen) return null

    const style = variants[variant]
    const Icon = style.icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative w-full max-w-md rounded-xl bg-slate-700 p-6 border border-slate-500">
                <button className="absolute top-4 right-4 cursor-pointer hover:text-gray-400 transition-colors bg-slate-600 rounded-full p-1">
                    <X size={20} onClick={onClose} />
                </button>
                <div className="flex justify-center items-center mt-5 mb-4">
                    <div className={`${style.iconBg} rounded-full w-16 h-16 flex justify-center items-center`}>
                        <Icon size={40} className={style.iconColor} />
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-2xl font-semibold mb-1">{title}</p>
                    <p>{message}</p>
                </div>
                <div className="flex gap-4 justify-end">
                    <button onClick={onConfirm} className={`${style.button} px-6 py-3 rounded-md cursor-pointer`}>{confirmBtnText}</button>
                    <button onClick={onClose} className="px-6 py-3 rounded-md bg-gray-950 hover:bg-gray-900 cursor-pointer">{cancelBtnText}</button>
                </div>
            </div>
        </div >
    )
}
