import { useMemo } from "react";

export const COLOR_PALETTE = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#e91e63",
  "#00bcd4",
  "#8bc34a",
];

export const ALGORITHM_LABELS = {
  fcfs: "FCFS — First Come First Served",
  sjf: "SJF — Shortest Job First",
  srtf: "SRTF — Shortest Remaining Time First",
  rr: "RR — Round Robin",
  priority: "Priority — Priority Scheduling (Non-Preemptive)",
} as const;

export type AlgorithmKey = keyof typeof ALGORITHM_LABELS;

export type Process = {
  pid: string;
  arrival: number;
  burst: number;
  priority: number;
  color: string;
  rem?: number;
  completion?: number;
  tat?: number;
  wt?: number;
};

export type FormState = {
  pid: string;
  arrival: string;
  burst: string;
  priority: string;
};

export type GanttSegment = {
  type: "idle" | "process";
  pid: string | number;
  color: string;
  start: number;
  end: number;
  duration: number;
};

export type SchedulerResult = {
  stats: (Process & { completion: number; tat: number; wt: number })[];
  timeline: GanttSegment[];
};

export function useScheduler(
  processes: Process[],
  algorithm: AlgorithmKey,
  quantum: number,
): SchedulerResult | null {
  return useMemo(() => {
    if (!processes || processes.length === 0) return null;

    const runLinear = (sorted: Process[]) => {
      let time = 0;
      const timeline: GanttSegment[] = [];
      const stats = sorted.map((p) => {
        if (time < p.arrival) {
          timeline.push({
            type: "idle",
            pid: "Idle",
            color: "#475569",
            start: time,
            end: p.arrival,
            duration: p.arrival - time,
          });
          time = p.arrival;
        }
        const completion = time + p.burst;
        timeline.push({
          type: "process",
          pid: p.pid,
          color: p.color,
          start: time,
          end: completion,
          duration: p.burst,
        });
        time = completion;
        return { ...p, completion } as Process & { completion: number };
      });
      return { stats, timeline };
    };

    const srtf = () => {
      let remaining: (Process & { rem: number })[] = processes.map((p) => ({
        ...p,
        rem: p.burst,
      }));
      const completed: (Process & { completion: number })[] = [];
      const timeline: GanttSegment[] = [];
      let time = 0;
      let lastPid: string | number | null = null;
      while (remaining.length > 0) {
        let available = remaining.filter((p) => p.arrival <= time);
        if (available.length === 0) {
          const nextArrival = Math.min(...remaining.map((p) => p.arrival));
          if (time < nextArrival) {
            timeline.push({
              type: "idle",
              pid: "Idle",
              color: "#475569",
              start: time,
              end: nextArrival,
              duration: nextArrival - time,
            });
            time = nextArrival;
          }
          available = remaining.filter((p) => p.arrival <= time);
        }
        const sel = available.reduce((a, b) => (b.rem < a.rem ? b : a));
        const start = time;
        const updated = { ...sel, rem: sel.rem - 1 };
        time++;
        const end = time;
        if (
          lastPid === sel.pid &&
          timeline.length > 0 &&
          timeline[timeline.length - 1].type === "process"
        ) {
          const last = timeline[timeline.length - 1];
          last.end = end;
          last.duration = last.end - last.start;
        } else {
          timeline.push({
            type: "process",
            pid: sel.pid,
            color: sel.color,
            start,
            end,
            duration: end - start,
          });
        }
        lastPid = sel.pid;
        if (updated.rem === 0) {
          completed.push({ ...updated, completion: time });
          remaining = remaining.filter((p) => p.pid !== sel.pid);
        } else {
          remaining = remaining.map((p) => (p.pid === sel.pid ? updated : p));
        }
      }
      return { stats: completed, timeline };
    };

    const rr = () => {
      const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
      let remaining: (Process & { rem: number })[] = sorted.map((p) => ({
        ...p,
        rem: p.burst,
      }));
      let queue: (Process & { rem: number })[] = [];
      const completed: (Process & { completion: number })[] = [];
      const timeline: GanttSegment[] = [];
      let time = 0;
      let idx = 0;
      while (remaining.length > 0 || queue.length > 0) {
        while (idx < remaining.length && remaining[idx].arrival <= time)
          queue.push(remaining[idx++]);
        if (queue.length === 0 && idx < remaining.length) {
          const nextA = remaining[idx].arrival;
          if (time < nextA) {
            timeline.push({
              type: "idle",
              pid: "Idle",
              color: "#475569",
              start: time,
              end: nextA,
              duration: nextA - time,
            });
            time = nextA;
          }
          queue.push(remaining[idx++]);
        }
        const [p, ...rest] = queue;
        queue = rest;
        const exec = Math.min(p.rem, quantum);
        const start = time;
        time += exec;
        const end = time;
        if (
          timeline.length > 0 &&
          timeline[timeline.length - 1].type === "process" &&
          timeline[timeline.length - 1].pid === p.pid
        ) {
          const last = timeline[timeline.length - 1];
          last.end = end;
          last.duration = last.end - last.start;
        } else {
          timeline.push({
            type: "process",
            pid: p.pid,
            color: p.color,
            start,
            end,
            duration: end - start,
          });
        }
        const updated = { ...p, rem: p.rem - exec };
        while (idx < remaining.length && remaining[idx].arrival <= time)
          queue.push(remaining[idx++]);
        if (updated.rem === 0) {
          completed.push({ ...updated, completion: time });
          remaining = remaining.filter((x) => x.pid !== p.pid);
        } else {
          queue = [...queue, updated];
        }
      }
      return { stats: completed, timeline };
    };

    const fcfs = () =>
      runLinear([...processes].sort((a, b) => a.arrival - b.arrival));

    const sjf = () => {
      let remaining: Process[] = [...processes];
      const timeline: GanttSegment[] = [];
      const stats: (Process & { completion: number })[] = [];
      let time = 0;

      while (remaining.length > 0) {
        const available = remaining.filter((p) => p.arrival <= time);

        if (available.length === 0) {
          const nextArrival = Math.min(...remaining.map((p) => p.arrival));
          timeline.push({
            type: "idle",
            pid: "Idle",
            color: "#475569",
            start: time,
            end: nextArrival,
            duration: nextArrival - time,
          });
          time = nextArrival;
          continue;
        }

        const selected = available.reduce((a, b) =>
          a.burst < b.burst ? a : b,
        );

        const completion = time + selected.burst;
        timeline.push({
          type: "process",
          pid: selected.pid,
          color: selected.color,
          start: time,
          end: completion,
          duration: selected.burst,
        });

        stats.push({ ...selected, completion });
        remaining = remaining.filter((p) => p.pid !== selected.pid);
        time = completion;
      }

      return { stats, timeline };
    };

    const prioritySchedule = () => {
      let remaining: Process[] = [...processes];
      const timeline: GanttSegment[] = [];
      const stats: (Process & { completion: number })[] = [];
      let time = 0;

      while (remaining.length > 0) {
        const available = remaining.filter((p) => p.arrival <= time);

        if (available.length === 0) {
          const nextArrival = Math.min(...remaining.map((p) => p.arrival));
          timeline.push({
            type: "idle",
            pid: "Idle",
            color: "#475569",
            start: time,
            end: nextArrival,
            duration: nextArrival - time,
          });
          time = nextArrival;
          continue;
        }

        // Lower number = higher priority (e.g. priority 1 runs before priority 2)
        const selected = available.reduce((a, b) =>
          a.priority < b.priority ? a : b,
        );

        const completion = time + selected.burst;
        timeline.push({
          type: "process",
          pid: selected.pid,
          color: selected.color,
          start: time,
          end: completion,
          duration: selected.burst,
        });

        stats.push({ ...selected, completion });
        remaining = remaining.filter((p) => p.pid !== selected.pid);
        time = completion;
      }

      return { stats, timeline };
    };

    const result = { fcfs, sjf, srtf, rr, priority: prioritySchedule }[algorithm]?.();
    const stats: (Process & { completion: number })[] = result?.stats ?? [];
    const timeline: GanttSegment[] = result?.timeline ?? [];

    const finalStats = stats.map((p) => {
      const completion = p.completion ?? 0;
      const tat = completion - p.arrival;
      const wt = tat - p.burst;
      return { ...p, completion, tat, wt } as Process & {
        completion: number;
        tat: number;
        wt: number;
      };
    });

    return { stats: finalStats, timeline };
  }, [processes, algorithm, quantum]);
}

export function useGantt(
  source:
    | GanttSegment[]
    | (Process & { completion?: number })[]
    | null
    | undefined,
) {
  return useMemo(() => {
    if (!source) return { segments: [] as GanttSegment[], total: 0 };
    const isTimeline = (s: unknown): s is GanttSegment[] => {
      if (!Array.isArray(s) || s.length === 0) return false;
      const first = (s as unknown[])[0] as { start?: unknown };
      return typeof first.start === "number";
    };
    if (isTimeline(source)) {
      const segments = source as GanttSegment[];
      const total = segments.length > 0 ? segments[segments.length - 1].end : 0;
      return { segments, total };
    }
    const stats = source as (Process & { completion?: number })[];
    const segments: GanttSegment[] = [];
    let time = 0;
    stats.forEach((p) => {
      const comp = p.completion ?? 0;
      const start = comp - p.burst;
      if (time < start) {
        segments.push({
          type: "idle",
          pid: "Idle",
          color: "#475569",
          start: time,
          end: start,
          duration: start - time,
        });
        time = start;
      }
      segments.push({
        type: "process",
        pid: p.pid,
        color: p.color,
        start,
        end: comp,
        duration: p.burst,
      });
      time = comp;
    });
    return { segments, total: time };
  }, [source]);
}

export function useSummary(
  stats: (Process & { tat?: number; wt?: number })[] | null | undefined,
) {
  return useMemo(() => {
    if (!stats || stats.length === 0) return null;
    const avgTAT = (
      stats.reduce((s, p) => s + (p.tat ?? 0), 0) / stats.length
    ).toFixed(2);
    const avgWT = (
      stats.reduce((s, p) => s + (p.wt ?? 0), 0) / stats.length
    ).toFixed(2);
    return { avgTAT, avgWT };
  }, [stats]);
}
