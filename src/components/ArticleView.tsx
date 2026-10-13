"use client";

import React, { useState, useRef } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { THOTH_TAROT_DECK, TAROT_SPREADS } from "@/lib/thothTarot";
import { getCategoryThelemicIcon, ThelemicDateDisplay, ZodiacIcon } from "@/components/ThelemicIcons";
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
  ArrowLeft,
  Video,
  Palette,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ImageInsertModal, VideoInsertModal } from "@/components/MediaInsertModais";

interface ArticleViewProps {
  entry: MagickEntry | null;
  onUpdateEntry: (entry: Partial<MagickEntry>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  allEntries: MagickEntry[];
  onSelectEntry: (entry: MagickEntry) => void;
  onNewNote: () => void;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
  onBackToHome?: () => void;
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
  onBackToHome,
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

  // Reading Width / Margin State (with LocalStorage persistence)
  const [readingWidth, setReadingWidth] = useState<number>(780);
  const [isMarginPopoverOpen, setIsMarginPopoverOpen] = useState(false);

  // Color Picker & Media Modals State
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedCustomColor, setSelectedCustomColor] = useState("#E5B842");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Paleta de Cores Mágickas Thelêmicas
  const THELEMIC_COLORS = [
    { name: "Ouro Solar (Thelema / Hadit)", color: "#E5B842" },
    { name: "Rubi / Escarlate (Babalon)", color: "#EF4444" },
    { name: "Azul Celestial (Nuit)", color: "#3B82F6" },
    { name: "Verde Esmeralda (Vênus / Astarte)", color: "#10B981" },
    { name: "Púrpura Astral (Júpiter / Ámon)", color: "#A855F7" },
    { name: "Laranja Hermético (Hod / Thoth)", color: "#F97316" },
    { name: "Rosa Mágicko (Tiphareth)", color: "#EC4899" },
    { name: "Prata Lunar (Nox / Yesod)", color: "#E2E8F0" },
    { name: "Branco Puro (Kether / LVX)", color: "#FFFFFF" },
    { name: "Cinza Etéreo", color: "#9CA3AF" },
  ];

  // Carrega largura salva de margem do localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("magick_diary_reading_width");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 550 && parsed <= 1600) {
          setReadingWidth(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const changeReadingWidth = (newWidth: number) => {
    setReadingWidth(newWidth);
    try {
      localStorage.setItem("magick_diary_reading_width", newWidth.toString());
    } catch (e) {}
  };

  // Autosave Draft State
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [hasRecoverableDraft, setHasRecoverableDraft] = useState(false);
  const [recoverableDraft, setRecoverableDraft] = useState<any | null>(null);

  // Check for recoverable draft when entry changes
  React.useEffect(() => {
    if (!entry) {
      setHasRecoverableDraft(false);
      setRecoverableDraft(null);
      return;
    }
    try {
      const key = `magick_draft_${entry.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (parsed.content !== entry.content || parsed.title !== entry.title) &&
          Date.now() - (parsed.timestamp || 0) < 7 * 24 * 3600 * 1000
        ) {
          setHasRecoverableDraft(true);
          setRecoverableDraft(parsed);
          return;
        }
      }
    } catch (e) {}
    setHasRecoverableDraft(false);
    setRecoverableDraft(null);
  }, [entry?.id, entry?.content, entry?.title]);

  const handleRestoreDraft = () => {
    if (!recoverableDraft) return;
    if (recoverableDraft.title !== undefined) setEditTitle(recoverableDraft.title);
    if (recoverableDraft.content !== undefined) setEditContent(recoverableDraft.content);
    if (recoverableDraft.category !== undefined) setEditCategory(recoverableDraft.category);
    if (recoverableDraft.rating !== undefined) setEditRating(recoverableDraft.rating);
    if (recoverableDraft.date !== undefined) setEditDate(recoverableDraft.date);
    if (recoverableDraft.thelemicDate !== undefined) setEditThelemicDate(recoverableDraft.thelemicDate);
    if (recoverableDraft.influences !== undefined) setEditInfluences(recoverableDraft.influences);
    if (recoverableDraft.connections !== undefined) setEditConnections(recoverableDraft.connections);
    setHasRecoverableDraft(false);
  };

  const handleDiscardDraft = () => {
    if (entry) {
      try {
        localStorage.removeItem(`magick_draft_${entry.id}`);
      } catch (e) {}
    }
    setHasRecoverableDraft(false);
    setRecoverableDraft(null);
  };

  // Autosave to localStorage while editing with 1s debounce
  React.useEffect(() => {
    if (!isEditing || !entry) return;

    const isDirty =
      editTitle !== entry.title ||
      editContent !== entry.content ||
      editCategory !== normalizeCategory(entry.type) ||
      editRating !== (entry.success_rating ?? 8);

    if (!isDirty) return;

    const timer = setTimeout(() => {
      try {
        const key = `magick_draft_${entry.id}`;
        const draftData = {
          title: editTitle,
          content: editContent,
          category: editCategory,
          rating: editRating,
          date: editDate,
          thelemicDate: editThelemicDate,
          influences: editInfluences,
          connections: editConnections,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(draftData));
        setDraftSavedTime(
          new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } catch (e) {}
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isEditing,
    entry,
    editTitle,
    editContent,
    editCategory,
    editRating,
    editDate,
    editThelemicDate,
    editInfluences,
    editConnections,
  ]);

  // Window beforeunload warning if unsaved changes exist
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && entry && (editTitle !== entry.title || editContent !== entry.content)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, entry, editTitle, editContent]);

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

  const handleCancelEdit = () => {
    const isDirty =
      entry &&
      (editTitle !== entry.title ||
        editContent !== entry.content ||
        editCategory !== normalizeCategory(entry.type));

    if (isDirty) {
      if (!confirm("Existem alterações não salvas. Deseja sair do modo de edição? Seu rascunho continuará salvo localmente.")) {
        return;
      }
    }
    setIsEditing(false);
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

    if (entry) {
      try {
        localStorage.removeItem(`magick_draft_${entry.id}`);
      } catch (e) {}
    }
    setDraftSavedTime(null);
    setHasRecoverableDraft(false);
    setRecoverableDraft(null);
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

  // Aplica cor do texto na seleção
  const applyTextColor = (color: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    const replacement = `<span style="color: ${color}">${selected || "texto colorido"}</span>`;
    const newText = current.substring(0, start) + replacement + current.substring(end);
    setEditContent(newText);
    setIsColorPickerOpen(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + `<span style="color: ${color}">`.length,
        start + replacement.length - "</span>".length
      );
    }, 10);
  };

  const handleInsertImage = () => {
    setIsImageModalOpen(true);
  };

  const handleInsertVideo = () => {
    setIsVideoModalOpen(true);
  };

  const handleInsertTable = () => {
    const tableTemplate = `\n| Correspondência | Símbolo | Atribuição | Efeito / Notas |\n| :--- | :---: | :---: | :--- |\n| Planeta | ☉ Sol | Tiphareth | Consciência solar plena |\n| Elemento | 🔥 Fogo | Yod | Foco da Verdadeira Vontade |\n| Incenso | Olibano | Ar | Purificação do templo |\n\n`;
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

  // Helper para formatar markdown inline com cores, negrito, itálico, etc.
  const renderInlineMarkdown = (line: string): string => {
    return line
      // Cores via HTML span
      .replace(/<span\s+style=["']color:\s*([^"';]+);?["']>(.*?)<\/span>/gi, "<span style='color: $1'>$2</span>")
      // Cores via tags amigáveis <color=...> ou <color name=...>
      .replace(/<color=([^>]+)>(.*?)<\/color>/gi, "<span style='color: $1'>$2</span>")
      .replace(/<color\s+name=["']?([^"'>]+)["']?>(.*?)<\/color>/gi, "<span style='color: $1'>$2</span>")
      // Negrito
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      // Itálico
      .replace(/\*(.*?)\*/g, "<em class='text-medium-100 italic'>$1</em>")
      // Sublinhado
      .replace(/<u>(.*?)<\/u>/gi, "<u class='underline underline-offset-4'>$1</u>")
      // Código inline
      .replace(/`([^`]+)`/g, "<code class='bg-medium-800 px-1.5 py-0.5 rounded text-xs font-mono text-medium-200 border border-medium-700'>$1</code>")
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' class='text-white underline underline-offset-2 hover:text-medium-300'>$1</a>");
  };

  // Render Formatted Markdown for reading mode (Tabelas, Vídeos, Imagens, Títulos, Citações)
  const renderFormattedContent = (text: string) => {
    const rawLines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    const parseTableRow = (row: string): string[] => {
      let trimmed = row.trim();
      if (trimmed.startsWith("|")) trimmed = trimmed.substring(1);
      if (trimmed.endsWith("|")) trimmed = trimmed.substring(0, trimmed.length - 1);
      return trimmed.split("|").map((c) => c.trim());
    };

    const isTableSeparator = (row: string): boolean => {
      const trimmed = row.trim();
      return /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(trimmed);
    };

    const getAlignments = (sepRow: string): ("left" | "center" | "right")[] => {
      const cells = parseTableRow(sepRow);
      return cells.map((cell) => {
        const starts = cell.startsWith(":");
        const ends = cell.endsWith(":");
        if (starts && ends) return "center";
        if (ends) return "right";
        return "left";
      });
    };

    const getYouTubeId = (url: string): string | null => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const getVimeoId = (url: string): string | null => {
      const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|video\/|)(\d+)/);
      return match && match[2] ? match[2] : null;
    };

    const isVideoUrl = (url: string): boolean => {
      return (
        getYouTubeId(url) !== null ||
        getVimeoId(url) !== null ||
        /\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(url) ||
        url.startsWith("/uploads/")
      );
    };

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmedLine = line.trim();

      // 1. Bloco de Tabela Markdown
      if (
        trimmedLine.includes("|") &&
        i + 1 < rawLines.length &&
        isTableSeparator(rawLines[i + 1])
      ) {
        const headerRow = line;
        const separatorRow = rawLines[i + 1];
        const headers = parseTableRow(headerRow);
        const alignments = getAlignments(separatorRow);
        const rows: string[][] = [];

        i += 2;
        while (i < rawLines.length && rawLines[i].trim().includes("|") && rawLines[i].trim().length > 0) {
          rows.push(parseTableRow(rawLines[i]));
          i++;
        }

        elements.push(
          <div
            key={`table-${i}`}
            className="overflow-x-auto my-6 rounded-xl border border-medium-700 bg-medium-850/60 shadow-md"
          >
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead className="bg-medium-800/90 text-white font-semibold border-b border-medium-700">
                <tr>
                  {headers.map((h, hIdx) => {
                    const align = alignments[hIdx] || "left";
                    const alignClass =
                      align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                    return (
                      <th
                        key={hIdx}
                        className={`px-4 py-3 text-xs font-mono uppercase tracking-wider ${alignClass}`}
                        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(h) }}
                      />
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-medium-750">
                {rows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-medium-800/40 transition-colors">
                    {r.map((cell, cIdx) => {
                      const align = alignments[cIdx] || "left";
                      const alignClass =
                        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                      return (
                        <td
                          key={cIdx}
                          className={`px-4 py-3 text-medium-200 font-serif text-[15px] leading-relaxed ${alignClass}`}
                          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cell) }}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // 2. Bloco de Vídeo: ![video:caption](url) ou ![video](url) ou tag <video ...>
      const videoSyntaxMatch = trimmedLine.match(/^!\[video(?::(.*?))?\]\((.*?)\)/i);
      const htmlVideoMatch = trimmedLine.match(/<video[^>]*src=["']([^"']+)["'][^>]*>/i);

      if (videoSyntaxMatch || htmlVideoMatch) {
        const url = videoSyntaxMatch ? videoSyntaxMatch[2].trim() : htmlVideoMatch![1].trim();
        const caption = videoSyntaxMatch ? videoSyntaxMatch[1]?.trim() : "";
        const ytId = getYouTubeId(url);
        const vimeoId = getVimeoId(url);

        if (ytId) {
          elements.push(
            <figure key={`video-${i}`} className="my-6">
              <div className="relative w-full rounded-xl overflow-hidden border border-medium-700 bg-black shadow-md aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                  title={caption || "Vídeo"}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {caption && (
                <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        } else if (vimeoId) {
          elements.push(
            <figure key={`video-${i}`} className="my-6">
              <div className="relative w-full rounded-xl overflow-hidden border border-medium-700 bg-black shadow-md aspect-video">
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  title={caption || "Vídeo Vimeo"}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {caption && (
                <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        } else {
          elements.push(
            <figure key={`video-${i}`} className="my-6">
              <div className="rounded-xl overflow-hidden border border-medium-700 bg-black shadow-md">
                <video
                  src={url}
                  controls
                  playsInline
                  className="w-full max-h-[550px] mx-auto bg-black"
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
              {caption && (
                <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
        }
        i++;
        continue;
      }

      // 3. Bloco de Imagem: ![alt](url)
      const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const url = imgMatch[2].trim();

        if (isVideoUrl(url)) {
          const ytId = getYouTubeId(url);
          if (ytId) {
            elements.push(
              <figure key={`video-embed-${i}`} className="my-6">
                <div className="relative w-full rounded-xl overflow-hidden border border-medium-700 bg-black shadow-md aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                    title={alt || "Vídeo"}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
                {alt && <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">{alt}</figcaption>}
              </figure>
            );
            i++;
            continue;
          }
        }

        elements.push(
          <figure key={`img-${i}`} className="my-6">
            <img
              src={url}
              alt={alt}
              className="rounded-lg max-h-[500px] w-auto border border-medium-700 mx-auto shadow-sm"
            />
            {alt && (
              <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        i++;
        continue;
      }

      // 4. Headers
      if (trimmedLine.startsWith("# ")) {
        elements.push(
          <h1
            key={`h1-${i}`}
            className="text-3xl font-bold font-sans text-white mt-8 mb-4 tracking-tight"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^#\s+/, "")) }}
          />
        );
        i++;
        continue;
      }
      if (trimmedLine.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-2xl font-semibold font-sans text-white mt-6 mb-3 tracking-tight"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^##\s+/, "")) }}
          />
        );
        i++;
        continue;
      }
      if (trimmedLine.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-xl font-semibold font-sans text-medium-100 mt-5 mb-2"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^###\s+/, "")) }}
          />
        );
        i++;
        continue;
      }
      if (trimmedLine.startsWith("#### ")) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-lg font-semibold font-sans text-medium-200 mt-4 mb-2"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^####\s+/, "")) }}
          />
        );
        i++;
        continue;
      }

      // 5. Blockquote
      if (trimmedLine.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="border-l-2 border-white pl-4 my-4 italic text-medium-300 font-serif text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^>\s+/, "")) }}
          />
        );
        i++;
        continue;
      }

      // 6. Horizontal Rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
        elements.push(<hr key={`hr-${i}`} className="border-t border-medium-700 my-8" />);
        i++;
        continue;
      }

      // 7. Lists
      if (/^[-*]\s+/.test(trimmedLine)) {
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 my-1.5 ml-2 text-medium-200 font-serif text-[17px]">
            <span className="w-1.5 h-1.5 rounded-full bg-medium-400 mt-2 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^[-*]\s+/, "")) }} />
          </div>
        );
        i++;
        continue;
      }
      if (/^\d+\.\s+/.test(trimmedLine)) {
        const numMatch = trimmedLine.match(/^(\d+)\.\s+/);
        const num = numMatch ? numMatch[1] : "1";
        elements.push(
          <div key={`oli-${i}`} className="flex items-start gap-2.5 my-1.5 ml-2 text-medium-200 font-serif text-[17px]">
            <span className="text-xs font-mono text-medium-400 mt-1 shrink-0 font-semibold">{num}.</span>
            <span dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine.replace(/^\d+\.\s+/, "")) }} />
          </div>
        );
        i++;
        continue;
      }

      // 8. Empty line
      if (!trimmedLine) {
        elements.push(<div key={`empty-${i}`} className="h-3" />);
        i++;
        continue;
      }

      // 9. Standard Paragraph
      elements.push(
        <p
          key={`p-${i}`}
          className="my-3 text-medium-200 leading-relaxed font-serif text-[18px]"
          dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(trimmedLine) }}
        />
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="flex-1 h-full bg-medium-900 overflow-y-auto flex flex-col">
      {/* Top Reading Navigation Bar */}
      <div className="sticky top-0 z-30 bg-medium-900/95 backdrop-blur-md border-b border-medium-700/80 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 -ml-2 rounded-md text-medium-400 hover:text-white hover:bg-medium-800 transition-colors"
              title="Voltar para a Tela Inicial (Home)"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
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
          {/* Botão de Margem / Largura de Leitura */}
          <div className="relative">
            <button
              onClick={() => setIsMarginPopoverOpen(!isMarginPopoverOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                isMarginPopoverOpen
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border-medium-700"
              }`}
              title="Ajustar Margens e Largura da Área de Leitura / Edição"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Margem ({readingWidth}px)</span>
            </button>

            {isMarginPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-medium-850 border border-medium-700 rounded-xl p-4 shadow-2xl z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-medium-750">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    <span>Margem & Largura</span>
                  </span>
                  <span className="text-[11px] font-mono text-medium-300 font-bold bg-medium-800 px-1.5 py-0.5 rounded border border-medium-700">
                    {readingWidth}px
                  </span>
                </div>

                {/* Presets Rápidos */}
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => changeReadingWidth(680)}
                    className={`p-2 rounded text-left transition-colors border ${
                      readingWidth === 680
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                    }`}
                  >
                    Estreita
                    <span className="block text-[10px] opacity-70">680px · Livro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeReadingWidth(780)}
                    className={`p-2 rounded text-left transition-colors border ${
                      readingWidth === 780
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                    }`}
                  >
                    Padrão
                    <span className="block text-[10px] opacity-70">780px · Medium</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeReadingWidth(1050)}
                    className={`p-2 rounded text-left transition-colors border ${
                      readingWidth === 1050
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                    }`}
                  >
                    Ampla
                    <span className="block text-[10px] opacity-70">1050px · Tabelas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeReadingWidth(1380)}
                    className={`p-2 rounded text-left transition-colors border ${
                      readingWidth === 1380
                        ? "bg-white text-black font-semibold border-white"
                        : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                    }`}
                  >
                    Total
                    <span className="block text-[10px] opacity-70">1380px · Tela</span>
                  </button>
                </div>

                {/* Slider de Ajuste Fino */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-medium-400">
                    <span>Mais margem (600px)</span>
                    <span>Menos margem (1500px)</span>
                  </div>
                  <input
                    type="range"
                    min={600}
                    max={1500}
                    step={20}
                    value={readingWidth}
                    onChange={(e) => changeReadingWidth(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

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
              {draftSavedTime && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-medium-400 bg-medium-800/80 px-2 py-1 rounded border border-medium-700/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salvo {draftSavedTime}</span>
                </span>
              )}
              <button
                onClick={handleCancelEdit}
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

      {/* Main Canvas Area com largura de margem dinâmica */}
      <div
        className="flex-1 w-full mx-auto px-4 sm:px-6 py-10 transition-all duration-200"
        style={{ maxWidth: `${readingWidth}px` }}
      >
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
                <Compass className="w-4 h-4 text-white shrink-0" />
                <ThelemicDateDisplay thelemicDate={entry.thelemic_date} />
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
            {/* Recuperação de Rascunho Não Salvo */}
            {hasRecoverableDraft && recoverableDraft && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Rascunho automático encontrado!</span>
                    <span className="block text-[11px] text-amber-300/80">
                      Há alterações salvas neste dispositivo em{" "}
                      {new Date(recoverableDraft.timestamp || Date.now()).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded text-xs transition-colors shadow-sm"
                  >
                    Restaurar Rascunho
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="px-2.5 py-1.5 text-amber-300 hover:text-white text-xs transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

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
                  <option value="Diário">Diário (Mundano / Cotidiano)</option>
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

              {/* Seletor de Cores de Texto */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                    isColorPickerOpen
                      ? "bg-white text-black font-semibold"
                      : "text-medium-300 hover:text-white hover:bg-medium-750"
                  }`}
                  title="Cor do Texto (Letras Coloridas)"
                >
                  <Palette className="w-4 h-4" />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block shadow-sm"
                    style={{ backgroundColor: selectedCustomColor }}
                  />
                </button>

                {isColorPickerOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-medium-850 border border-medium-700 rounded-xl p-3 shadow-2xl z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-medium-750">
                      <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" />
                        <span>Cores das Letras</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen(false)}
                        className="text-medium-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Grid de Cores Thelêmicas */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {THELEMIC_COLORS.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => {
                            setSelectedCustomColor(c.color);
                            applyTextColor(c.color);
                          }}
                          className="w-9 h-9 rounded-lg border border-medium-700/80 hover:scale-110 hover:border-white transition-all flex items-center justify-center relative group shadow-sm"
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-50">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Seletor Customizado Nativo */}
                    <div className="pt-2 border-t border-medium-750 flex items-center justify-between gap-2">
                      <label className="text-[11px] font-mono text-medium-300">Personalizada:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedCustomColor}
                          onChange={(e) => {
                            setSelectedCustomColor(e.target.value);
                            applyTextColor(e.target.value);
                          }}
                          className="w-7 h-7 rounded border border-medium-700 cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] font-mono text-medium-400 font-semibold">{selectedCustomColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                title="Inserir Imagem (via URL ou Upload)"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleInsertVideo}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Inserir Vídeo (via URL do YouTube/Vimeo ou Arquivo Local)"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleInsertTable}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Inserir Tabela Formatada de Correspondências"
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

      {/* Modais de Inserção de Imagem e Vídeo */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(url, caption) => {
          insertFormatting(`\n![${caption || "Imagem"}](${url})\n`);
        }}
      />

      <VideoInsertModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsert={(url, caption) => {
          insertFormatting(`\n![video:${caption || "Vídeo"}](${url})\n`);
        }}
      />
    </div>
  );
}
