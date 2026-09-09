const API_BASE = "http://127.0.0.1:8000";

export interface Hotspot {
    file: string;
    changes: number;
    size_bytes: number;
    hotspot_score: number;
}

export interface HotspotsResponse {
    hotspots: Hotspot[];
}

export async function fetchHotspots(path: string): Promise<HotspotsResponse> {
    const response = await fetch(
        `${API_BASE}/api/projects/hotspots?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) {
        throw new Error("Failed to fetch hotspots");
    }
    return response.json();
}


export interface ProjectHistoryEntry {
    id: number;
    name: string;
    path: string;
    created_at: string;
}

export async function fetchProjectHistory(zone: "autopsy" | "repodoctor"): Promise<ProjectHistoryEntry[]> {
    const response = await fetch(`${API_BASE}/api/projects?zone=${zone}`);
    if (!response.ok) throw new Error("Failed to fetch project history");
    return response.json();
}