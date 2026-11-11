import React from "react";

interface inputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function Input({ label, ...props }: inputProps) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor="">{label}</label>
            <input className="w-full rounded-lg border border-slate-600 px-3 py-3 text-md outline-none transition placeholder:text-gray-400 focus:ring-1 ring-slate-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400" {...props} />
        </div>
    )
}