import { useState } from "react";
import { fetchHotspots, type Hotspot } from "../../lib/api";

export function HotspotList() {
    const [path, setPath] = useState("");
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleScan() {
        setLoading(true);
        setError("");
        try {
            const data = await fetchHotspots(path);
            setHotspots(data.hotspots);
        } catch (err) {
            setError("Could not fetch hotspots. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Change Hotspots</h1>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="C:\path\to\repo"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm"
                />
                <button
                    onClick={handleScan}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-medium"
                >
                    {loading ? "Scanning..." : "Scan"}
                </button>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="space-y-2">
                {hotspots.map((h) => (
                    <div
                        key={h.file}
                        className="bg-neutral-900 border border-neutral-800 rounded p-3 flex justify-between items-center"
                    >
                        <div>
                            <p className="text-sm font-mono">{h.file}</p>
                            <p className="text-xs text-neutral-500">
                                {h.changes} changes · {h.size_bytes} bytes
                            </p>
                        </div>
                        <span className="text-lg font-bold text-orange-400">
                            {h.hotspot_score}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}