import { useEffect, useState } from "react";
import { FileCode2, GitCommit, Users, Calendar } from "lucide-react";
import type { ProjectDNA } from "../../lib/api";

interface StatProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    delay: number;
    accent: string;
}

function Stat({ icon, label, value, delay, accent }: StatProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 transition-all duration-500 ease-out"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
            }}
        >
            <div className="flex items-center gap-2 mb-2" style={{ color: accent }}>
                {icon}
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</p>
            </div>
            <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
    );
}

function LanguageBar({ languages, accent }: { languages: Record<string, number>; accent: string }) {
    const [widths, setWidths] = useState<Record<string, number>>({});

    useEffect(() => {
        const timer = setTimeout(() => setWidths(languages), 400);
        return () => clearTimeout(timer);
    }, [languages]);

    const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    const colors = [accent, "#a78bfa", "#34d399", "#f472b6", "#facc15"];

    return (
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-4">Languages</p>

            <div className="flex h-2.5 rounded-full overflow-hidden bg-neutral-800 mb-4">
                {entries.map(([lang, pct], i) => (
                    <div
                        key={lang}
                        className="h-full transition-all duration-700 ease-out"
                        style={{
                            width: `${widths[lang] ?? 0}%`,
                            backgroundColor: colors[i % colors.length],
                            transitionDelay: `${i * 100}ms`,
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
                {entries.map(([lang, pct], i) => (
                    <div key={lang} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colors[i % colors.length] }}
                        />
                        <span className="text-neutral-300">{lang}</span>
                        <span className="text-neutral-600">{pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProjectDNACard({ dna, accent }: { dna: ProjectDNA; accent: string }) {
    return (
        <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">Project DNA</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Stat icon={<FileCode2 size={14} />} label="Source Files" value={dna.total_source_files} delay={0} accent={accent} />
                <Stat icon={<GitCommit size={14} />} label="Commits" value={dna.total_commits} delay={80} accent={accent} />
                <Stat icon={<Users size={14} />} label="Contributors" value={dna.contributor_count} delay={160} accent={accent} />
                <Stat
                    icon={<Calendar size={14} />}
                    label="Repo Age"
                    value={dna.repo_age_days !== null ? `${dna.repo_age_days}d` : "—"}
                    delay={240}
                    accent={accent}
                />
            </div>

            <LanguageBar languages={dna.languages} accent={accent} />
        </div>
    );
}