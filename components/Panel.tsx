import React from "react";

export default function Panel({ title, children, className = "" }: { title?: string; children?: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-5 backdrop-blur-sm ${className}`}>
            {title && (
                <h2 className="text-xs uppercase tracking-widest text-cyan-400 mb-4 font-bold">{title}</h2>
            )}
            {children}
        </div>
    );
}
