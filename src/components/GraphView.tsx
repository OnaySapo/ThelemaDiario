"use client";

import React, { useEffect, useRef, useState } from "react";
import { MagickEntry } from "@/lib/types";
import { Filter, ZoomIn, ZoomOut, RotateCcw, Info, Sparkles } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  isEntry: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  success_rating?: number;
  count?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type?: string;
}

interface GraphViewProps {
  onSelectEntry: (entry: MagickEntry) => void;
  entries: MagickEntry[];
}

export function GraphView({ onSelectEntry, entries }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showInfluences, setShowInfluences] = useState(true);

  // Viewport transforms (Pan & Zoom)
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<GraphNode | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Load Graph Data
  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const width = 800;
          const height = 600;

          const initializedNodes: GraphNode[] = data.nodes.map((n: any, i: number) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const dist = 100 + Math.random() * 200;
            let color = "#a7c080";
            let radius = 14;

            if (n.isEntry) {
              radius = 18;
              switch (n.type) {
                case "ritual":
                  color = "#dbbc7f"; // Solar Gold
                  break;
                case "oracle":
                  color = "#a7c080"; // Moss Emerald
                  break;
                case "dream":
                  color = "#d699b6"; // Twilight Purple
                  break;
                case "vision":
                  color = "#7fbbb3"; // Cyan Lunar
                  break;
                case "study":
                  color = "#e69875"; // Amber Fire
                  break;
              }
            } else {
              radius = 9;
              color = n.type.includes("entity") ? "#f2d08a" : "#7a8478";
            }

            return {
              ...n,
              x: width / 2 + Math.cos(angle) * dist,
              y: height / 2 + Math.sin(angle) * dist,
              vx: 0,
              vy: 0,
              radius,
              color,
            };
          });

          setNodes(initializedNodes);
          setEdges(data.edges);
        }
      })
      .catch((err) => console.error("Erro ao carregar dados do grafo:", err));
  }, []);

  // Force simulation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const runSimulation = () => {
      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 350) {
            const force = (n1.radius * n2.radius * 45) / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (dragNodeRef.current !== n1) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (dragNodeRef.current !== n2) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }
      }

      // Spring attraction along edges
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const edge of edges) {
        const sNode = nodeMap.get(edge.source);
        const tNode = nodeMap.get(edge.target);
        if (sNode && tNode) {
          const dx = tNode.x - sNode.x;
          const dy = tNode.y - sNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = 120;
          const springForce = (dist - desiredDist) * 0.04;

          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;

          if (dragNodeRef.current !== sNode) {
            sNode.vx += fx;
            sNode.vy += fy;
          }
          if (dragNodeRef.current !== tNode) {
            tNode.vx -= fx;
            tNode.vy -= fy;
          }
        }
      }

      // Center gravity & velocity dampening
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (const node of nodes) {
        if (dragNodeRef.current === node) continue;

        node.vx += (cx - node.x) * 0.002;
        node.vy += (cy - node.y) * 0.002;

        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Draw subtle background celestial circles
      ctx.strokeStyle = "rgba(167, 192, 128, 0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.arc(cx, cy, 300, 0, Math.PI * 2);
      ctx.arc(cx, cy, 450, 0, Math.PI * 2);
      ctx.stroke();

      // Filter nodes based on state
      const visibleNodes = nodes.filter((n) => {
        if (!showInfluences && !n.isEntry) return false;
        if (filterType !== "all" && n.isEntry && n.type !== filterType) return false;
        return true;
      });
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

      // Draw Edges
      for (const edge of edges) {
        if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) continue;

        const sNode = nodeMap.get(edge.source);
        const tNode = nodeMap.get(edge.target);
        if (!sNode || !tNode) continue;

        const isHighlighted =
          hoveredNode && (hoveredNode.id === sNode.id || hoveredNode.id === tNode.id);

        ctx.strokeStyle = isHighlighted
          ? "rgba(219, 188, 127, 0.8)"
          : edge.type === "entry_connection"
          ? "rgba(167, 192, 128, 0.35)"
          : "rgba(122, 132, 120, 0.2)";
        ctx.lineWidth = isHighlighted ? 2.5 : edge.type === "entry_connection" ? 1.5 : 0.8;

        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);
        ctx.stroke();

        // Edge label if highlighted
        if (isHighlighted && edge.label) {
          const midX = (sNode.x + tNode.x) / 2;
          const midY = (sNode.y + tNode.y) / 2;
          ctx.fillStyle = "#fdf6e3";
          ctx.font = "10px JetBrains Mono, monospace";
          ctx.fillText(edge.label, midX, midY - 4);
        }
      }

      // Draw Nodes
      for (const node of visibleNodes) {
        const isHovered = hoveredNode?.id === node.id;

        // Outer Glow
        if (isHovered || node.isEntry) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + (isHovered ? 8 : 4), 0, Math.PI * 2);
          ctx.fillStyle = isHovered
            ? "rgba(219, 188, 127, 0.35)"
            : "rgba(167, 192, 128, 0.08)";
          ctx.fill();
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isHovered ? "#fdf6e3" : "#1e2326";
        ctx.lineWidth = isHovered ? 2 : 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = isHovered ? "#fdf6e3" : "#d3c6aa";
        ctx.font = `${node.isEntry ? "11px" : "9px"} Inter, sans-serif`;
        ctx.textAlign = "center";
        const labelText = node.label.length > 22 ? `${node.label.slice(0, 20)}...` : node.label;
        ctx.fillText(labelText, node.x, node.y + node.radius + 14);
      }

      ctx.restore();
      animId = requestAnimationFrame(runSimulation);
    };

    animId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animId);
  }, [nodes, edges, hoveredNode, filterType, showInfluences]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight || 650;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse Coordinates to Graph Space
  const getGraphCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { x, y, scale } = transformRef.current;
    return {
      x: (mouseX - x) / scale,
      y: (mouseY - y) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGraphCoords(e);
    // Find node under mouse
    const clickedNode = nodes.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
    } else {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGraphCoords(e);

    if (dragNodeRef.current) {
      dragNodeRef.current.x = coords.x;
      dragNodeRef.current.y = coords.y;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    } else if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Check Hover
      const hovered = nodes.find((n) => {
        const dx = n.x - coords.x;
        const dy = n.y - coords.y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
      });
      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGraphCoords(e);
    const clickedNode = nodes.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode && clickedNode.isEntry) {
      const fullEntry = entries.find((en) => en.id === clickedNode.id);
      if (fullEntry) {
        onSelectEntry(fullEntry);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(transformRef.current.scale * zoomFactor, 0.3), 3.0);
    transformRef.current.scale = newScale;
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
  };

  return (
    <div className="relative w-full h-[650px] bg-forest-900 rounded-2xl border border-forest-700 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-forest-850/90 backdrop-blur-md p-1.5 rounded-xl border border-forest-700 pointer-events-auto shadow-arcane">
          <Filter className="w-3.5 h-3.5 text-parchment-400 ml-1.5 mr-1" />
          {[
            { id: "all", label: "Todos" },
            { id: "ritual", label: "Rituais", color: "text-gold-400" },
            { id: "oracle", label: "Oráculos", color: "text-moss-400" },
            { id: "dream", label: "Sonhos", color: "text-twilight-400" },
            { id: "vision", label: "Visões", color: "text-lunar-400" },
            { id: "study", label: "Estudos", color: "text-amber-500" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === f.id
                  ? "bg-forest-700 text-parchment-100 font-semibold"
                  : "text-parchment-300 hover:text-parchment-100"
              }`}
            >
              <span className={f.color}>{f.label}</span>
            </button>
          ))}

          <button
            onClick={() => setShowInfluences(!showInfluences)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              showInfluences
                ? "bg-forest-750 border-moss-500/40 text-moss-400"
                : "border-transparent text-parchment-400 hover:text-parchment-200"
            }`}
          >
            Influências
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1 bg-forest-850/90 backdrop-blur-md p-1.5 rounded-xl border border-forest-700 pointer-events-auto shadow-arcane">
          <button
            onClick={() => (transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 3))}
            className="p-1.5 text-parchment-300 hover:text-parchment-100 hover:bg-forest-750 rounded-lg"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => (transformRef.current.scale = Math.max(transformRef.current.scale / 1.2, 0.3))}
            className="p-1.5 text-parchment-300 hover:text-parchment-100 hover:bg-forest-750 rounded-lg"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-parchment-300 hover:text-parchment-100 hover:bg-forest-750 rounded-lg"
            title="Centralizar Grafo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none flex items-center gap-2 text-xs font-mono text-parchment-400 bg-forest-850/80 px-3 py-1.5 rounded-lg border border-forest-750 backdrop-blur-sm">
        <Sparkles className="w-3.5 h-3.5 text-gold-400" />
        <span>Arraste nós, use o scroll para zoom ou clique em uma nota para abrir seus detalhes.</span>
      </div>

      {/* Hover Card */}
      {hoveredNode && (
        <div className="absolute bottom-3 right-4 z-20 bg-forest-850/95 border border-forest-700 rounded-xl p-3.5 text-xs shadow-2xl max-w-xs backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredNode.color }}
            ></span>
            <strong className="text-parchment-100 text-sm font-serif line-clamp-1">
              {hoveredNode.label}
            </strong>
          </div>
          <div className="text-[11px] text-parchment-300 space-y-0.5 font-mono">
            <div>Tipo: <span className="text-gold-400 capitalize">{hoveredNode.type}</span></div>
            {hoveredNode.success_rating !== undefined && (
              <div>Sucesso Mágicko: <span className="text-moss-400">{hoveredNode.success_rating}/10</span></div>
            )}
            {hoveredNode.isEntry && (
              <div className="text-[10px] text-lunar-400 pt-1">
                Clique com o mouse para inspecionar / editar esta operação.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
