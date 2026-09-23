import { useMemo, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    MarkerType,
    type Node,
    type Edge,
} from "reactflow";
import dagre from "dagre";
import { Maximize2, Minimize2 } from "lucide-react";
import "reactflow/dist/style.css";
import type { DependencyGraph } from "../../lib/api";

function shortName(path: string): string {
    return path.split("/").pop() ?? path;
}

const FOLDER_PALETTE: Record<string, string> = {
    api: "#60a5fa",
    core: "#a78bfa",
    models: "#34d399",
    services: "#fbbf24",
    analyzers: "#fb923c",
    scoring: "#f472b6",
    storage: "#22d3ee",
    ai: "#c084fc",
};

function colorForPath(path: string, fallback: string): string {
    const parts = path.split("/");
    for (const part of parts) {
        if (FOLDER_PALETTE[part]) return FOLDER_PALETTE[part];
    }
    return fallback;
}

const NODE_WIDTH = 190;
const NODE_HEIGHT = 44;

// Wider spacing than before — nodesep/ranksep are the actual knobs that
// control density; the crowding wasn't a bug, just too tight a default
// for ~38 real nodes.
function layoutWithDagre(nodeIds: string[], edges: { source: string; target: string }[]) {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "LR", nodesep: 70, ranksep: 170 });
    g.setDefaultEdgeLabel(() => ({}));

    nodeIds.forEach((id) => g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
    edges.forEach((e) => g.setEdge(e.source, e.target));

    dagre.layout(g);

    const positions: Record<string, { x: number; y: number }> = {};
    nodeIds.forEach((id) => {
        const pos = g.node(id);
        positions[id] = { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 };
    });
    return positions;
}

export function ArchitectureGraph({ graph, accent }: { graph: DependencyGraph; accent: string }) {
    const [fullscreen, setFullscreen] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Which nodes/edges are "connected" to whatever's currently hovered —
    // used to dim everything else instead of showing full density at all times.
    const connected = useMemo(() => {
        if (!hoveredNode) return null;
        const ids = new Set([hoveredNode]);
        graph.edges.forEach((e) => {
            if (e.source === hoveredNode) ids.add(e.target);
            if (e.target === hoveredNode) ids.add(e.source);
        });
        return ids;
    }, [hoveredNode, graph.edges]);

    const { nodes, edges } = useMemo(() => {
        const nodeIds = graph.nodes.map((n) => n.id);
        const positions = layoutWithDagre(nodeIds, graph.edges);

        const flowNodes: Node[] = graph.nodes.map((n) => {
            const color = colorForPath(n.id, accent);
            const dimmed = connected ? !connected.has(n.id) : false;
            return {
                id: n.id,
                position: positions[n.id] ?? { x: 0, y: 0 },
                data: { label: shortName(n.id) },
                style: {
                    background: "#0f1117",
                    color: dimmed ? "#4b5563" : "#e5e7eb",
                    border: `1px solid ${dimmed ? "#27272a" : color}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "monospace",
                    padding: "10px 6px",
                    width: NODE_WIDTH,
                    opacity: dimmed ? 0.35 : 1,
                    boxShadow: dimmed ? "none" : `0 0 12px -4px ${color}66`,
                    transition: "opacity 200ms, border-color 200ms",
                },
            };
        });

        const flowEdges: Edge[] = graph.edges.map((e, i) => {
            const isRelevant = !connected || connected.has(e.source) && connected.has(e.target)
                ? true
                : (hoveredNode === e.source || hoveredNode === e.target);
            const dimmed = connected ? !(hoveredNode === e.source || hoveredNode === e.target) : false;

            return {
                id: `edge-${i}`,
                source: e.source,
                target: e.target,
                animated: !dimmed,
                style: {
                    stroke: accent,
                    strokeWidth: dimmed ? 1 : 2,
                    opacity: dimmed ? 0.08 : 0.7,
                    transition: "opacity 200ms",
                },
                markerEnd: { type: MarkerType.ArrowClosed, color: accent, width: 14, height: 14 },
            };
        });

        return { nodes: flowNodes, edges: flowEdges };
    }, [graph, accent, connected, hoveredNode]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.2em] uppercase text-neutral-500">Architecture</p>
                <button
                    onClick={() => setFullscreen((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    {fullscreen ? "Collapse" : "Expand"}
                </button>
            </div>

            {!fullscreen && (
                <p className="text-[11px] text-neutral-600 mb-2">
                    Scroll to zoom, drag to pan — click Expand for the full view.
                </p>
            )}

            <div
                className={
                    fullscreen
                        ? "fixed inset-6 z-40 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
                        : "bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden"
                }
                style={{ height: fullscreen ? "auto" : 560 }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    // Compact view: start at a fixed, readable zoom centered on the
                    // graph's origin instead of shrinking everything to fit — that's
                    // what was making labels unreadable. Fullscreen has enough room
                    // that fitView stays legible, so it still auto-fits there.
                    {...(fullscreen
                        ? { fitView: true, fitViewOptions: { padding: 0.15 } }
                        : { defaultViewport: { x: 40, y: 40, zoom: 0.75 } })}
                    proOptions={{ hideAttribution: true }}
                    minZoom={0.15}
                    maxZoom={1.5}
                    onNodeMouseEnter={(_, node) => setHoveredNode(node.id)}
                    onNodeMouseLeave={() => setHoveredNode(null)}
                >
                    <Background color="#1f2937" gap={24} />
                    <Controls />
                    <MiniMap
                        style={{ background: "#0a0a0a" }}
                        maskColor="rgba(0,0,0,0.6)"
                        nodeColor={(n) => (n.style?.border as string)?.split(" ").pop() || accent}
                    />
                </ReactFlow>
            </div>

            {fullscreen && (
                <div className="fixed inset-0 z-30 bg-black/70" onClick={() => setFullscreen(false)} />
            )}
        </div>
    );
}