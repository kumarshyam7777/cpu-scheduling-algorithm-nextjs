// import React from "react";
// import { GanttSegment } from "../lib/scheduler";

// function GanttBlock({ seg, index, animEnabled, ganttKey }: { seg: GanttSegment; index: number; animEnabled: boolean; ganttKey: number }) {
//     const widthPx = seg.duration * 42;
//     const delay = animEnabled ? `${index * 110}ms` : "0ms";

//     return (
//         <div className="relative shrink-0" style={{ width: widthPx }}>
//             <div
//                 key={`${ganttKey}-${index}`}
//                 className="h-16 mx-0.5 rounded-lg flex items-center justify-center font-bold text-sm text-white relative shadow-md"
//                 style={{
//                     backgroundColor: seg.color,
//                     opacity: animEnabled ? 0 : 1,
//                     animation: animEnabled ? `slideIn 0.45s ease-out ${delay} forwards` : "none",
//                 }}
//             >
//                 {seg.pid}
//                 <span
//                     className="absolute -bottom-6 left-0 text-xs text-slate-400 font-normal whitespace-nowrap"
//                     style={{
//                         opacity: animEnabled ? 0 : 1,
//                         animation: animEnabled ? `slideIn 0.45s ease-out ${delay} forwards` : "none",
//                     }}
//                 >
//                     {seg.start}
//                 </span>
//             </div>
//         </div>
//     );
// }

// export default function GanttChart({ segments, animEnabled, ganttKey }: { segments: GanttSegment[]; animEnabled: boolean; ganttKey: number }) {
//     const total = segments.length > 0 ? segments[segments.length - 1].end : 0;
//     const totalWidth = segments.reduce((s, seg) => s + seg.duration * 42, 0);

//     return (
//         <div className="overflow-x-auto pb-10">
//             <div className="relative flex items-stretch min-w-max" style={{ height: "72px" }}>
//                 {segments.map((seg, i) => (
//                     <GanttBlock key={`${ganttKey}-${i}`} seg={seg} index={i} animEnabled={animEnabled} ganttKey={ganttKey} />
//                 ))}
//                 <span className="absolute -bottom-6 text-xs text-slate-400" style={{ left: totalWidth }}>
//                     {total}
//                 </span>
//             </div>
//         </div>
//     );
// }


import { GanttSegment } from "../lib/scheduler";

function GanttBlock({ seg, index, animEnabled, ganttKey }: { seg: GanttSegment; index: number; animEnabled: boolean; ganttKey: number }) {
    const widthPx = seg.duration * 42;
    const delay = animEnabled ? `${index * 110}ms` : "0ms";

    return (
        <div className="relative shrink-0" style={{ width: widthPx }}>
            <div
                key={`${ganttKey}-${index}`}
                className="h-16 mx-0.5 rounded-lg flex items-center justify-center font-bold text-sm text-white relative shadow-md"
                style={{
                    backgroundColor: seg.color,
                    opacity: animEnabled ? 0 : 1,
                    animation: animEnabled ? `slideIn 0.45s ease-out ${delay} forwards` : "none",
                }}
            >
                {seg.pid}
                <span
                    className="absolute -bottom-6 left-0 text-xs text-slate-400 font-normal whitespace-nowrap"
                    style={{
                        opacity: animEnabled ? 0 : 1,
                        animation: animEnabled ? `slideIn 0.45s ease-out ${delay} forwards` : "none",
                    }}
                >
                    {seg.start}
                </span>
            </div>
        </div>
    );
}

export default function GanttChart({ segments, animEnabled, ganttKey }: { segments: GanttSegment[]; animEnabled: boolean; ganttKey: number }) {
    const total = segments.length > 0 ? segments[segments.length - 1].end : 0;

    return (
        <div className="overflow-x-auto pb-10">
            <div className="relative flex items-stretch min-w-max" style={{ height: "72px" }}>
                {segments.map((seg, i) => (
                    <GanttBlock key={`${ganttKey}-${i}`} seg={seg} index={i} animEnabled={animEnabled} ganttKey={ganttKey} />
                ))}
                {/* Final marker container matching GanttBlock structure */}
                <div className="relative shrink-0" style={{ width: "0px" }}>
                    <span
                        className="absolute -bottom-6 left-0 text-xs text-slate-400 font-normal whitespace-nowrap"
                    >
                        {total}
                    </span>
                </div>
            </div>
        </div>
    );
}

