"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import type { IcarusItemLookupMap, IcarusWorkflowEdge } from "@/types/icarus";

const ICARUS_BASE_PATH = "/icarus";
const NODE_W = 160;
const NODE_H = 48;

type ItemNodeData = {
  label: string;
  iconPath?: string;
  iconExists?: boolean;
};

function ItemNode({ data }: NodeProps) {
  const d = data as ItemNodeData;
  return (
    <div className="flex items-center gap-2 rounded border-2 border-primary bg-card px-2 py-1 text-xs text-primary shadow">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "var(--color-primary)" }}
      />
      {d.iconExists && d.iconPath ? (
        <img
          src={`${ICARUS_BASE_PATH}/game-assets/${d.iconPath}`}
          alt={d.label}
          className="h-6 w-6 shrink-0 rounded bg-main object-contain"
          loading="lazy"
        />
      ) : (
        <span className="h-6 w-6 shrink-0 rounded bg-main" />
      )}
      <span className="max-w-[100px] leading-tight">{d.label}</span>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "var(--color-primary)" }}
      />
    </div>
  );
}

const nodeTypes = { item: ItemNode };

function computeLayout(
  rfNodes: Node[],
  rfEdges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 24,
    ranksep: 56,
    marginx: 16,
    marginy: 16,
  });
  rfNodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  rfEdges.forEach((e) => g.setEdge(e.source, e.target));
  Dagre.layout(g);
  return {
    nodes: rfNodes.map((n) => {
      const pos = g.node(n.id);
      return {
        ...n,
        position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      };
    }),
    edges: rfEdges,
  };
}

type Props = {
  nodes: string[];
  edges: IcarusWorkflowEdge[];
  itemLookup: IcarusItemLookupMap;
};

export default function WorkflowGraph({ nodes, edges, itemLookup }: Props) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (nodes.length === 0) return { nodes: [], edges: [] };

    const rfNodes: Node[] = nodes.map((itemId) => {
      const item = itemLookup[itemId];
      return {
        id: itemId,
        type: "item",
        position: { x: 0, y: 0 },
        data: {
          label: item?.displayName ?? itemId.replace(/_/g, " "),
          iconPath: item?.icon.assetPath,
          iconExists: item?.icon.exists ?? false,
        },
      };
    });

    const rfEdges: Edge[] = edges.map((e, i) => ({
      id: `e${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      label: e.count > 1 ? `×${e.count}` : undefined,
      animated: false,
      style: { stroke: "var(--color-secondary)", strokeWidth: 1.5 },
      labelStyle: { fill: "var(--color-secondary)", fontSize: 10 },
      labelBgStyle: { fill: "var(--color-nav)" },
    }));

    return computeLayout(rfNodes, rfEdges);
  }, [nodes, edges, itemLookup]);

  if (layoutedNodes.length === 0) {
    return <p className="text-sm text-secondary">No crafting dependencies.</p>;
  }

  return (
    <div
      style={{
        height: Math.min(300, Math.max(160, layoutedNodes.length * 60)),
      }}
      className="w-full rounded border border-primary bg-main"
    >
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-primary)" gap={20} size={0.5} />
        <Controls
          showInteractive={false}
          className="[&>button]:bg-card [&>button]:border-primary [&>button]:text-primary"
        />
      </ReactFlow>
    </div>
  );
}
