import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Priority } from "../../lib/api";

const SEVERITY_CONFIG = {
    HIGH: { color: "#f87171", icon: AlertTriangle, label: "High Risk" },
    MEDIUM: { color: "#fb923c", icon: AlertCircle, label: "Medium Risk" },
    LOW: { color: "#94a3b8", icon: Info, label: "Low Risk" },
};

function PriorityCard({ priority, index }: { priority: Priority; index: number }) {
    const [visible, setVisible] = useState(false);
    const config = SEVERITY_CONFIG[priority.severity];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), index * 90);
        return () => clearTimeout(timer);
    }, [index]);

    return (
        <div
            className="bg-neutral-900/60 border rounded-xl p-5 transition-all duration-500 ease-out"
            style={{
                borderColor: `${config.color}33`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-16px)",
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${config.color}22`, color: config.color }}
                    >
                        {index + 1}
                    </span>
                    <p className="text-sm font-mono text-neutral-200">{priority.file}</p>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: config.color }}>
                    <Icon size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wide">{config.label}</span>
                </div>
            </div>

            <ul className="space-y-1 pl-9">
                {priority.reasons.map((reason, i) => (
                    <li key={i} className="text-xs text-neutral-500 flex items-start gap-2">
                        <span className="text-neutral-700 mt-0.5">–</span>
                        {reason}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function PriorityList({ priorities }: { priorities: Priority[] }) {
    if (priorities.length === 0) {
        return <p className="text-neutral-600 text-sm">No priorities to show yet.</p>;
    }

    return (
        <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">
                What Should I Fix First?
            </p>
            <div className="space-y-3">
                {priorities.map((p, i) => (
                    <PriorityCard key={p.file} priority={p} index={i} />
                ))}
            </div>
        </div>
    );
}