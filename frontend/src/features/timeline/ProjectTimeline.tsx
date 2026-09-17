import { useEffect, useState } from "react";
import type { TimelineMonth } from "../../lib/api";

function formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function ProjectTimeline({ months, accent }: { months: TimelineMonth[]; accent: string }) {
    const [heights, setHeights] = useState<Record<string, number>>({});

    const maxCount = Math.max(...months.map((m) => m.commit_count), 1);

    useEffect(() => {
        // Reset to 0 first (in case this is a re-scan of a different project),
        // then grow on the next tick so the transition actually has something
        // to animate from.
        setHeights({});
        const timer = setTimeout(() => {
            const next: Record<string, number> = {};
            months.forEach((m) => {
                next[m.month] = (m.commit_count / maxCount) * 100;
            });
            setHeights(next);
        }, 100);
        return () => clearTimeout(timer);
    }, [months, maxCount]);

    if (months.length === 0) {
        return (
            <div>
                <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Project Timeline</p>
                <p className="text-neutral-600 text-sm">No commit history to chart yet.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">Project Timeline</p>

            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-end gap-3 h-40">
                    {months.map((m, i) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full group">
                            <p
                                className="text-xs font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: accent }}
                            >
                                {m.commit_count}
                            </p>
                            <div
                                className="w-full rounded-t-md transition-all duration-700 ease-out"
                                style={{
                                    height: `${heights[m.month] ?? 0}%`,
                                    minHeight: heights[m.month] ? "4px" : "0px",
                                    backgroundColor: accent,
                                    opacity: 0.85,
                                    transitionDelay: `${i * 60}ms`,
                                }}
                            />
                            <p className="text-[10px] text-neutral-600 mt-2 whitespace-nowrap">
                                {formatMonth(m.month)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}