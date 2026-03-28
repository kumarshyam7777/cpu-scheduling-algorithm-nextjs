"use client";

import React, { useState, useReducer, useCallback } from "react";
import InputField from "../components/InputField";
import Panel from "../components/Panel";
import ProcessTable from "../components/ProcessTable";
import GanttChart from "../components/GanttChart";
import {
  useScheduler,
  useGantt,
  useSummary,
  Process,
  FormState,
  AlgorithmKey,
  ALGORITHM_LABELS,
  COLOR_PALETTE,
} from "../lib/scheduler";

type ProcessAction =
  | { type: "ADD"; pid: string; arrival: number; burst: number; priority: number }
  | { type: "RESET" };

const processReducer = (state: Process[], action: ProcessAction): Process[] => {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          pid: action.pid,
          arrival: action.arrival,
          burst: action.burst,
          priority: action.priority,
          color: COLOR_PALETTE[state.length % COLOR_PALETTE.length],
        },
      ];
    case "RESET":
      return [];
    default:
      return state;
  }
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "CLEAR" };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "CLEAR":
      return { pid: "", arrival: "", burst: "", priority: "1" };
    default:
      return state;
  }
};

export default function CPUSchedulerPage() {
  const [processes, dispatchProcesses] = useReducer(processReducer, [] as Process[]);
  const [form, dispatchForm] = useReducer(formReducer, {
    pid: "",
    arrival: "",
    burst: "",
    priority: "1",
  } as FormState);
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("fcfs");
  const [quantum, setQuantum] = useState<number>(2);
  const [animEnabled, setAnimEnabled] = useState<boolean>(true);
  const [calculated, setCalculated] = useState<boolean>(false);
  const [ganttKey, setGanttKey] = useState<number>(0);

  const schedulerResult = useScheduler(calculated ? processes : [], algorithm, quantum);
  const stats = schedulerResult?.stats ?? null;
  const gantt = useGantt(schedulerResult?.timeline ?? stats);
  const summary = useSummary(stats);

  const handleAddProcess = useCallback(() => {
    const { pid, arrival, burst, priority } = form;
    if (!pid.trim() || arrival === "" || burst === "" || priority === "") {
      alert("Please fill in all fields.");
      return;
    }
    dispatchProcesses({
      type: "ADD",
      pid: pid.trim(),
      arrival: parseInt(arrival),
      burst: parseInt(burst),
      priority: parseInt(priority),
    });
    dispatchForm({ type: "CLEAR" });
  }, [form]);

  const handleCalculate = useCallback(() => {
    if (processes.length === 0) {
      alert("Please add at least one process.");
      return;
    }
    setCalculated(true);
    setGanttKey((k) => k + 1);
  }, [processes.length]);

  const handleReset = useCallback(() => {
    dispatchProcesses({ type: "RESET" });
    dispatchForm({ type: "CLEAR" });
    setCalculated(false);
    setGanttKey((k) => k + 1);
  }, []);

  const handleAlgorithmChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setAlgorithm(e.target.value as AlgorithmKey);
      setCalculated(false);
    },
    [],
  );

  const handleFieldChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        dispatchForm({ type: "SET_FIELD", field, value: e.target.value }),
    [],
  );

  const handleToggleAnim = useCallback(() => setAnimEnabled((v) => !v), []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 font-mono text-white px-4 py-10">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            CPU Scheduling Simulator
          </h1>
          <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">
            Visualize scheduling algorithms with Gantt charts
          </p>
        </div>

        {/* Add Process */}
        <Panel title="Add Process">
          <div className="flex flex-wrap gap-3 items-end">
            <InputField
              label="Process ID"
              value={form.pid}
              onChange={handleFieldChange("pid")}
              placeholder="P1"
              className="w-28"
            />
            <InputField
              label="Arrival Time"
              type="number"
              value={form.arrival}
              onChange={handleFieldChange("arrival")}
              placeholder="0"
              className="w-28"
            />
            <InputField
              label="Burst Time"
              type="number"
              value={form.burst}
              onChange={handleFieldChange("burst")}
              placeholder="5"
              className="w-28"
            />
            {/* Priority field — only shown when Priority algorithm is selected */}
            {algorithm === "priority" && (
              <InputField
                label="Priority"
                type="number"
                value={form.priority}
                onChange={handleFieldChange("priority")}
                placeholder="1"
                className="w-28"
              />
            )}
            <button
              onClick={handleAddProcess}
              className="self-end bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-900 font-bold px-5 py-2 rounded-lg text-sm transition-all"
            >
              + Add
            </button>
            <button
              onClick={handleReset}
              className="self-end bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold px-5 py-2 rounded-lg text-sm transition-all"
            >
              Reset
            </button>
          </div>
        </Panel>

        {/* Algorithm */}
        <Panel title="Algorithm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium">
                Select Algorithm
              </label>
              <select
                value={algorithm}
                onChange={handleAlgorithmChange}
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 text-white cursor-pointer transition-colors"
              >
                {Object.entries(ALGORITHM_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {algorithm === "rr" && (
              <InputField
                label="Time Quantum"
                type="number"
                value={quantum}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuantum(parseInt(e.target.value) || 2)
                }
                placeholder="2"
                className="w-28"
              />
            )}

            <button
              onClick={handleCalculate}
              className="self-end bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all"
            >
              ▶ Calculate
            </button>
            <button
              onClick={handleToggleAnim}
              className={`self-end font-bold px-5 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                animEnabled
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-700 hover:bg-red-600"
              } text-white`}
            >
              Animation: {animEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </Panel>

        {/* Process Table */}
        <Panel title="Process Table" className="overflow-x-auto">
          <ProcessTable
            processes={processes}
            stats={calculated ? stats : null}
            showPriority={algorithm === "priority"}
          />
        </Panel>

        {/* Summary */}
        {summary && calculated && (
          <div className="bg-blue-900/40 border border-blue-700/50 rounded-2xl px-6 py-4 mb-5 flex flex-wrap gap-8 items-center backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">
                Algorithm
              </p>
              <p className="font-bold text-white">{ALGORITHM_LABELS[algorithm]}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">
                Avg Turnaround Time
              </p>
              <p className="font-bold text-cyan-300 text-2xl">{summary.avgTAT}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-400 mb-1">
                Avg Waiting Time
              </p>
              <p className="font-bold text-cyan-300 text-2xl">{summary.avgWT}</p>
            </div>
          </div>
        )}

        {/* Gantt Chart */}
        {calculated && gantt.segments.length > 0 && (
          <Panel title="Gantt Chart">
            <GanttChart
              segments={gantt.segments}
              animEnabled={animEnabled}
              ganttKey={ganttKey}
            />
          </Panel>
        )}

      </div>
    </div>
  );
}
