"use client";

import React, { useEffect, useRef, useState } from "react";
import { MagickEntry, normalizeCategory } from "@/lib/types";
import { Filter, ZoomIn, ZoomOut, RotateCcw, Sparkles, X } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  isEntry: boolean;
  parentId?: string;
  parentTitle?: string;
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation references (mutable & stable across frames)
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const alphaRef = useRef<number>(1.0); // Simulation energy/temperature
  const animIdRef = useRef<number | null>(null);

  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showInfluences, setShowInfluences] = useState(true);

  // Viewport transforms (Pan & Zoom)
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef<GraphNode | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Update Canvas Dimensions reliably
  const updateCanvasDimensions = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return { width: 800, height: 600 };

    const w = Math.max(container.clientWidth, 600);
    const h = Math.max(container.clientHeight, 450);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    return { width: w, height: h };
  };

  // Helper to re-anchor satellites in neat orbits around their parents
  const anchorSatellitesToParents = (nodes: GraphNode[], edges: GraphEdge[]) => {
    const entryMap = new Map(nodes.filter((n) => n.isEntry).map((n) => [n.id, n]));
    const parentSatelliteCount = new Map<string, number>();

    // Map parent to satellites
    const satParentMap = new Map<string, { parentId: string; parentTitle: string }>();
    for (const edge of edges) {
      if (edge.type === "influence_link") {
        const parent = entryMap.get(edge.source);
        if (parent) {
          satParentMap.set(edge.target, { parentId: parent.id, parentTitle: parent.label });
        }
      }
    }

    for (const node of nodes) {
      if (!node.isEntry) {
        const satInfo = satParentMap.get(node.id);
        if (satInfo) {
          node.parentId = satInfo.parentId;
          node.parentTitle = satInfo.parentTitle;
          const parent = entryMap.get(satInfo.parentId);
          if (parent) {
            const count = parentSatelliteCount.get(satInfo.parentId) || 0;
            parentSatelliteCount.set(satInfo.parentId, count + 1);
            const angle = (count / 6) * Math.PI * 2 + (count % 2 === 0 ? 0 : 0.35);
            const dist = 50 + (count % 2) * 8;
            node.x = parent.x + Math.cos(angle) * dist;
            node.y = parent.y + Math.sin(angle) * dist;
            node.vx = 0;
            node.vy = 0;
          }
        }
      }
    }
  };

  // Load Graph Data
  useEffect(() => {
    fetch("/api/graph")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.nodes)) {
          const { width, height } = updateCanvasDimensions();
          const cx = width / 2;
          const cy = height / 2;

          const rawEntries = data.nodes.filter((n: any) => n.isEntry);
          const rawInfluences = data.nodes.filter((n: any) => !n.isEntry);

          // 1. Position Entry Notes in a harmonic circle around center
          const initializedEntries: GraphNode[] = rawEntries.map((n: any, i: number) => {
            const angle = (i / Math.max(rawEntries.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const dist = Math.min(width, height) * 0.28;
            let color = "#ffffff";
            const cat = normalizeCategory(n.type);

            switch (cat) {
              case "Diário":
                color = "#b8b8b8"; // Warm Neutral Silver
                break;
              case "Prática":
                color = "#ffffff"; // Brilliant White Star
                break;
              case "Oráculo":
                color = "#eaeaea"; // Lunar Silver
                break;
              case "Visão Astral":
                color = "#d4d4d4"; // Astral Mercury
                break;
              case "Sonho":
                color = "#a3a3a3"; // Twilight Gray
                break;
              case "Estudo":
                color = "#858585"; // Slate Wisdom
                break;
              default:
                color = "#ffffff";
            }

            return {
              ...n,
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              vx: 0,
              vy: 0,
              radius: 16,
              color,
            };
          });

          // 2. Initialize Influences (Satellites)
          const initializedInfluences: GraphNode[] = rawInfluences.map((n: any) => {
            let color = "#d4d4d4";
            if (n.type.includes("entity")) color = "#ffffff"; // Deidade / Entidade
            else if (n.type.includes("candle")) color = "#f0f0f0"; // Vela / Luz
            else if (n.type.includes("tool")) color = "#e5e5e5"; // Arma Mágica
            else if (n.type.includes("incense")) color = "#cccccc"; // Incenso
            else if (n.type.includes("feeling")) color = "#b0b0b0"; // Sentimento
            else if (n.type.includes("element")) color = "#d8d8d8"; // Elemento / Tattwa

            return {
              ...n,
              x: cx,
              y: cy,
              vx: 0,
              vy: 0,
              radius: 7,
              color,
            };
          });

          const allNodes = [...initializedEntries, ...initializedInfluences];
          const edges = data.edges || [];

          // Orbitally anchor satellites around their parent entries
          anchorSatellitesToParents(allNodes, edges);

          nodesRef.current = allNodes;
          edgesRef.current = edges;
          alphaRef.current = 0.8; // Clean, gentle settling
        }
      })
      .catch((err) => console.error("Erro ao carregar dados do grafo:", err));
  }, []);

  // ResizeObserver to track container resizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Physics Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const width = canvas.width || 800;
      const height = canvas.height || 600;
      const cx = width / 2;
      const cy = height / 2;

      // 1. Identify active entry notes
      const activeEntries = nodes.filter(
        (n) => n.isEntry && (filterType === "all" || normalizeCategory(n.type) === filterType)
      );
      const activeEntryIds = new Set(activeEntries.map((n) => n.id));

      // 2. Identify active satellites (must have their parent entry currently active and visible!)
      const activeSatellites = showInfluences
        ? nodes.filter((n) => !n.isEntry && n.parentId && activeEntryIds.has(n.parentId))
        : [];

      const visibleNodes = [...activeEntries, ...activeSatellites];
      const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
      const nodeMap = new Map(visibleNodes.map((n) => [n.id, n]));

      // Cool down simulation alpha smoothly
      if (alphaRef.current > 0.005) {
        alphaRef.current *= 0.985;
      }
      const alpha = alphaRef.current;

      // ==========================================
      // STABLE PLANETARY-SATELLITE PHYSICS ENGINE
      // ==========================================
      if (alpha > 0.005 && visibleNodes.length > 0) {
        // A. Repulsion between Entry Notes (Planets push each other apart)
        const kRepulsion = 1600 * alpha;
        for (let i = 0; i < activeEntries.length; i++) {
          for (let j = i + 1; j < activeEntries.length; j++) {
            const n1 = activeEntries[i];
            const n2 = activeEntries[j];

            let dx = n2.x - n1.x;
            let dy = n2.y - n1.y;

            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
              dx = (Math.random() - 0.5) * 4;
              dy = (Math.random() - 0.5) * 4;
            }

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 340) {
              const softenedDist = Math.max(dist, 40);
              const force = Math.min(kRepulsion / (softenedDist * softenedDist), 6);
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

        // B. Spring Attraction between Connected Entry Notes
        const kSpring = 0.02 * alpha;
        const desiredDist = 135;
        for (const edge of edges) {
          if (edge.type !== "entry_connection") continue;
          if (!activeEntryIds.has(edge.source) || !activeEntryIds.has(edge.target)) continue;

          const sNode = nodeMap.get(edge.source);
          const tNode = nodeMap.get(edge.target);
          if (sNode && tNode) {
            let dx = tNode.x - sNode.x;
            let dy = tNode.y - sNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = dist - desiredDist;
            const force = Math.min(Math.max(displacement * kSpring, -5), 5);

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

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

        // C. Center Gravity, Friction & Speed Ceiling for Entry Notes
        const kCenter = 0.002 * alpha;
        const maxSpeed = 6;
        for (const e of activeEntries) {
          if (dragNodeRef.current === e) continue;

          e.vx += (cx - e.x) * kCenter;
          e.vy += (cy - e.y) * kCenter;

          e.vx *= 0.84;
          e.vy *= 0.84;

          const speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
          if (speed > maxSpeed) {
            e.vx = (e.vx / speed) * maxSpeed;
            e.vy = (e.vy / speed) * maxSpeed;
          }

          e.x += e.vx;
          e.y += e.vy;

          if (isNaN(e.x) || isNaN(e.y)) {
            e.x = cx;
            e.y = cy;
            e.vx = 0;
            e.vy = 0;
          }
        }

        // D. Orbital Satellite Physics for Liber 777 Influences
        const kSatSpring = 0.07 * alpha;
        const desiredSatDist = 50;

        for (const sat of activeSatellites) {
          if (dragNodeRef.current === sat) continue;

          const parent = sat.parentId ? nodeMap.get(sat.parentId) : null;
          if (parent) {
            let dx = sat.x - parent.x;
            let dy = sat.y - parent.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = dist - desiredSatDist;
            const force = Math.min(Math.max(displacement * kSatSpring, -4), 4);

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            sat.vx -= fx;
            sat.vy -= fy;

            // Subtle counter-force on parent note
            if (dragNodeRef.current !== parent) {
              parent.vx += fx * 0.12;
              parent.vy += fy * 0.12;
            }
          }
        }

        // Sibling Separation between Satellites of the same Parent
        for (let i = 0; i < activeSatellites.length; i++) {
          for (let j = i + 1; j < activeSatellites.length; j++) {
            const s1 = activeSatellites[i];
            const s2 = activeSatellites[j];

            if (s1.parentId !== s2.parentId) continue; // Only spread sibling satellites around the ring!

            let dx = s2.x - s1.x;
            let dy = s2.y - s1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 46) {
              const force = Math.min((320 * alpha) / (dist * dist), 3);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (dragNodeRef.current !== s1) {
                s1.vx -= fx;
                s1.vy -= fy;
              }
              if (dragNodeRef.current !== s2) {
                s2.vx += fx;
                s2.vy += fy;
              }
            }
          }
        }

        // Satellite Damping & Speed Clamping
        for (const sat of activeSatellites) {
          if (dragNodeRef.current === sat) continue;

          sat.vx *= 0.78;
          sat.vy *= 0.78;

          const spd = Math.sqrt(sat.vx * sat.vx + sat.vy * sat.vy);
          if (spd > 4) {
            sat.vx = (sat.vx / spd) * 4;
            sat.vy = (sat.vy / spd) * 4;
          }

          sat.x += sat.vx;
          sat.y += sat.vy;

          if (isNaN(sat.x) || isNaN(sat.y)) {
            const p = sat.parentId ? nodeMap.get(sat.parentId) : null;
            sat.x = p ? p.x + 50 : cx;
            sat.y = p ? p.y : cy;
            sat.vx = 0;
            sat.vy = 0;
          }
        }
      }

      // ==========================================
      // RENDER CANVAS
      // ==========================================
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.scale, transformRef.current.scale);

      // Celestial concentric circles
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.arc(cx, cy, 400, 0, Math.PI * 2);
      ctx.stroke();

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
          : "rgba(255, 255, 255, 0.16)";
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
        ctx.fillStyle = isHovered ? "#ffffff" : node.isEntry ? "#a3a3a3" : "#737373";
        ctx.font = `${node.isEntry ? "11px" : "9px"} Inter, sans-serif`;
        ctx.textAlign = "center";
        const maxLen = node.isEntry ? 22 : 14;
        const labelText = node.label.length > maxLen ? `${node.label.slice(0, maxLen - 2)}...` : node.label;
        ctx.fillText(labelText, node.x, node.y + node.radius + (node.isEntry ? 14 : 11));
      }

      ctx.restore();

      animIdRef.current = requestAnimationFrame(tick);
    };

    animIdRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [filterType, showInfluences]);

  // Coordinates translation
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
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
      alphaRef.current = 0.3; // Wake up simulation gently
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
      alphaRef.current = 0.3; // Keep moving connected nodes smoothly
    } else if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Check Hover without re-triggering simulation effect
      const hovered = nodesRef.current.find((n) => {
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
    const clickedNode = nodesRef.current.find((n) => {
      const dx = n.x - coords.x;
      const dy = n.y - coords.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      if (clickedNode.isEntry) {
        const fullEntry = entries.find((en) => en.id === clickedNode.id);
        if (fullEntry) {
          onSelectEntry(fullEntry);
        }
      } else if (clickedNode.parentId) {
        // Clicking an influence satellite selects its parent note!
        const fullEntry = entries.find((en) => en.id === clickedNode.parentId);
        if (fullEntry) {
          onSelectEntry(fullEntry);
        }
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
    alphaRef.current = 0.4;
  };

  // Safe toggle of Influences with orbital realignment
  const handleToggleInfluences = () => {
    const nextState = !showInfluences;
    setShowInfluences(nextState);
    if (nextState) {
      anchorSatellitesToParents(nodesRef.current, edgesRef.current);
    }
    alphaRef.current = 0.3;
  };

  // Human-readable format for influence categories
  const getInfluenceBadge = (type: string) => {
    if (type.includes("entity")) return "Entidade / Deidade";
    if (type.includes("candle")) return "Vela / Cor";
    if (type.includes("tool")) return "Arma / Instrumento";
    if (type.includes("incense")) return "Incenso / Perfume";
    if (type.includes("feeling")) return "Sentimento / Êxtase";
    if (type.includes("element")) return "Elemento / Tattwa";
    return "Correspondência 777";
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] bg-medium-900 rounded-xl border border-medium-700 overflow-hidden shadow-2xl flex flex-col select-none"
    >
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-medium-850/95 backdrop-blur-md p-1.5 rounded-lg border border-medium-700 pointer-events-auto shadow-xl max-w-full overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-medium-400 ml-1 mr-0.5 flex-shrink-0" />
          {[
            { id: "all", label: "Todas" },
            { id: "Diário", label: "Diário" },
            { id: "Estudo", label: "Estudo" },
            { id: "Visão Astral", label: "Visão Astral" },
            { id: "Sonho", label: "Sonho" },
            { id: "Oráculo", label: "Oráculo" },
            { id: "Prática", label: "Prática" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilterType(f.id);
                alphaRef.current = 0.3; // Re-energize gently
              }}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                filterType === f.id
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-medium-300 hover:text-white hover:bg-medium-800"
              }`}
            >
              <span>{f.label}</span>
            </button>
          ))}

          <button
            onClick={handleToggleInfluences}
            className={`px-2 py-0.5 rounded text-xs font-medium border transition-all whitespace-nowrap ${
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
        <span>Arraste os nós, role para zoom ou clique em qualquer nota/influência para inspecioná-la.</span>
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
            {hoveredNode.isEntry ? (
              <>
                <div>Categoria: <span className="text-white capitalize">{normalizeCategory(hoveredNode.type)}</span></div>
                {hoveredNode.success_rating !== undefined && (
                  <div>Sucesso Mágicko: <span className="text-white font-semibold">{hoveredNode.success_rating}/10</span></div>
                )}
                <div className="text-[10px] text-medium-400 pt-1">
                  Clique para abrir e inspecionar esta nota.
                </div>
              </>
            ) : (
              <>
                <div>Tipo: <span className="text-white">{getInfluenceBadge(hoveredNode.type)}</span></div>
                {hoveredNode.parentTitle && (
                  <div>Nota: <span className="text-medium-200">{hoveredNode.parentTitle}</span></div>
                )}
                <div className="text-[10px] text-medium-400 pt-1">
                  Correspondência de Liber 777 · Clique para abrir a nota vinculada.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
