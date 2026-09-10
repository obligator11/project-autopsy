import { useState } from "react";
import { Search, Stethoscope, Circle } from "lucide-react";

interface ZoneChooserProps {
    onSelect: (zone: "autopsy" | "repodoctor", e: React.MouseEvent) => void;
}

// Real ECG beat shape: flat baseline, small P-wave, sharp QRS spike, T-wave, flat.
const BEAT_PATTERN: [number, number][] = [
    [0, 0], [0.15, 0], [0.19, -1.5], [0.23, 0], [0.36, 0],
    [0.39, 1], [0.41, -9], [0.43, 6], [0.46, 0], [0.58, 0],
    [0.63, -2.5], [0.68, 0], [1, 0],
];

function generateECG(beats: number, totalHeight: number, centerX: number) {
    const points: { x: number; y: number }[] = [];
    for (let b = 0; b < beats; b++) {
        for (const [yFrac, xOffset] of BEAT_PATTERN) {
            points.push({ x: centerX + xOffset, y: ((b + yFrac) / beats) * totalHeight });
        }
    }
    return points;
}

const ECG_POINTS = generateECG(6, 100, 50);
const ECG_PATH = "M " + ECG_POINTS.map((p) => `${p.x},${p.y}`).join(" L ");

function CornerBrackets({ active }: { active: boolean }) {
    const style = { borderColor: active ? "#60a5fa" : "rgba(255,255,255,0.15)", transition: "border-color 300ms" };
    return (
        <>
            <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 pointer-events-none" style={style} />
            <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 pointer-events-none" style={style} />
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 pointer-events-none" style={style} />
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 pointer-events-none" style={style} />
        </>
    );
}

export function ZoneChooser({ onSelect }: ZoneChooserProps) {
    const [hovered, setHovered] = useState<"autopsy" | "repodoctor" | null>(null);

    const traceColor =
        hovered === "autopsy" ? "#60a5fa" : hovered === "repodoctor" ? "#fb923c" : "#4ade80";

    return (
        <div className="fixed inset-0 bg-[#050505] flex">
            {/* ---------- Left: Project Autopsy ---------- */}
            <button
                onClick={(e) => onSelect("autopsy", e)}
                onMouseEnter={() => setHovered("autopsy")}
                onMouseLeave={() => setHovered(null)}
                className="relative flex-1 h-full flex flex-col justify-center items-start px-20 text-left overflow-hidden cursor-pointer"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(96,165,250,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            >
                <CornerBrackets active={hovered === "autopsy"} />

                {/* Thin scanner laser line, not a blurred band */}
                <div
                    className="absolute left-8 right-8 pointer-events-none"
                    style={{
                        height: "2px",
                        background: "linear-gradient(90deg, transparent, #93c5fd, #eff6ff, #93c5fd, transparent)",
                        boxShadow: "0 0 12px 2px rgba(147,197,253,0.8)",
                        animation: `scanLine ${hovered === "autopsy" ? "2.2s" : "5s"} ease-in-out infinite`,
                    }}
                />

                <div className="relative z-10">
                    <div
                        className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300"
                        style={{
                            borderColor: hovered === "autopsy" ? "#60a5fa" : "rgba(255,255,255,0.12)",
                            backgroundColor: hovered === "autopsy" ? "#60a5fa1a" : "transparent",
                        }}
                    >
                        <Search size={20} color={hovered === "autopsy" ? "#60a5fa" : "#9ca3af"} />
                    </div>
                    <p
                        className="text-xs font-medium tracking-[0.2em] uppercase mb-3 transition-colors duration-300"
                        style={{ color: hovered === "autopsy" ? "#60a5fa" : "#6b7280" }}
                    >
                        Case File · Analyze
                    </p>
                    <h2 className="text-5xl font-semibold text-white tracking-tight mb-4">Project Autopsy</h2>
                    <p className="text-neutral-400 max-w-sm leading-relaxed">
                        Understand the architecture, history, and evolution of your codebase — evidence first.
                    </p>
                    <div
                        className="mt-8 h-px transition-all duration-500"
                        style={{ width: hovered === "autopsy" ? "60px" : "24px", backgroundColor: "#60a5fa" }}
                    />
                </div>
            </button>

            {/* ---------- Center: embedded vitals monitor ---------- */}
            <div className="relative w-24 h-full flex-shrink-0 flex items-center justify-center bg-[#020202]">
                <div className="relative w-16 h-[90%] rounded-lg border border-white/10 bg-black overflow-hidden">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/20" />

                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <filter id="phosphor" x="-100%" y="-20%" width="300%" height="140%">
                                <feGaussianBlur stdDeviation="1" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <path d={ECG_PATH} fill="none" stroke="#0f3d1f" strokeWidth="0.5" />
                        <path
                            key={hovered ?? "idle"}
                            d={ECG_PATH}
                            fill="none"
                            stroke={traceColor}
                            strokeWidth="0.7"
                            strokeLinecap="round"
                            filter="url(#phosphor)"
                            pathLength={1000}
                            strokeDasharray="90 910"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                from="1000"
                                to="0"
                                dur={hovered ? "1.1s" : "2.6s"}
                                repeatCount="indefinite"
                            />
                        </path>
                    </svg>
                </div>
            </div>

            {/* ---------- Right: RepoDoctor ---------- */}
            <button
                onClick={(e) => onSelect("repodoctor", e)}
                onMouseEnter={() => setHovered("repodoctor")}
                onMouseLeave={() => setHovered(null)}
                className="relative flex-1 h-full flex flex-col justify-center items-end px-20 text-right overflow-hidden cursor-pointer"
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(700px circle at 100% 50%, rgba(251,146,60,0.16), transparent 60%)" }}
                />

                <div className="relative z-10 flex flex-col items-end">
                    <div
                        className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300"
                        style={{
                            borderColor: hovered === "repodoctor" ? "#fb923c" : "rgba(255,255,255,0.12)",
                            backgroundColor: hovered === "repodoctor" ? "#fb923c1a" : "transparent",
                        }}
                    >
                        <Stethoscope size={20} color={hovered === "repodoctor" ? "#fb923c" : "#9ca3af"} />
                    </div>
                    <p
                        className="text-xs font-medium tracking-[0.2em] uppercase mb-3 transition-colors duration-300"
                        style={{ color: hovered === "repodoctor" ? "#fb923c" : "#6b7280" }}
                    >
                        Diagnosis · Act
                    </p>
                    <h2 className="text-5xl font-semibold text-white tracking-tight mb-4">RepoDoctor</h2>
                    <p className="text-neutral-400 max-w-sm leading-relaxed">
                        Diagnose risk, surface priorities, and get AI-backed remediation, grounded in evidence.
                    </p>

                    {/* Mini vitals readout — the "resembles a doctor" detail */}
                    <div className="mt-6 flex items-center gap-3 border border-white/10 rounded-lg px-4 py-2 bg-black/40">
                        <Circle
                            size={8}
                            fill={hovered === "repodoctor" ? "#fb923c" : "#f87171"}
                            color={hovered === "repodoctor" ? "#fb923c" : "#f87171"}
                            className="animate-pulse"
                        />
                        <span className="text-sm font-mono text-neutral-300">72 BPM</span>
                    </div>

                    <div
                        className="mt-6 h-px ml-auto transition-all duration-500"
                        style={{ width: hovered === "repodoctor" ? "60px" : "24px", backgroundColor: "#fb923c" }}
                    />
                </div>
            </button>

            <style>{`
        @keyframes scanLine {
          0% { top: 8%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 88%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}