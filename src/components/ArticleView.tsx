"use client";

import React, { useState, useRef } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { THOTH_TAROT_DECK, TAROT_SPREADS } from "@/lib/thothTarot";
import { getCategoryThelemicIcon } from "@/components/ThelemicIcons";
import { OracleTable, CardOnTable } from "@/components/OracleTable";
import { getDefaultTemplateForCategory } from "@/lib/templates";
import {
  Edit3,
  Trash2,
  Share2,
  Calendar,
  Compass,
  Star,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  Table,
  Plus,
  Link as LinkIcon,
  Check,
  X,
  RefreshCw,
  Eye,
  FileText,
  BookOpen,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ArticleViewProps {
  entry: MagickEntry | null;
  onUpdateEntry: (entry: Partial<MagickEntry>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  allEntries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNote: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

export function ArticleView({
  entry,
  onUpdateEntry,
  onDeleteEntry,
  allEntries,
  onSelectEntry,
  onNewNote,
  isZenMode = false,
  onToggleZenMode,
}: ArticleViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Edit States
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<CategoryName>("Prática");
  const [editRating, setEditRating] = useState<number>(8);
  const [editDate, setEditDate] = useState("");
  const [editThelemicDate, setEditThelemicDate] = useState("");
  const [editInfluences, setEditInfluences] = useState<{ category: string; name: string }[]>([]);
  const [newInfCat, setNewInfCat] = useState("entity");
  const [newInfVal, setNewInfVal] = useState("");
  const [editConnections, setEditConnections] = useState<
    { target_id: string; relationship_type: string; notes?: string }[]
  >([]);
  const [newConnId, setNewConnId] = useState("");
  const [newConnRel, setNewConnRel] = useState("result_of");

  // Oracle edit state
  const [editSpread, setEditSpread] = useState("Tiragem Livre");
  const [editQuery, setEditQuery] = useState("");
  const [editCards, setEditCards] = useState<CardOnTable[]>([]);
  const [editCardBackStyle, setEditCardBackStyle] = useState<"rosa_cruz" | "thelema">("rosa_cruz");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Enter edit mode
  const handleStartEdit = () => {
    if (!entry) return;
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditCategory(normalizeCategory(entry.type));
    setEditRating(entry.success_rating ?? 8);
    setEditDate(new Date(entry.date).toISOString().slice(0, 16));
    setEditThelemicDate(entry.thelemic_date || "");
    setEditInfluences(entry.influences || []);
    setEditConnections(entry.connections || []);

    if (entry.oracle_data) {
      setEditQuery(entry.oracle_data.query || "");
      setEditCards((entry.oracle_data.cards as CardOnTable[]) || []);
      setEditSpread(entry.oracle_data.spread_name || "Tiragem Livre");
      setEditCardBackStyle(entry.oracle_data.card_back_style || "rosa_cruz");
    } else {
      setEditQuery("");
      setEditCards([]);
      setEditSpread("Tiragem Livre");
      setEditCardBackStyle("rosa_cruz");
    }

    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!entry) return;
    await onUpdateEntry({
      id: entry.id,
      title: editTitle.trim(),
      content: editContent.trim(),
      type: editCategory,
      success_rating: editRating,
      date: new Date(editDate).toISOString(),
      thelemic_date: editThelemicDate,
      influences: editInfluences,
      connections: editConnections,
      oracle_data:
        editCategory === "Oráculo"
          ? {
              system: "thoth_tarot",
              spread_name: editSpread.trim() || "Mesa Oracular",
              query: editQuery.trim(),
              cards: editCards,
              card_back_style: editCardBackStyle,
            }
          : undefined,
    });
    setIsEditing(false);
  };

  // Formatting toolbar helper
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    const replacement = `${prefix}${selected || "texto"}${suffix}`;
    const newText = current.substring(0, start) + replacement + current.substring(end);
    setEditContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 10);
  };

  const handleInsertImage = () => {
    const url = prompt("Insira a URL da imagem (ou link direto):", "https://");
    if (url && url !== "https://") {
      const caption = prompt("Legenda da imagem (opcional):", "Ilustração do Ritual");
      insertFormatting(`\n![${caption || "Imagem"}](${url})\n`);
    }
  };

  const handleInsertTable = () => {
    const tableTemplate = `\n| Correspondência | Símbolo | Atribuição |\n| :--- | :---: | :--- |\n| Planeta | ☉ Sol | Tiphareth |\n| Elemento | 🔥 Fogo | Yod |\n\n`;
    insertFormatting(tableTemplate);
  };

  const handleExportMarkdown = () => {
    if (!entry) return;
    const frontmatter = [
      "---",
      `title: "${entry.title.replace(/"/g, '\\"')}"`,
      `type: "${normalizeCategory(entry.type)}"`,
      `date: "${entry.date}"`,
      `thelemic_date: "${entry.thelemic_date || ""}"`,
      `success_rating: ${entry.success_rating ?? 5}`,
      `moon_phase: "${entry.moon_phase || ""}"`,
      `moon_sign: "${entry.moon_sign || ""}"`,
      `sun_sign: "${entry.sun_sign || ""}"`,
      `influences: ${JSON.stringify(entry.influences || [])}`,
      "---",
      "",
      `# ${entry.title}`,
      "",
      entry.thelemic_date ? `> ☉ ${entry.thelemic_date}\n` : "",
      entry.content,
    ].join("\n");

    const blob = new Blob([frontmatter], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = entry.title.toLowerCase().replace(/[^a-z0-9]/gi, "_").slice(0, 40);
    link.href = url;
    link.download = `${entry.date.slice(0, 10)}_${sanitizedTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Keyboard Shortcuts (Ctrl+S to save, Ctrl+B for bold, Ctrl+I for italic, Esc to cancel)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save while editing
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (isEditing) {
          e.preventDefault();
          handleSaveEdit();
        }
      }
      // Ctrl+B or Cmd+B to toggle bold in textarea
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        if (isEditing && document.activeElement === textareaRef.current) {
          e.preventDefault();
          insertFormatting("**", "**");
        }
      }
      // Ctrl+I or Cmd+I to toggle italic in textarea
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        if (isEditing && document.activeElement === textareaRef.current) {
          e.preventDefault();
          insertFormatting("*", "*");
        }
      }
      // Esc to cancel editing
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditing,
    editTitle,
    editContent,
    editCategory,
    editRating,
    editDate,
    editThelemicDate,
    editInfluences,
    editConnections,
    editCards,
    editSpread,
    editQuery,
    editCardBackStyle,
  ]);

  // Reading time estimator
  const readingTime = entry ? Math.max(1, Math.ceil(entry.content.split(/\s+/).length / 200)) : 1;

  if (!entry) {
    return (
      <div className="flex-1 h-full bg-medium-900 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-medium-800 border border-medium-700 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-medium-300" />
        </div>
        <h2 className="text-xl font-serif font-bold text-white mb-2">
          Selecione uma nota ou inicie um novo registro
        </h2>
        <p className="text-xs text-medium-400 max-w-md mb-6 leading-relaxed">
          Seu diário mágico thelêmico é o livro sagrado de suas operações, sonhos, oráculos e estudos sob o método da ciência.
        </p>
        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-medium-200 text-black font-semibold text-xs rounded-md transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Escrever Nova Nota</span>
        </button>
      </div>
    );
  }

  // Render Formatted Markdown for reading mode
  const renderFormattedContent = (text: string) => {
    // Quick, clean markdown formatter for images, headers, bold, italic, underline, blockquotes
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      // Image: ![alt](url)
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        elements.push(
          <figure key={idx} className="my-6">
            <img src={imgMatch[2]} alt={imgMatch[1]} className="rounded-lg max-h-[500px] w-auto border border-medium-700 mx-auto" />
            {imgMatch[1] && (
              <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(<h1 key={idx} className="text-3xl font-bold font-sans text-white mt-8 mb-4">{line.replace(/^#\s+/, "")}</h1>);
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(<h2 key={idx} className="text-2xl font-semibold font-sans text-white mt-6 mb-3">{line.replace(/^##\s+/, "")}</h2>);
        return;
      }
      if (line.startsWith("### ")) {
        elements.push(<h3 key={idx} className="text-xl font-semibold font-sans text-medium-100 mt-5 mb-2">{line.replace(/^###\s+/, "")}</h3>);
        return;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={idx} className="border-l-2 border-white pl-4 my-4 italic text-medium-300 font-serif text-lg">
            {line.replace(/^>\s+/, "")}
          </blockquote>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-4" />);
        return;
      }

      // Standard Paragraph with inline bold, italic, underline
      elements.push(
        <p
          key={idx}
          className="my-3 text-medium-200 leading-relaxed font-serif text-[18px]"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em class='text-medium-100 italic'>$1</em>")
              .replace(/<u>(.*?)<\/u>/g, "<u class='underline underline-offset-4'>$1</u>")
              .replace(/`([^`]+)`/g, "<code class='bg-medium-800 px-1.5 py-0.5 rounded text-xs font-mono text-medium-200 border border-medium-700'>$1</code>"),
          }}
        />
      );
    });

    return elements;
  };

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto flex flex-col">
      {/* Top Reading Navigation Bar */}
      <div className="sticky top-0 z-30 bg-medium-900/95 backdrop-blur-md border-b border-medium-700/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full bg-medium-800 border border-medium-700 text-xs font-mono text-medium-300 uppercase tracking-wider font-semibold flex items-center gap-1.5">
            {getCategoryThelemicIcon(entry.type, "w-3.5 h-3.5 text-medium-300")}
            <span>{normalizeCategory(entry.type)}</span>
          </span>
          <span className="text-xs text-medium-400 font-mono">
            {new Date(entry.date).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {readingTime} min de leitura
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Modo Foco / Zen */}
          {onToggleZenMode && (
            <button
              onClick={onToggleZenMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                isZenMode
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border-medium-700"
              }`}
              title={isZenMode ? "Sair do Modo Foco (Ctrl+\\)" : "Ativar Modo Foco / Zen (Ctrl+\\)"}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isZenMode ? "Modo Normal" : "Modo Foco"}</span>
            </button>
          )}

          {!isEditing ? (
            <>
              {/* Exportar Markdown */}
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white rounded-md text-xs font-medium border border-medium-700 transition-colors"
                title="Exportar esta nota para arquivo Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar (.md)</span>
              </button>

              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-medium-800 hover:bg-medium-750 text-white rounded-md text-xs font-medium border border-medium-700 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Artigo</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir "${entry.title}"?`)) {
                    onDeleteEntry(entry.id);
                  }
                }}
                className="p-1.5 text-medium-400 hover:text-red-400 rounded hover:bg-medium-800 transition-colors"
                title="Excluir Registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-medium-300 hover:text-white text-xs font-medium rounded hover:bg-medium-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-medium-200 text-black rounded-md text-xs font-semibold shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Salvar Alterações</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        {!isEditing ? (
          /* ========================================================
             MEDIUM READING VIEW
             ======================================================== */
          <article className="space-y-6">
            {/* Title (Big Medium Editorial Heading) */}
            <h1 className="text-3xl md:text-5xl font-sans font-bold text-white tracking-tight leading-[1.15]">
              {entry.title}
            </h1>

            {/* Astrological / Thelemic Header Ribbon */}
            <div className="p-3.5 rounded-lg bg-medium-850 border border-medium-700 text-xs font-mono text-medium-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-white" />
                <span className="text-white font-semibold">
                  {entry.thelemic_date || "Thelemic Record"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {entry.moon_phase && (
                  <span>
                    {entry.moon_phase} ({entry.moon_illumination || 0}%)
                  </span>
                )}
                {entry.success_rating !== undefined && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-medium-800 border border-medium-700 text-white font-semibold">
                    <Star className="w-3 h-3 fill-white text-white" />
                    {entry.success_rating}/10
                  </span>
                )}
              </div>
            </div>

            {/* Influences Chips */}
            {entry.influences && entry.influences.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                {entry.influences.map((inf, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-medium-800 border border-medium-700 text-xs text-medium-300 font-mono"
                  >
                    <strong className="text-white capitalize">{inf.category}:</strong>
                    <span>{inf.name}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Oracle Cards Altar Cloth & Details (If Oracle) */}
            {entry.oracle_data && (
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-700 my-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Mesa Oracular do Altar — {entry.oracle_data.spread_name || "Disposição das Lâminas"}</span>
                  </h3>
                </div>

                {entry.oracle_data.query && (
                  <p className="text-sm text-medium-200 italic font-serif border-l-2 border-white pl-3 py-1">
                    "{entry.oracle_data.query}"
                  </p>
                )}

                {/* Mesa com as cartas espalhadas exatamente como no altar */}
                {entry.oracle_data.cards && entry.oracle_data.cards.length > 0 && (
                  <OracleTable
                    cards={entry.oracle_data.cards as CardOnTable[]}
                    isEditable={false}
                    query={entry.oracle_data.query}
                    spreadName={entry.oracle_data.spread_name}
                    cardBackStyle={entry.oracle_data.card_back_style || "rosa_cruz"}
                    onApplyInterpretation={async (text) => {
                      const updatedContent = entry.content + "\n\n### 🔮 Palpite Hermético do Frater Auxiliar:\n" + text;
                      await onUpdateEntry({
                        id: entry.id,
                        content: updatedContent,
                      });
                    }}
                  />
                )}

                {entry.oracle_data.confirmation_notes && (
                  <div className="text-xs text-medium-300 pt-2 border-t border-medium-800">
                    <strong className="text-white font-mono">Confirmação Fenomênica:</strong>{" "}
                    {entry.oracle_data.confirmation_notes}
                  </div>
                )}
              </div>
            )}

            {/* Article Body Content */}
            <div className="pt-4 border-t border-medium-800">
              {renderFormattedContent(entry.content)}
            </div>

            {/* Mental States */}
            {(entry.mental_state_before || entry.mental_state_after) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-medium-850 border border-medium-700 text-xs font-mono my-6">
                {entry.mental_state_before && (
                  <div>
                    <span className="text-medium-400 block mb-1">ESTADO MENTAL ANTERIOR:</span>
                    <span className="text-medium-200">{entry.mental_state_before}</span>
                  </div>
                )}
                {entry.mental_state_after && (
                  <div>
                    <span className="text-medium-400 block mb-1">ESTADO MENTAL POSTERIOR:</span>
                    <span className="text-white font-semibold">{entry.mental_state_after}</span>
                  </div>
                )}
              </div>
            )}

            {/* Connections Footer */}
            {entry.connections && entry.connections.length > 0 && (
              <div className="pt-8 border-t border-medium-800 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-medium-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-white" />
                  <span>Conexões Mágicas com Esta Nota</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {entry.connections.map((c, i) => {
                    const target = allEntries.find((e) => e.id === c.target_id);
                    return (
                      <div
                        key={i}
                        onClick={() => target && onSelectEntry(target)}
                        className="p-3 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-700 cursor-pointer transition-colors text-xs"
                      >
                        <div className="text-[10px] font-mono text-medium-400 mb-1">
                          {c.relationship_type === "result_of"
                            ? "Resultado de"
                            : c.relationship_type === "predicted_by"
                            ? "Profetizado por"
                            : c.relationship_type === "synchronic_with"
                            ? "Sincrônico com"
                            : "Referência de"}
                        </div>
                        <div className="font-semibold text-white truncate">
                          {target ? target.title : c.target_id}
                        </div>
                        {c.notes && (
                          <div className="text-[11px] text-medium-400 italic line-clamp-1 mt-0.5">
                            {c.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        ) : (
          /* ========================================================
             MEDIUM RICH EDITING VIEW
             ======================================================== */
          <div className="space-y-6">
            {/* Title Input */}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título da sua nota..."
              className="w-full bg-transparent text-3xl md:text-4xl font-sans font-bold text-white placeholder-medium-500 focus:outline-none border-b border-medium-700 pb-3"
            />

            {/* Category & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-medium-400 mb-1">
                  CATEGORIA
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => {
                    const newCat = e.target.value as CategoryName;
                    setEditCategory(newCat);
                    if (!editContent.trim() || editContent.includes("Descreva aqui os detalhes da operação")) {
                      setEditContent(getDefaultTemplateForCategory(newCat));
                    }
                  }}
                  className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-sans"
                >
                  <option value="Estudo">Estudo</option>
                  <option value="Visão Astral">Visão Astral</option>
                  <option value="Sonho">Sonho</option>
                  <option value="Oráculo">Oráculo</option>
                  <option value="Prática">Prática</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-medium-400 mb-1">
                  DATA & HORA
                </label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-medium-400 mb-1">
                  SUCESSO MÁGICKO ({editRating}/10)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Oracle Spread & Table Cloth Editor (quando categoria for Oráculo) */}
            {editCategory === "Oráculo" && (
              <div className="p-5 rounded-xl bg-medium-850 border border-medium-700 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Mesa Oracular do Altar (Lâminas & Disposição)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-medium-400">
                    Posicione as cartas livremente pela mesa, carregue imagens e gire conforme a tiragem
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-medium-400 mb-1">
                      PERGUNTA / PROPÓSITO DA CONSULTA
                    </label>
                    <input
                      type="text"
                      value={editQuery}
                      onChange={(e) => setEditQuery(e.target.value)}
                      placeholder="Ex: Qual a força em ação sobre esta operação?..."
                      className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-medium-400 mb-1">
                      NOME DA TIRAGEM
                    </label>
                    <input
                      type="text"
                      value={editSpread}
                      onChange={(e) => setEditSpread(e.target.value)}
                      placeholder="Ex: Tiragem Livre, Cruz Céltica, Hexagrama..."
                      className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-mono"
                    />
                  </div>
                </div>

                {/* The Interactive Table */}
                <OracleTable
                  cards={editCards}
                  onChange={setEditCards}
                  isEditable={true}
                  query={editQuery}
                  spreadName={editSpread}
                  cardBackStyle={editCardBackStyle}
                  onCardBackStyleChange={setEditCardBackStyle}
                  onApplyInterpretation={(text) => {
                    setEditContent((prev) => {
                      return prev + "\n\n### 🔮 Palpite Hermético do Frater Auxiliar:\n" + text;
                    });
                  }}
                />
              </div>
            )}

            {/* Rich Formatting Toolbar */}
            <div className="sticky top-14 z-20 bg-medium-850 p-2 rounded-lg border border-medium-700 flex flex-wrap items-center gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Negrito (Bold)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Itálico (Italic)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("<u>", "</u>")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Sublinhado (Underline)"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-5 bg-medium-700 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("# ")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded text-xs font-mono font-bold"
                title="Título H1 (Aumentar letra)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("## ")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded text-xs font-mono font-semibold"
                title="Subtítulo H2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded text-xs font-mono"
                title="Título Menor H3"
              >
                H3
              </button>

              <div className="w-[1px] h-5 bg-medium-700 mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Citação (Blockquote)"
              >
                <Quote className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleInsertImage}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Inserir Imagem"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Inserir Tabela de Correspondências"
              >
                <Table className="w-4 h-4" />
              </button>

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => {
                  if (editContent.trim()) {
                    if (!confirm(`Deseja carregar a estrutura canônica para "${editCategory}"? O texto atual será substituído pelo template.`)) {
                      return;
                    }
                  }
                  setEditContent(getDefaultTemplateForCategory(editCategory));
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-medium-300 hover:text-white hover:bg-medium-750 rounded border border-medium-700 transition-colors"
                title="Carregar Estrutura Canônica desta Categoria"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Carregar Estrutura ({editCategory})</span>
              </button>
            </div>

            {/* Content Textarea */}
            <div>
              <textarea
                ref={textareaRef}
                rows={16}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Escreva livremente com formatação rica, reflexões, invocações e visões..."
                className="w-full bg-medium-850 border border-medium-700 rounded-lg p-4 text-base font-serif text-white placeholder-medium-500 focus:outline-none focus:border-white leading-relaxed"
              />
            </div>

            {/* Influences Section */}
            <div className="p-4 rounded-lg bg-medium-850 border border-medium-700 space-y-3">
              <span className="block text-xs font-mono font-bold text-white uppercase">
                Influências Mágicas (Liber 777)
              </span>

              <div className="flex flex-wrap gap-2">
                {editInfluences.map((inf, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-medium-800 border border-medium-700 text-xs text-white"
                  >
                    <strong className="text-medium-400 capitalize">{inf.category}:</strong>
                    <span>{inf.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditInfluences(editInfluences.filter((_, idx) => idx !== i))}
                      className="text-medium-400 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={newInfCat}
                  onChange={(e) => setNewInfCat(e.target.value)}
                  className="bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="entity">Entidade / Deidade</option>
                  <option value="tool">Arma / Instrumento</option>
                  <option value="incense">Incenso / Perfume</option>
                  <option value="candle">Vela / Cor</option>
                  <option value="feeling">Sentimento / Êxtase</option>
                </select>

                <input
                  type="text"
                  value={newInfVal}
                  onChange={(e) => setNewInfVal(e.target.value)}
                  placeholder="Nome (ex: Babalon, Olíbano, Espada)..."
                  className="flex-1 bg-medium-800 border border-medium-700 rounded px-3 py-1.5 text-xs text-white placeholder-medium-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newInfVal.trim()) {
                        setEditInfluences([...editInfluences, { category: newInfCat, name: newInfVal.trim() }]);
                        setNewInfVal("");
                      }
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (newInfVal.trim()) {
                      setEditInfluences([...editInfluences, { category: newInfCat, name: newInfVal.trim() }]);
                      setNewInfVal("");
                    }
                  }}
                  className="px-3 py-1.5 bg-white text-black font-semibold text-xs rounded hover:bg-medium-200"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-medium-700">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-medium-300 hover:text-white"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-white text-black font-semibold text-xs rounded shadow-sm hover:bg-medium-200"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
