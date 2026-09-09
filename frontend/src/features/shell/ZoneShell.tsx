import { useEffect, useState } from "react";
import { ArrowLeftRight, Clock } from "lucide-react";
import { fetchProjectHistory, type ProjectHistoryEntry } from "../../lib/api";

interface ZoneShellProps {
    zone: "autopsy" | "repodoctor";
    onSwitch: () => void;
}

export function ZoneShell({ zone, onSwitch }: ZoneShellProps) {
    const isAutopsy = zone === "autopsy";
    const accent = isAutopsy ? "#60a5fa" : "#fb923c";
    const otherName = isAutopsy ? "RepoDoctor" : "Project Autopsy";

    const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchProjectHistory()
            .then(setHistory)
            .catch(() => setHistory([]))
            .finally(() => setLoadingHistory(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <div className="w-64 h-screen border-r border-white/10 flex flex-col p-4">
                {/* Clear, labeled swap button */}
                <button
                    onClick={onSwitch}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 hover:border-white/25 transition-colors mb-6 group"
                >
                    <ArrowLeftRight
                        size={16}
                        className="text-neutral-500 group-hover:text-white transition-colors"
                    />
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Switch to</p>
                        <p className="text-sm font-medium" style={{ color: accent }}>
                            {otherName}
                        </p>
                    </div>
                </button>

                {/* Recent projects */}
                <div className="flex items-center gap-2 px-2 mb-3">
                    <Clock size={13} className="text-neutral-600" />
                    <p className="text-[10px] uppercase tracking-wider text-neutral-600">Recent Projects</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {loadingHistory && (
                        <p className="text-xs text-neutral-600 px-2">Loading...</p>
                    )}
                    {!loadingHistory && history.length === 0 && (
                        <p className="text-xs text-neutral-600 px-2">No projects scanned yet.</p>
                    )}
                    {history.map((p) => (
                        <button
                            key={p.id}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                        >
                            <p className="text-sm text-neutral-200 truncate">{p.name}</p>
                            <p className="text-[11px] text-neutral-600 truncate">{p.path}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-12">
                <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>
                    {isAutopsy ? "Case File · Analyze" : "Diagnosis · Act"}
                </p>
                <h1 className="text-4xl font-semibold">{isAutopsy ? "Project Autopsy" : "RepoDoctor"}</h1>
                <p className="text-neutral-500 mt-2">Real screens for this zone come next.</p>
            </div>
        </div>
    );
}