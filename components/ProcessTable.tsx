// import React, { useMemo } from "react";
// import { Process } from "../lib/scheduler";

// export default function ProcessTable({ processes, stats }: { processes: Process[]; stats: (Process & { completion?: number; tat?: number; wt?: number })[] | null }) {
//     const rows = useMemo(() => (stats ?? processes).map((p) => ({
//         ...p,
//         completion: stats ? p.completion ?? null : null,
//         tat: stats ? p.tat ?? null : null,
//         wt: stats ? p.wt ?? null : null,
//     })), [processes, stats]);

//     if (rows.length === 0) return <p className="text-slate-500 text-sm">No processes added yet.</p>;

//     return (
//         <table className="w-full text-sm text-left border-collapse">
//             <thead>
//                 <tr className="text-xs uppercase tracking-widest text-slate-400 border-b border-slate-700">
//                     {["Process", "Arrival", "Burst", "Completion", "TAT", "WT"].map((h) => (
//                         <th key={h} className="py-2 pr-6 font-semibold">{h}</th>
//                     ))}
//                 </tr>
//             </thead>
//             <tbody>
//                 {rows.map((p, i) => (
//                     <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
//                         <td className="py-2 pr-6">
//                             <span className="inline-flex items-center gap-2">
//                                 <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
//                                 {p.pid}
//                             </span>
//                         </td>
//                         <td className="py-2 pr-6">{p.arrival}</td>
//                         <td className="py-2 pr-6">{p.burst}</td>
//                         <td className="py-2 pr-6">{p.completion ?? "—"}</td>
//                         <td className="py-2 pr-6">{p.tat ?? "—"}</td>
//                         <td className="py-2 pr-6">{p.wt ?? "—"}</td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     );
// }

import React, { useMemo } from "react";
import { Process } from "../lib/scheduler";

export default function ProcessTable({
  processes,
  stats,
  showPriority = false,
}: {
  processes: Process[];
  stats: (Process & { completion?: number; tat?: number; wt?: number })[] | null;
  showPriority?: boolean;
}) {
  const rows = useMemo(
    () =>
      (stats ?? processes).map((p) => ({
        ...p,
        completion: stats ? (p.completion ?? null) : null,
        tat: stats ? (p.tat ?? null) : null,
        wt: stats ? (p.wt ?? null) : null,
      })),
    [processes, stats],
  );

  if (rows.length === 0)
    return <p className="text-slate-500 text-sm">No processes added yet.</p>;

  const baseHeaders = ["Process", "Arrival", "Burst"];
  const priorityHeader = showPriority ? ["Priority"] : [];
  const statHeaders = ["Completion", "TAT", "WT"];
  const headers = [...baseHeaders, ...priorityHeader, ...statHeaders];

  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead>
        <tr className="text-xs uppercase tracking-widest text-slate-400 border-b border-slate-700">
          {headers.map((h) => (
            <th key={h} className="py-2 pr-6 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p, i) => (
          <tr
            key={i}
            className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
          >
            {/* Process ID with color dot */}
            <td className="py-2 pr-6">
              <span className="inline-flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                {p.pid}
              </span>
            </td>

            <td className="py-2 pr-6">{p.arrival}</td>
            <td className="py-2 pr-6">{p.burst}</td>

            {/* Priority column — only rendered when showPriority is true */}
            {showPriority && (
              <td className="py-2 pr-6">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-bold text-xs">
                  {p.priority}
                </span>
              </td>
            )}

            <td className="py-2 pr-6">{p.completion ?? "—"}</td>
            <td className="py-2 pr-6">{p.tat ?? "—"}</td>
            <td className="py-2 pr-6">{p.wt ?? "—"}</td>
          </tr>
        ))}
      </tbody>

    </table>
  );
}
