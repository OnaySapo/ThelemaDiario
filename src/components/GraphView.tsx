"use client";

import React, { useEffect, useRef, useState } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { Filter, ZoomIn, ZoomOut, RotateCcw, Sparkles, X, Network } from "lucide-react";

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
  onClose?: () => void;
}

export function GraphView({ onSelectEntry, entries, onClose }: GraphViewProps) {
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
            let color = "#ffffff";
            let radius = 14;

            if (n.isEntry) {
              radius = 16;
              const cat = normalizeCategory(n.type);
              switch (cat) {
                case "Prática":
                  color = "#ffffff"; // Pure White
                  break;
                case "Oráculo":
                  color = "#e5e5e5"; // Bright Silver
                  break;
                case "Visão Astral":
                  color = "#cccccc"; // Astral Silver
                  break;
                case "Sonho":
                  color = "#999999"; // Moon Twilight Gray
                  break;
                case "Estudo":
                  color = "#777777"; // Slate Gray
                  break;
                default:
                  color = "#ffffff";
              }
            } else {
              radius = 7;
              color = n.type.includes("entity") ? "#d4d4d4" : "#525252";
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

          if (dist < 320) {
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
          const desiredDist = 110;
          const springForce = (dist - desiredDist) * 0.04;

          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;

          if (dragNodeRef.current !== sNode) {
            sNode.vx += fx;
            sNode.vy += fy;
          }
          if (dragNodeRef.current !== tNode) {
            tNode.vx -= fx;
            tNode.vy += fy;
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

      // Celestial concentric circles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.arc(cx, cy, 280, 0, Math.PI * 2);
      ctx.arc(cx, cy, 420, 0, Math.PI * 2);
      ctx.stroke();

      // Filter nodes based on state
      const visibleNodes = nodes.filter((n) => {
        if (!showInfluences && !n.isEntry) return false;
        if (filterType !== "all" && n.isEntry) {
          const cat = normalizeCategory(n.type);
          if (cat !== filterType) return false;
        }
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
          ? "rgba(255, 255, 255, 0.95)"
          : edge.type === "entry_connection"
          ? "rgba(255, 255, 255, 0.35)"
          : "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = isHighlighted ? 2.5 : edge.type === "entry_connection" ? 1.5 : 0.8;

        ctx.beginPath();
        ctx.moveTo(sNode.x, sNode.y);
        ctx.lineTo(tNode.x, tNode.y);
        ctx.stroke();

        // Edge label if highlighted
        if (isHighlighted && edge.label) {
          const midX = (sNode.x + tNode.x) / 2;
          const midY = (sNode.y + tNode.y) / 2;
          ctx.fillStyle = "#ffffff";
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
            ? "rgba(255, 255, 255, 0.35)"
            : "rgba(255, 255, 255, 0.08)";
          ctx.fill();
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = isHovered ? "#ffffff" : "#121212";
        ctx.lineWidth = isHovered ? 2 : 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = isHovered ? "#ffffff" : "#a3a3a3";
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
    <div className="relative w-full h-full min-h-[500px] bg-medium-900 rounded-xl border border-medium-700 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-medium-850/95 backdrop-blur-md p-1.5 rounded-lg border border-medium-700 pointer-events-auto shadow-xl">
          <Filter className="w-3.5 h-3.5 text-medium-400 ml-1 mr-0.5" />
          {[
            { id: "all", label: "Todas" },
            { id: "Estudo", label: "Estudo" },
            { id: "Visão Astral", label: "Visão Astral" },
            { id: "Sonho", label: "Sonho" },
            { id: "Oráculo", label: "Oráculo" },
            { id: "Prática", label: "Prática" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                filterType === f.id
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-medium-300 hover:text-white hover:bg-medium-800"
              }`}
            >
              <span>{f.label}</span>
            </button>
          ))}

          <button
            onClick={() => setShowInfluences(!showInfluences)}
            className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
              showInfluences
                ? "bg-medium-800 border-white/40 text-white font-medium"
                : "border-transparent text-medium-400 hover:text-medium-200"
            }`}
          >
            Influências (777)
          </button>
        </div>

        {/* View Controls & Optional Close */}
        <div className="flex items-center gap-1 bg-medium-850/95 backdrop-blur-md p-1.5 rounded-lg border border-medium-700 pointer-events-auto shadow-xl">
          <button
            onClick={() => (transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 3))}
            className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-800 rounded transition-colors"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => (transformRef.current.scale = Math.max(transformRef.current.scale / 1.2, 0.3))}
            className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-800 rounded transition-colors"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-800 rounded transition-colors"
            title="Centralizar Grafo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onClose && (
            <>
              <div className="w-[1px] h-4 bg-medium-700 mx-1" />
              <button
                onClick={onClose}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-800 rounded transition-colors"
                title="Fechar Visão Geral (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
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
        className="w-full h-full cursor-grab active:cursor-grabbing bg-medium-900"
      />

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-2 text-xs font-mono text-medium-300 bg-medium-850/90 px-3 py-1.5 rounded-lg border border-medium-700 backdrop-blur-sm">
        <Sparkles className="w-3.5 h-3.5 text-white" />
        <span>Arraste os nós, role para zoom ou clique em uma nota para abri-la.</span>
      </div>

      {/* Hover Card */}
      {hoveredNode && (
        <div className="absolute bottom-3 right-3 z-20 bg-medium-850/95 border border-medium-700 rounded-xl p-3 text-xs shadow-2xl max-w-xs backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredNode.color }}
            ></span>
            <strong className="text-white text-sm font-sans font-semibold line-clamp-1">
              {hoveredNode.label}
            </strong>
          </div>
          <div className="text-[11px] text-medium-300 space-y-0.5 font-mono">
            <div>Categoria: <span className="text-white capitalize">{normalizeCategory(hoveredNode.type)}</span></div>
            {hoveredNode.success_rating !== undefined && (
              <div>Sucesso Mágicko: <span className="text-white font-semibold">{hoveredNode.success_rating}/10</span></div>
            )}
            {hoveredNode.isEntry && (
              <div className="text-[10px] text-medium-400 pt-1">
                Clique para abrir e inspecionar esta nota.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
