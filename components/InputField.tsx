import React from "react";

type InputFieldProps = {
    label: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
};

export default function InputField({ label, type = "text", value, onChange, placeholder, className = "" }: InputFieldProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-slate-500 transition-colors ${className}`}
            />
        </div>
    );
}
