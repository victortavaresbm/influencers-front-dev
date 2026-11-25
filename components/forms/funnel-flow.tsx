"use client"

import { useCallback, useEffect, useMemo } from "react"
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Flag, Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  createPage,
  insertBlock,
  siteFlow,
  uid,
  type FlowEdge,
  type FormSite,
} from "@/lib/mock-data/form-site"
import { useI18n } from "@/lib/i18n"

// Lay out the derived graph left-to-right in layers by distance from the entry
// page. Positions are computed, not persisted (D7b).
function layout(graph: ReturnType<typeof siteFlow>, entryId: string) {
  const layer = new Map<string, number>()
  const adjacency = new Map<string, string[]>()
  for (const edge of graph.edges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to])
  }
  const queue: [string, number][] = [[entryId, 0]]
  layer.set(entryId, 0)
  while (queue.length) {
    const [id, depth] = queue.shift()!
    for (const next of adjacency.get(id) ?? []) {
      if (!layer.has(next) || (layer.get(next) ?? 0) < depth + 1) {
        layer.set(next, depth + 1)
        queue.push([next, depth + 1])
      }
    }
  }
  let orphanLayer = 0
  const perLayer = new Map<number, number>()
  const position = (id: string) => {
    const depth = layer.get(id) ?? (orphanLayer += 1)
    const row = perLayer.get(depth) ?? 0
    perLayer.set(depth, row + 1)
    return { x: depth * 280 + 24, y: row * 132 + 24 }
  }
  return position
}

function toNodes(graph: ReturnType<typeof siteFlow>, entryId: string, selectedId: string): Node[] {
  const position = layout(graph, entryId)
  return graph.nodes.map((node) => ({
    id: node.id,
    position: position(node.id),
    data: { label: <NodeLabel node={node} /> },
    selected: node.id === selectedId,
    style: {
      width: 200,
      borderRadius: 12,
      border: `1.5px solid ${node.id === selectedId ? "#18181b" : node.kind === "url" ? "#d4d4d8" : node.final ? "#16a34a" : "#e4e4e7"}`,
      background: node.kind === "url" ? "#fafafa" : "#ffffff",
      padding: 0,
    },
  }))
}

function NodeLabel({ node }: { node: ReturnType<typeof siteFlow>["nodes"][number] }) {
  return (
    <div className="px-3 py-2 text-left">
      <div className="flex items-center gap-1.5">
        {node.entry ? <Home className="size-3 text-zinc-400" /> : node.final ? <Flag className="size-3 text-emerald-600" /> : null}
        <span className="truncate text-sm font-medium text-zinc-900">{node.label || "—"}</span>
      </div>
      <span className="text-[11px] text-zinc-400">{node.kind === "url" ? "URL" : node.pageKind}</span>
    </div>
  )
}

function toEdges(graph: ReturnType<typeof siteFlow>): Edge[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.from,
    target: edge.to,
    label: edge.label,
    animated: edge.source.kind === "rule",
    labelStyle: { fontSize: 11, fill: "#52525b" },
    style: { stroke: edge.source.kind === "rule" ? "#2563eb" : "#a1a1aa" },
    data: { source: edge.source },
  }))
}

function FlowInner({
  site,
  selectedPageId,
  onSelectPage,
  onChange,
}: {
  site: FormSite
  selectedPageId: string
  onSelectPage: (id: string) => void
  onChange: (site: FormSite) => void
}) {
  const { t } = useI18n()
  const graph = useMemo(() => siteFlow(site), [site])
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    setNodes(toNodes(graph, site.entryPageId, selectedPageId))
    setEdges(toEdges(graph))
  }, [graph, site.entryPageId, selectedPageId, setNodes, setEdges])

  // Drawing a connection adds a CTA button on the source page that advances to
  // the target page (an explicit forward path).
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourcePage = site.pages.find((page) => page.id === connection.source)
      const targetPage = site.pages.find((page) => page.id === connection.target)
      if (!sourcePage || !targetPage) return
      const button = {
        id: uid("blk"),
        type: "button" as const,
        label: t("forms.goToPage", { name: targetPage.name }),
        style: "solid" as const,
        align: "center" as const,
        action: { kind: "page" as const, pageId: targetPage.id },
      }
      onChange(insertBlock(site, sourcePage.id, button))
    },
    [site, onChange, t],
  )

  // Deleting an edge clears the underlying block action or removes the rule.
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      let next = site
      for (const edge of deleted) {
        const source = (edge.data as { source?: FlowEdge["source"] } | undefined)?.source
        if (!source) continue
        if (source.kind === "rule") {
          next = { ...next, rules: next.rules.filter((rule) => rule.id !== source.ruleId) }
        } else {
          next = {
            ...next,
            pages: next.pages.map((page) =>
              page.id === source.pageId
                ? {
                    ...page,
                    blocks: page.blocks.map((block) =>
                      block.id === source.blockId && "action" in block ? { ...block, action: { kind: "none" } } : block,
                    ),
                  }
                : page,
            ),
          }
        }
      }
      onChange(next)
    },
    [site, onChange],
  )

  const addPage = (final: boolean) => {
    const created = createPage(final ? "thanks" : "custom", final ? t("forms.pageThanks") : t("forms.pageCustom"))
    onChange({ ...site, pages: [...site.pages, { ...created, final }] })
  }

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => addPage(false)}>
          <Plus />
          {t("forms.flowAddPage")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addPage(true)}>
          <Flag />
          {t("forms.flowAddFinal")}
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={(_, node) => onSelectPage(node.id)}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export function FunnelFlow(props: {
  site: FormSite
  selectedPageId: string
  onSelectPage: (id: string) => void
  onChange: (site: FormSite) => void
}) {
  return (
    <ReactFlowProvider>
      <FlowInner {...props} />
    </ReactFlowProvider>
  )
}
