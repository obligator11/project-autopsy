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

export interface ScanResult {
    project_id: number;
    name: string;
    total_source_files: number;
    languages: Record<string, number>;
}

export async function scanProject(path: string, zone: "autopsy" | "repodoctor"): Promise<ScanResult> {
    const response = await fetch(
        `${API_BASE}/api/projects/scan?path=${encodeURIComponent(path)}&zone=${zone}`,
        { method: "POST" }
    );
    if (!response.ok) throw new Error("Scan failed");
    return response.json();
}

export interface ProjectDNA {
    total_source_files: number;
    languages: Record<string, number>;
    total_commits: number;
    contributors: Record<string, number>;
    contributor_count: number;
    has_git_history: boolean;
    first_commit_date: string | null;
    last_commit_date: string | null;
    repo_age_days: number | null;
    generated_at: string;
}

export async function fetchProjectDNA(path: string): Promise<ProjectDNA> {
    const response = await fetch(`${API_BASE}/api/projects/dna?path=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error("Failed to fetch project DNA");
    return response.json();
}