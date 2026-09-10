import { useEffect, useState } from "react";
import { ArrowLeftRight, Clock, Loader2 } from "lucide-react";
import {
    fetchProjectHistory,
    scanProject,
    fetchHotspots,
    type ProjectHistoryEntry,
    type Hotspot,
} from "../../lib/api";

interface ZoneShellProps {
    zone: "autopsy" | "repodoctor";
    onSwitch: (e: React.MouseEvent) => void;
}

export function ZoneShell({ zone, onSwitch }: ZoneShellProps) {
    const isAutopsy = zone === "autopsy";
    const accent = isAutopsy ? "#60a5fa" : "#fb923c";
    const otherName = isAutopsy ? "RepoDoctor" : "Project Autopsy";

    const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const [path, setPath] = useState("");
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState("");
    const [activeProject, setActiveProject] = useState<string | null>(null);
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);

    function loadHistory() {
        setLoadingHistory(true);
        fetchProjectHistory(zone)
            .then(setHistory)
            .catch(() => setHistory([]))
            .finally(() => setLoadingHistory(false));
    }

    useEffect(loadHistory, [zone]);

    async function runScan(targetPath: string) {
        setScanning(true);
        setError("");
        try {
            await scanProject(targetPath, zone);
            const data = await fetchHotspots(targetPath);
            setHotspots(data.hotspots ?? []);
            setActiveProject(targetPath);
            loadHistory(); // refresh sidebar so the new/updated entry shows up
        } catch {
            setError("Scan failed — check the path and that the backend is running.");
        } finally {
            setScanning(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <div className="w-64 h-screen border-r border-white/10 flex flex-col p-4">
                <button
                    onClick={onSwitch}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/10 hover:border-white/25 transition-colors mb-6 group"
                >
                    <ArrowLeftRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Switch to</p>
                        <p className="text-sm font-medium" style={{ color: accent }}>{otherName}</p>
                    </div>
                </button>

                <div className="flex items-center gap-2 px-2 mb-3">
                    <Clock size={13} className="text-neutral-600" />
                    <p className="text-[10px] uppercase tracking-wider text-neutral-600">Recent Projects</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                    {loadingHistory && <p className="text-xs text-neutral-600 px-2">Loading...</p>}
                    {!loadingHistory && history.length === 0 && (
                        <p className="text-xs text-neutral-600 px-2">No projects scanned yet.</p>
                    )}
                    {history.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => runScan(p.path)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                            style={activeProject === p.path ? { backgroundColor: `${accent}15` } : undefined}
                        >
                            <p className="text-sm text-neutral-200 truncate">{p.name}</p>
                            <p className="text-[11px] text-neutral-600 truncate">{p.path}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div key={zone} className="flex-1 p-12 overflow-y-auto animate-[fadeSlideUp_0.5s_ease-out]">
                <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: accent }}>
                    {isAutopsy ? "Case File · Analyze" : "Diagnosis · Act"}
                </p>
                <h1 className="text-4xl font-semibold mb-8">{isAutopsy ? "Project Autopsy" : "RepoDoctor"}</h1>

                <div className="flex gap-2 mb-8 max-w-2xl">
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="C:\path\to\repo"
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm"
                    />
                    <button
                        onClick={() => runScan(path)}
                        disabled={!path || scanning}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-40"
                        style={{ backgroundColor: accent, color: "#050505" }}
                    >
                        {scanning && <Loader2 size={14} className="animate-spin" />}
                        {scanning ? "Scanning..." : "Scan"}
                    </button>


                    <style>{`
                        @keyframes fadeSlideUp {
                            from { opacity: 0; transform: translateY(14px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>

                {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

                {activeProject && (
                    <div>
                        <p className="text-xs text-neutral-500 mb-3 font-mono">{activeProject}</p>
                        <div className="space-y-2">
                            {hotspots.map((h) => (
                                <div
                                    key={h.file}
                                    className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-sm font-mono">{h.file}</p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            {h.changes} changes · {h.size_bytes} bytes
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold" style={{ color: accent }}>
                                        {h.hotspot_score}
                                    </span>
                                </div>
                            ))}
                            {hotspots.length === 0 && (
                                <p className="text-neutral-600 text-sm">No hotspots found for this project.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}