"use client";

import React, { useState, useRef } from "react";
import { MagickEntry, normalizeCategory, CategoryName } from "@/lib/types";
import { THOTH_TAROT_DECK, TAROT_SPREADS, ThothCard } from "@/lib/thothTarot";
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
  Link2,
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
  Mic,
  Square,
  Volume2,
  Columns,
  Info,
  ShieldAlert,
  CheckSquare,
  Highlighter,
  Strikethrough,
  Layers,
  Search,
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
  autoEdit?: boolean;
  onClearAutoEdit?: () => void;
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
  autoEdit = false,
  onClearAutoEdit,
}: ArticleViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Edit States
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<CategoryName>("Prática");
  const [hasRating, setHasRating] = useState<boolean>(true);
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
  const [editQuerentName, setEditQuerentName] = useState("");
  const [editQuerentBirthdate, setEditQuerentBirthdate] = useState("");
  const [editCards, setEditCards] = useState<CardOnTable[]>([]);
  const [editCardBackStyle, setEditCardBackStyle] = useState<"rosa_cruz" | "thelema">("rosa_cruz");
  const [hasOracleTable, setHasOracleTable] = useState<boolean>(false);

  // Editor Layout: "edit" (padrão) ou "split" (tela dividida com preview ao vivo)
  const [editorLayout, setEditorLayout] = useState<"edit" | "split">("edit");

  // Menus Flutuantes
  const [isSymbolsMenuOpen, setIsSymbolsMenuOpen] = useState(false);
  const [isCalloutsMenuOpen, setIsCalloutsMenuOpen] = useState(false);
  const [isNoteLinkMenuOpen, setIsNoteLinkMenuOpen] = useState(false);
  const [noteLinkSearch, setNoteLinkSearch] = useState("");

  // Gravação de Áudio / Voz Nativo
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Reading Width / Margin State (with LocalStorage persistence)
  const [readingWidth, setReadingWidth] = useState<number>(780);
  const [isMarginPopoverOpen, setIsMarginPopoverOpen] = useState(false);

  // Tipografia (Família & Tamanho da Fonte com persistência)
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [fontSize, setFontSize] = useState<number>(17);

  // Cartas de Tarot Inline & Lightbox Zoom
  const [isTarotPickerOpen, setIsTarotPickerOpen] = useState(false);
  const [tarotPickerSearch, setTarotPickerSearch] = useState("");
  const [selectedTarotCardForZoom, setSelectedTarotCardForZoom] = useState<ThothCard | null>(null);

  // Color Picker & Media Modals State
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedCustomColor, setSelectedCustomColor] = useState("#E5B842");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Símbolos Mágickos Herméticos & Thelêmicos
  const HERMETIC_SYMBOLS = [
    {
      group: "Planetas & Astros (777)",
      symbols: [
        { char: "☉", name: "Sol (Tiphareth)" },
        { char: "☽", name: "Lua (Yesod)" },
        { char: "☿", name: "Mercúrio (Hod)" },
        { char: "♀", name: "Vênus (Netzach)" },
        { char: "♂", name: "Marte (Geburah)" },
        { char: "♃", name: "Júpiter (Chesed)" },
        { char: "♄", name: "Saturno (Binah)" },
        { char: "♅", name: "Urano" },
        { char: "♆", name: "Netuno" },
        { char: "♇", name: "Plutão" },
      ],
    },
    {
      group: "Elementos & Chaves Herméticas",
      symbols: [
        { char: "🜂", name: "Fogo (Yod)" },
        { char: "🜄", name: "Água (Heh)" },
        { char: "🜁", name: "Ar (Vau)" },
        { char: "🜃", name: "Terra (Heh final)" },
        { char: "🁢", name: "Espírito / Quintessência" },
        { char: "⛤", name: "Pentagrama Mágicko" },
        { char: "🝤", name: "Rosa-Cruz Hermética" },
        { char: "𓁹", name: "Olho de Hórus" },
        { char: "☥", name: "Ankh (Chave da Vida)" },
        { char: "⚚", name: "Caduceu de Hermes" },
        { char: "∴", name: "Três Pontos Iluminados" },
      ],
    },
    {
      group: "Zodíaco & Constelações",
      symbols: [
        { char: "♈", name: "Áries" },
        { char: "♉", name: "Touro" },
        { char: "♊", name: "Gêmeos" },
        { char: "♋", name: "Câncer" },
        { char: "♌", name: "Leão" },
        { char: "♍", name: "Virgem" },
        { char: "♎", name: "Libra" },
        { char: "♏", name: "Escorpião" },
        { char: "♐", name: "Sagitário" },
        { char: "♑", name: "Capricórnio" },
        { char: "♒", name: "Aquário" },
        { char: "♓", name: "Peixes" },
      ],
    },
  ];

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

  // Carrega largura salva de margem e tipografia do localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("magick_diary_reading_width");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 550 && parsed <= 1600) {
          setReadingWidth(parsed);
        }
      }
      const savedFont = localStorage.getItem("magick_diary_font_family");
      if (savedFont === "serif" || savedFont === "sans" || savedFont === "mono") {
        setFontFamily(savedFont);
      }
      const savedSize = localStorage.getItem("magick_diary_font_size");
      if (savedSize) {
        const parsedSize = parseInt(savedSize, 10);
        if (!isNaN(parsedSize) && parsedSize >= 13 && parsedSize <= 26) {
          setFontSize(parsedSize);
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

  const changeFontFamily = (font: "serif" | "sans" | "mono") => {
    setFontFamily(font);
    try {
      localStorage.setItem("magick_diary_font_family", font);
    } catch (e) {}
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    try {
      localStorage.setItem("magick_diary_font_size", size.toString());
    } catch (e) {}
  };

  const getFontClass = () => {
    if (fontFamily === "sans") return "font-sans";
    if (fontFamily === "mono") return "font-mono";
    return "font-serif";
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
    if (recoverableDraft.hasRating !== undefined) setHasRating(recoverableDraft.hasRating);
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

    const initialHasRating = entry.success_rating !== undefined && entry.success_rating !== null;
    const isDirty =
      editTitle !== entry.title ||
      editContent !== entry.content ||
      editCategory !== normalizeCategory(entry.type) ||
      hasRating !== initialHasRating ||
      (hasRating && editRating !== (entry.success_rating ?? 8));

    if (!isDirty) return;

    const timer = setTimeout(() => {
      try {
        const key = `magick_draft_${entry.id}`;
        const draftData = {
          title: editTitle,
          content: editContent,
          category: editCategory,
          hasRating,
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
    hasRating,
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
    const entryHasRating = entry.success_rating !== undefined && entry.success_rating !== null;
    setHasRating(entryHasRating);
    setEditRating(entryHasRating ? entry.success_rating! : 8);
    setEditDate(new Date(entry.date).toISOString().slice(0, 16));
    setEditThelemicDate(entry.thelemic_date || "");
    setEditInfluences(entry.influences || []);
    setEditConnections(entry.connections || []);

    const hasExistingCards = !!(entry.oracle_data && entry.oracle_data.cards && entry.oracle_data.cards.length > 0);
    if (entry.oracle_data) {
      setEditQuery(entry.oracle_data.query || "");
      setEditQuerentName(entry.oracle_data.querent_name || "");
      setEditQuerentBirthdate(entry.oracle_data.querent_birthdate || "");
      setEditCards((entry.oracle_data.cards as CardOnTable[]) || []);
      setEditSpread(entry.oracle_data.spread_name || "Tiragem Livre");
      setEditCardBackStyle(entry.oracle_data.card_back_style || "rosa_cruz");
      setHasOracleTable(hasExistingCards);
    } else {
      setEditQuery("");
      setEditQuerentName("");
      setEditQuerentBirthdate("");
      setEditCards([]);
      setEditSpread("Tiragem Livre");
      setEditCardBackStyle("rosa_cruz");
      setHasOracleTable(false);
    }

    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  // Auto-edit hook when requested by parent (ex: ao criar nova nota)
  React.useEffect(() => {
    if (autoEdit && entry && !isEditing) {
      handleStartEdit();
      onClearAutoEdit?.();
    }
  }, [autoEdit, entry?.id]);

  const handleToggleOracleTable = () => {
    setHasOracleTable((prev) => !prev);
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
      success_rating: hasRating ? editRating : null,
      date: new Date(editDate).toISOString(),
      thelemic_date: editThelemicDate,
      sun_sign: entry.sun_sign,
      sun_degree: entry.sun_degree,
      moon_sign: entry.moon_sign,
      moon_degree: entry.moon_degree,
      moon_phase: entry.moon_phase,
      moon_illumination: entry.moon_illumination,
      planetary_day: entry.planetary_day,
      planetary_hour: entry.planetary_hour,
      influences: editInfluences,
      connections: editConnections,
      oracle_data:
        hasOracleTable && editCards.length > 0
          ? {
              system: "thoth_tarot",
              spread_name: editSpread.trim() || "Mesa Oracular",
              query: editQuery.trim(),
              cards: editCards,
              card_back_style: editCardBackStyle,
              querent_name: editQuerentName.trim(),
              querent_birthdate: editQuerentBirthdate,
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

  // Inserir carimbo do trânsito astral atual no cursor
  const handleInsertAstralStamp = async () => {
    try {
      const res = await fetch("/api/astronomy");
      const astro = await res.json();
      if (astro.success) {
        const stamp = `\n> ☉ **Trânsito Astral:** Sol em ${astro.sunDegree}° ${astro.sunSign} · ☽ Lua em ${astro.moonDegree}° ${astro.moonSign} (${astro.moonPhaseName}, ${astro.moonIllumination}%) · Dia: ${astro.planetaryDay} · Hora: ${astro.planetaryHour}\n\n`;
        insertFormatting(stamp);
      } else {
        insertFormatting(`\n> ☉ **Trânsito Astral:** Sol em Tiphareth · ☽ Lua em Yesod\n\n`);
      }
    } catch (e) {
      insertFormatting(`\n> ☉ **Trânsito Astral:** Sol em Tiphareth · ☽ Lua em Yesod\n\n`);
    }
  };

  // Inserir selo thelêmico formal de encerramento
  const handleInsertThelemicSeal = () => {
    insertFormatting(`\n\n---\n**∴ 93 93/93 ∴**\n*Amor é a lei, amor sob vontade.*\n\n`);
  };

  // Inserir item de checklist no cursor
  const handleInsertChecklist = () => {
    insertFormatting("\n- [ ] ");
  };

  // Alternar checklist na leitura ou preview
  const handleToggleChecklist = async (lineIdx: number) => {
    if (!entry) return;
    const lines = (isEditing ? editContent : entry.content).split("\n");
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const targetLine = lines[lineIdx];
    const match = targetLine.match(/^([-*])\s+\[([ xX])\]\s*(.*)$/);
    if (!match) return;

    const currentChecked = match[2].toLowerCase() === "x";
    const newChecked = currentChecked ? " " : "x";
    lines[lineIdx] = `${match[1]} [${newChecked}] ${match[3]}`;
    const newContent = lines.join("\n");

    setEditContent(newContent);
    if (!isEditing) {
      await onUpdateEntry({
        id: entry.id,
        content: newContent,
      });
    }
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

  // Inserir símbolo mágico na posição atual do cursor
  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const newText = current.substring(0, start) + symbol + current.substring(end);
    setEditContent(newText);
    setIsSymbolsMenuOpen(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // Inserir Callout Hermético
  const insertCallout = (type: "INSIGHT" | "RITUAL" | "AVISO" | "CORRESPONDENCIA") => {
    let template = "";
    switch (type) {
      case "INSIGHT":
        template = `\n> [!INSIGHT]\n> Registro de gnose, iluminação súbita ou percepção do Eu Superior...\n\n`;
        break;
      case "RITUAL":
        template = `\n> [!RITUAL]\n> Instrução cerimonial, postura de Asana ou vibração de Palavra de Poder...\n\n`;
        break;
      case "AVISO":
        template = `\n> [!AVISO]\n> Advertência mágica, ruptura de círculo ou precaução em operações astrais...\n\n`;
        break;
      case "CORRESPONDENCIA":
        template = `\n> [!777]\n> Correspondência de Liber 777: Perfume, Gema, Animal Sagrado ou Sephirah...\n\n`;
        break;
    }
    insertFormatting(template, "");
    setIsCalloutsMenuOpen(false);
  };

  // Gravação de Áudio / Voz Nativo
  const startAudioRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não possui suporte para gravação de microfone.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioStreamRef.current?.getTracks().forEach((track) => track.stop());

        try {
          const formData = new FormData();
          const fileName = `audio_diario_${Date.now()}.webm`;
          formData.append("file", audioBlob, fileName);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.fileUrl) {
            const dateStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const audioMarkup = `\n![audio:Gravação de Voz · ${dateStr}](${data.fileUrl})\n`;
            insertFormatting(audioMarkup, "");
          } else {
            // Fallback para Base64 se upload falhar
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              const dateStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const audioMarkup = `\n![audio:Gravação de Voz · ${dateStr}](${base64Audio})\n`;
              insertFormatting(audioMarkup, "");
            };
            reader.readAsDataURL(audioBlob);
          }
        } catch (err) {
          console.error("Erro no upload de áudio:", err);
        }
      };

      mediaRecorder.start(200);
      setIsRecordingAudio(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Falha ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecordingAudio(false);
  };

  const handleInsertImage = () => {
    setIsImageModalOpen(true);
  };

  const handleInsertVideo = () => {
    setIsVideoModalOpen(true);
  };

  // Upload automático ao Colar (Ctrl+V) ou Arrastar e Soltar (Drag & Drop)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadMediaNotice, setUploadMediaNotice] = useState<string | null>(null);

  const handleMediaUploadFile = async (file: File) => {
    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");
    const isAud = file.type.startsWith("audio/");

    if (!isImg && !isVid && !isAud) {
      return false;
    }

    try {
      setIsUploadingMedia(true);
      setUploadMediaNotice(`Enviando ${file.name}...`);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        if (isImg) {
          insertFormatting(`\n![${cleanName}](${data.url})\n`);
        } else if (isVid) {
          insertFormatting(`\n![video:${cleanName}](${data.url})\n`);
        } else if (isAud) {
          insertFormatting(`\n![audio:${cleanName}](${data.url})\n`);
        }
        setUploadMediaNotice(`Arquivo "${cleanName}" anexado com sucesso!`);
        setTimeout(() => setUploadMediaNotice(null), 3500);
        return true;
      } else {
        alert("Erro no upload: " + (data.error || "Falha ao enviar arquivo"));
      }
    } catch (err: any) {
      console.error("Erro ao enviar mídia:", err);
      alert("Falha ao enviar arquivo de mídia.");
    } finally {
      setIsUploadingMedia(false);
    }
    return false;
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleMediaUploadFile(file);
        }
        return;
      }
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type.startsWith("audio/")
      ) {
        e.preventDefault();
        e.stopPropagation();
        await handleMediaUploadFile(file);
      }
    }
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
      ...(entry.success_rating !== undefined && entry.success_rating !== null
        ? [`success_rating: ${entry.success_rating}`]
        : []),
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
    editQuerentName,
    editQuerentBirthdate,
    hasOracleTable,
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

  // Inserir link para outra nota ([[Título da Nota]])
  const insertNoteLink = (noteTitle: string) => {
    insertFormatting(`[[${noteTitle}]]`, "");
    setIsNoteLinkMenuOpen(false);
    setNoteLinkSearch("");
  };

  // Backlinks (outras notas que mencionam a nota atual)
  const backlinks = React.useMemo(() => {
    if (!entry) return [];
    const entryTitleLower = entry.title.toLowerCase();
    const entryId = entry.id;

    return allEntries.filter((other) => {
      if (other.id === entryId) return false;
      const contentLower = other.content.toLowerCase();
      const mentionsTitle = contentLower.includes(`[[${entryTitleLower}`) || contentLower.includes(`[[${other.title.toLowerCase()}`);
      const mentionsDirectly = contentLower.includes(entryTitleLower);
      const hasConnection = (other.connections || []).some((c) => c.target_id === entryId);
      return mentionsTitle || mentionsDirectly || hasConnection;
    });
  }, [entry, allEntries]);

  // Manipulador de clique em links de notas dentro do artigo
  const handleArticleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest("[data-note-target]");
    if (target) {
      const rawTarget = target.getAttribute("data-note-target");
      if (rawTarget) {
        const decoded = decodeURIComponent(rawTarget).toLowerCase();
        const found = allEntries.find(
          (ent) =>
            ent.id.toLowerCase() === decoded ||
            ent.title.toLowerCase() === decoded ||
            ent.title.toLowerCase().includes(decoded)
        );
        if (found) {
          onSelectEntry(found);
        } else {
          alert(`A nota "${decodeURIComponent(rawTarget)}" ainda não foi encontrada no grimório.`);
        }
      }
    }
  };

  // Helper para formatar markdown inline com cores, negrito, itálico, links e Wikilinks estilo Obsidian
  const renderInlineMarkdown = (line: string): string => {
    return line
      // Imagens Embedadas estilo Obsidian: ![[arquivo.ext]] ou ![[arquivo.ext|Legenda]]
      .replace(/!\[\[(.*?)(?:\|(.*?))?\]\]/g, (_, target, captionOrWidth) => {
        const fileName = target.trim();
        const isImage = /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(fileName);
        if (isImage) {
          const src = fileName.startsWith("http") || fileName.startsWith("/")
            ? fileName
            : `/uploads/${fileName}`;
          const altText = captionOrWidth?.trim() || fileName;
          return `<figure class="my-4 text-center"><img src="${src}" alt="${altText}" class="rounded-lg max-h-[500px] w-auto border border-medium-700 mx-auto shadow-sm" />${captionOrWidth ? `<figcaption class="text-center text-xs text-medium-400 mt-1.5 font-mono italic">${captionOrWidth}</figcaption>` : ""}</figure>`;
        }
        return `![[${target}]]`;
      })
      // Imagens Markdown inline: ![alt](url)
      .replace(/!\[(.*?)\]\((.*?)\)/g, (_, alt, url) => {
        const cleanUrl = url.trim().replace(/^["']|["']$/g, "").split(/\s+/)[0];
        return `<figure class="my-4 text-center"><img src="${cleanUrl}" alt="${alt || 'Imagem'}" class="rounded-lg max-h-[500px] w-auto border border-medium-700 mx-auto shadow-sm" />${alt ? `<figcaption class="text-center text-xs text-medium-400 mt-1.5 font-mono italic">${alt}</figcaption>` : ""}</figure>`;
      })
      // Wikilinks estilo Obsidian: [[Nome da Nota]] ou [[Alvo|Texto Exibido]]
      .replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_, target, alias) => {
        const textToDisplay = (alias || target).trim();
        const noteTarget = target.trim();
        return `<span data-note-target="${encodeURIComponent(noteTarget)}" class="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-400/50 hover:decoration-amber-300 cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-amber-400/10"><span class="text-[11px] opacity-70">🔗</span>${textToDisplay}</span>`;
      })
      // Cores via HTML span
      .replace(/<span\s+style=["']color:\s*([^"';]+);?["']>(.*?)<\/span>/gi, "<span style='color: $1'>$2</span>")
      // Cores via tags amigáveis <color=...> ou <color name=...>
      .replace(/<color=([^>]+)>(.*?)<\/color>/gi, "<span style='color: $1'>$2</span>")
      .replace(/<color\s+name=["']?([^"'>]+)["']?>(.*?)<\/color>/gi, "<span style='color: $1'>$2</span>")
      // Marca-texto solar (==destaque==)
      .replace(/==(.*?)==/g, "<mark class='bg-amber-400/25 text-amber-200 px-1 py-0.5 rounded border-b border-amber-400/50 font-medium'>$1</mark>")
      // Tachado / Strikethrough (~~texto~~)
      .replace(/~~(.*?)~~/g, "<del class='line-through text-medium-400 opacity-60'>$1</del>")
      // Selo Thelêmico destacado (∴ 93 ∴ ou ∴ 93 93/93 ∴)
      .replace(/\*\*∴\s*93(?:\s*93\/93)?\s*∴\*\*/g, "<span class='inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded tracking-wider shadow-sm'>∴ 93 93/93 ∴</span>")
      // Negrito
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      // Itálico
      .replace(/\*(.*?)\*/g, "<em class='text-medium-100 italic'>$1</em>")
      // Sublinhado
      .replace(/<u>(.*?)<\/u>/gi, "<u class='underline underline-offset-4'>$1</u>")
      // Código inline
      .replace(/`([^`]+)`/g, "<code class='bg-medium-800 px-1.5 py-0.5 rounded text-xs font-mono text-medium-200 border border-medium-700'>$1</code>")
      // Links normais Markdown (apenas se NÃO for imagem)
      .replace(/(^|[^!])\[(.*?)\]\((.*?)\)/g, "$1<a href='$3' target='_blank' rel='noopener noreferrer' class='text-white underline underline-offset-2 hover:text-medium-300'>$2</a>");
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

      // 0.2 Checklist Interativa Clicável: - [ ] Tarefa ou - [x] Tarefa Concluída
      const checklistMatch = trimmedLine.match(/^([-*])\s+\[([ xX])\]\s*(.*)$/);
      if (checklistMatch) {
        const isChecked = checklistMatch[2].toLowerCase() === "x";
        const taskText = checklistMatch[3];
        const currentLineIndex = i;

        elements.push(
          <div
            key={`todo-${i}`}
            onClick={() => handleToggleChecklist(currentLineIndex)}
            className="flex items-start gap-3 my-2 cursor-pointer group select-none py-1 px-1.5 rounded hover:bg-medium-800/40 transition-colors"
            title="Clique para alternar o status da tarefa"
          >
            <div
              className={`w-4 h-4 rounded border mt-1 flex items-center justify-center shrink-0 transition-all ${
                isChecked
                  ? "bg-amber-400 border-amber-400 text-black shadow-sm"
                  : "border-medium-600 bg-medium-800 group-hover:border-amber-400/80"
              }`}
            >
              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <div
              className={`text-[16px] leading-relaxed transition-all ${
                isChecked
                  ? "line-through text-medium-400 opacity-60"
                  : "text-medium-100 group-hover:text-white"
              }`}
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(taskText) }}
            />
          </div>
        );
        i++;
        continue;
      }

      // 0.3 Carta do Tarot de Thoth Inline: ![tarot:Nome Da Carta]
      const tarotSyntaxMatch = trimmedLine.match(/^!\[tarot:(.*?)\](?:\((.*?)\))?/i);
      if (tarotSyntaxMatch) {
        const cardQuery = tarotSyntaxMatch[1].trim().toLowerCase();
        const card = THOTH_TAROT_DECK.find(
          (c) =>
            c.name.toLowerCase() === cardQuery ||
            c.name.toLowerCase().includes(cardQuery) ||
            c.id.toLowerCase() === cardQuery ||
            c.imageFile.toLowerCase().includes(cardQuery) ||
            (c.number && c.number.toLowerCase() === cardQuery)
        );

        if (card) {
          elements.push(
            <div
              key={`tarot-${i}`}
              className="my-5 p-4 rounded-xl bg-medium-850/90 border border-amber-500/30 flex flex-col sm:flex-row items-center gap-4 shadow-lg backdrop-blur-sm group hover:border-amber-400/60 transition-all"
            >
              <div
                onClick={() => setSelectedTarotCardForZoom(card)}
                className="relative w-24 sm:w-28 aspect-[600/894] rounded-lg overflow-hidden border border-amber-400/40 shadow-md cursor-pointer shrink-0 group-hover:scale-105 transition-transform bg-black"
                title="Clique para ampliar a lâmina do Tarot de Thoth"
              >
                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-mono font-semibold">
                  🔍 Ampliar
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                    {card.suit === "major" ? `Atu ${card.number}` : card.suit.toUpperCase()}
                  </span>
                  {card.hebrewLetter && (
                    <span className="text-[11px] font-mono text-medium-300 bg-medium-800 px-2 py-0.5 rounded border border-medium-750">
                      {card.hebrewLetter} ({card.hebrewName})
                    </span>
                  )}
                  {card.astrologicalSign && (
                    <span className="text-[11px] font-mono text-medium-300 bg-medium-800 px-2 py-0.5 rounded border border-medium-750">
                      {card.astrologicalSign}
                    </span>
                  )}
                  {card.sephirahPath && (
                    <span className="text-[10px] font-mono text-medium-400 bg-medium-800/80 px-1.5 py-0.5 rounded border border-medium-750">
                      {card.sephirahPath}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-sans font-bold text-white tracking-tight">
                  {card.number ? `${card.number}. ` : ""}{card.name}
                </h4>
                {card.thelemicTitle && (
                  <p className="text-xs font-mono text-amber-300/90 italic">
                    "{card.thelemicTitle}"
                  </p>
                )}
                <p className="text-xs text-medium-300 font-serif leading-relaxed line-clamp-2">
                  {card.description}
                </p>
                {card.keywords && card.keywords.length > 0 && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1 pt-0.5">
                    {card.keywords.slice(0, 4).map((kw, kIdx) => (
                      <span key={kIdx} className="text-[9px] font-mono bg-medium-800 text-medium-300 px-1.5 py-0.5 rounded border border-medium-750">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
          i++;
          continue;
        }
      }

      // 0.4 Divisores Sagrados Thelêmicos (---thelema---, ---rosacruz---, ---horus---)
      if (/^---(thelema|rosacruz|horus|estrela)---?$/i.test(trimmedLine)) {
        const symType = trimmedLine.replace(/-/g, "").toLowerCase();
        elements.push(
          <div key={`hr-sym-${i}`} className="my-8 flex items-center justify-center gap-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-500/40" />
            <span className="text-amber-400 font-mono text-xs px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 font-bold tracking-wider uppercase flex items-center gap-1.5">
              {symType === "thelema" ? "☉ 93 93/93 ☉" : symType === "rosacruz" ? "🝤 Rosa-Cruz Hermética 🝤" : "𓁹 Olho de Hórus 𓁹"}
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-500/40" />
          </div>
        );
        i++;
        continue;
      }

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

      // 2.5 Bloco de Áudio: ![audio:caption](url) ou ![audio](url) ou <audio ...>
      const audioSyntaxMatch = trimmedLine.match(/^!\[audio(?::(.*?))?\]\((.*?)\)/i);
      const htmlAudioMatch = trimmedLine.match(/<audio[^>]*src=["']([^"']+)["'][^>]*>/i);
      if (audioSyntaxMatch || htmlAudioMatch) {
        const url = audioSyntaxMatch ? audioSyntaxMatch[2].trim() : htmlAudioMatch![1].trim();
        const caption = audioSyntaxMatch ? audioSyntaxMatch[1]?.trim() : "Gravação de Áudio";
        elements.push(
          <div
            key={`audio-${i}`}
            className="my-5 p-4 rounded-xl bg-medium-850 border border-medium-700/80 shadow-md flex flex-col gap-2.5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-xs font-mono text-medium-300">
              <span className="flex items-center gap-2 text-white font-medium">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{caption || "Gravação Astral / Ritualística"}</span>
              </span>
              <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 font-semibold tracking-wider uppercase">
                Áudio Mágicko
              </span>
            </div>
            <audio src={url} controls className="w-full h-10 rounded-lg accent-amber-400" />
          </div>
        );
        i++;
        continue;
      }

      // 3. Imagem Embedada estilo Obsidian: ![[arquivo.ext]] ou ![[arquivo.ext|Legenda]]
      const obsidianImgMatch = trimmedLine.match(/^!\[\[(.*?)(?:\|(.*?))?\]\]$/);
      if (obsidianImgMatch) {
        const fileName = obsidianImgMatch[1].trim();
        const caption = obsidianImgMatch[2]?.trim() || fileName;
        const isImage = /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(fileName);
        if (isImage) {
          const src = fileName.startsWith("http") || fileName.startsWith("/")
            ? fileName
            : `/uploads/${fileName}`;
          elements.push(
            <figure key={`obs-img-${i}`} className="my-6">
              <img
                src={src}
                alt={caption}
                className="rounded-lg max-h-[550px] w-auto border border-medium-700 mx-auto shadow-sm"
              />
              {caption && (
                <figcaption className="text-center text-xs text-medium-400 mt-2 font-mono italic">
                  {caption}
                </figcaption>
              )}
            </figure>
          );
          i++;
          continue;
        }
      }

      // 3.5. Bloco de Imagem Markdown: ![alt](url)
      const imgMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        let url = imgMatch[2].trim().replace(/^["']|["']$/g, "").split(/\s+/)[0];

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
              className="rounded-lg max-h-[550px] w-auto border border-medium-700 mx-auto shadow-sm"
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

      // 4.5 Callout Hermético (> [!INSIGHT], > [!RITUAL], > [!AVISO], > [!777])
      const calloutMatch = trimmedLine.match(/^>\s*\[!(INSIGHT|RITUAL|PRATICA|AVISO|ATENCAO|CAUTION|777|CORRESPONDENCIA)\]/i);
      if (calloutMatch) {
        const type = calloutMatch[1].toUpperCase();
        const calloutLines: string[] = [];
        const firstLineRest = trimmedLine.replace(/^>\s*\[!(.*?)\]/i, "").trim();
        if (firstLineRest) calloutLines.push(firstLineRest);
        i++;
        while (i < rawLines.length && rawLines[i].trim().startsWith(">")) {
          calloutLines.push(rawLines[i].trim().replace(/^>\s*/, ""));
          i++;
        }
        const calloutBody = calloutLines.join("\n");

        let borderClass = "border-amber-500/50 bg-amber-500/10 text-amber-200";
        let icon = <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />;
        let title = "INSIGHT & GNOSE";

        if (type === "RITUAL" || type === "PRATICA") {
          borderClass = "border-purple-500/50 bg-purple-500/10 text-purple-200";
          icon = <Compass className="w-4 h-4 text-purple-400 shrink-0" />;
          title = "RITUAL & OPERAÇÃO";
        } else if (type === "AVISO" || type === "ATENCAO" || type === "CAUTION") {
          borderClass = "border-rose-500/50 bg-rose-500/10 text-rose-200";
          icon = <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
          title = "ADVERTÊNCIA HERMÉTICA";
        } else if (type === "777" || type === "CORRESPONDENCIA") {
          borderClass = "border-sky-500/50 bg-sky-500/10 text-sky-200";
          icon = <Star className="w-4 h-4 text-sky-400 shrink-0" />;
          title = "LIBER 777 · CORRESPONDÊNCIA";
        }

        elements.push(
          <div
            key={`callout-${i}`}
            className={`my-5 p-4 rounded-xl border ${borderClass} shadow-md backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider text-white">
              {icon}
              <span>{title}</span>
            </div>
            <div
              className="text-[15px] font-serif leading-relaxed text-medium-100 space-y-2"
              dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(calloutBody.replace(/\n/g, "<br/>")) }}
            />
          </div>
        );
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
          {/* Botão de Visual, Tipografia & Margens */}
          <div className="relative">
            <button
              onClick={() => setIsMarginPopoverOpen(!isMarginPopoverOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                isMarginPopoverOpen
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-medium-800 hover:bg-medium-750 text-medium-300 hover:text-white border-medium-700"
              }`}
              title="Ajustar Tipografia, Tamanho da Letra e Margem da Área de Leitura / Edição"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual & Margem</span>
            </button>

            {isMarginPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-medium-850 border border-medium-700 rounded-xl p-4 shadow-2xl z-40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-medium-750">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                    <span>Visual, Fonte & Margem</span>
                  </span>
                  <span className="text-[11px] font-mono text-medium-300 font-bold bg-medium-800 px-1.5 py-0.5 rounded border border-medium-700">
                    {readingWidth}px · {fontSize}px
                  </span>
                </div>

                {/* 1. Família Tipográfica */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold block">
                    Família da Fonte
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => changeFontFamily("serif")}
                      className={`p-2 rounded font-serif text-center transition-all border ${
                        fontFamily === "serif"
                          ? "bg-white text-black font-semibold border-white shadow-sm"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Grimório
                      <span className="block text-[9px] font-mono opacity-70">Serif</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changeFontFamily("sans")}
                      className={`p-2 rounded font-sans text-center transition-all border ${
                        fontFamily === "sans"
                          ? "bg-white text-black font-semibold border-white shadow-sm"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Moderno
                      <span className="block text-[9px] font-mono opacity-70">Sans</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => changeFontFamily("mono")}
                      className={`p-2 rounded font-mono text-center transition-all border ${
                        fontFamily === "mono"
                          ? "bg-white text-black font-semibold border-white shadow-sm"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Alquímico
                      <span className="block text-[9px] font-mono opacity-70">Mono</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tamanho da Fonte */}
                <div className="space-y-1.5 pt-1 border-t border-medium-750">
                  <div className="flex items-center justify-between text-[10px] font-mono text-medium-400 font-semibold">
                    <span>TAMANHO DO TEXTO</span>
                    <span className="text-white">{fontSize}px</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-xs font-mono">
                    {[15, 17, 19, 21].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => changeFontSize(sz)}
                        className={`py-1.5 rounded text-center transition-all border ${
                          fontSize === sz
                            ? "bg-amber-400 text-black font-bold border-amber-400 shadow-sm"
                            : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Presets de Largura */}
                <div className="space-y-1.5 pt-1 border-t border-medium-750">
                  <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold block">
                    Largura da Área
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => changeReadingWidth(680)}
                      className={`p-1.5 rounded text-left transition-colors border ${
                        readingWidth === 680
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Estreita (680px)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeReadingWidth(780)}
                      className={`p-1.5 rounded text-left transition-colors border ${
                        readingWidth === 780
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Padrão (780px)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeReadingWidth(1050)}
                      className={`p-1.5 rounded text-left transition-colors border ${
                        readingWidth === 1050
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Ampla (1050px)
                    </button>
                    <button
                      type="button"
                      onClick={() => changeReadingWidth(1380)}
                      className={`p-1.5 rounded text-left transition-colors border ${
                        readingWidth === 1380
                          ? "bg-white text-black font-semibold border-white"
                          : "bg-medium-800 text-medium-300 hover:text-white border-medium-700"
                      }`}
                    >
                      Total (1380px)
                    </button>
                  </div>

                  {/* Slider de Ajuste Fino */}
                  <div className="space-y-1 pt-1">
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
        style={{
          maxWidth: isEditing && editorLayout === "split" ? "1450px" : `${readingWidth}px`,
        }}
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
                {entry.success_rating !== undefined && entry.success_rating !== null && (
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

                {entry.oracle_data.querent_name && (
                  <p className="text-xs font-mono text-medium-300">
                    <span className="text-medium-400">Consulente:</span>{" "}
                    <span className="text-white font-semibold">{entry.oracle_data.querent_name}</span>
                    {entry.oracle_data.querent_birthdate && (
                      <span className="text-medium-400">
                        {" "}· Nasc. {entry.oracle_data.querent_birthdate.split("-").reverse().join("/")}
                      </span>
                    )}
                  </p>
                )}

                {/* Mesa com as cartas espalhadas exatamente como no altar */}
                {entry.oracle_data.cards && entry.oracle_data.cards.length > 0 && (
                  <OracleTable
                    cards={entry.oracle_data.cards as CardOnTable[]}
                    isEditable={false}
                    query={entry.oracle_data.query}
                    spreadName={entry.oracle_data.spread_name}
                    querentName={entry.oracle_data.querent_name}
                    querentBirthdate={entry.oracle_data.querent_birthdate}
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
            <div
              onClick={handleArticleClick}
              className={`pt-4 border-t border-medium-800 ${getFontClass()}`}
              style={{ fontSize: `${fontSize}px` }}
            >
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

            {/* Backlinks (Menções e Links Reversos Estilo Obsidian) */}
            {backlinks.length > 0 && (
              <div className="pt-6 border-t border-medium-800 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-medium-400 flex items-center gap-1.5">
                  <span className="text-amber-400">🔗</span>
                  <span>Notas que referenciam esta nota ({backlinks.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {backlinks.map((srcEntry) => (
                    <div
                      key={srcEntry.id}
                      onClick={() => onSelectEntry(srcEntry)}
                      className="p-3 rounded-lg bg-medium-850 hover:bg-medium-800 border border-medium-700 hover:border-amber-500/50 cursor-pointer transition-all text-xs group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-medium-400 uppercase">
                          {normalizeCategory(srcEntry.type)}
                        </span>
                        <span className="text-[10px] font-mono text-medium-500">
                          {srcEntry.date ? srcEntry.date.slice(0, 10) : ""}
                        </span>
                      </div>
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors truncate">
                        {srcEntry.title}
                      </div>
                      <div className="text-[11px] text-medium-400 italic line-clamp-1 mt-0.5">
                        {srcEntry.content.replace(/\[\[(.*?)\]\]/g, "$1").slice(0, 100)}...
                      </div>
                    </div>
                  ))}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-medium-400">
                    SUCESSO MÁGICKO {hasRating ? `(${editRating}/10)` : "(NÃO AVALIADO)"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasRating(!hasRating)}
                    className="text-[10px] font-mono underline hover:text-white text-medium-300 transition-colors"
                  >
                    {hasRating ? "Remover Avaliação" : "+ Adicionar Avaliação"}
                  </button>
                </div>
                {hasRating ? (
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer mt-2"
                  />
                ) : (
                  <div className="text-[11px] font-mono text-medium-400 italic bg-medium-800/60 p-2 rounded border border-medium-750 mt-1">
                    Nota sem pontuação (ideal para estudos, diários cotidianos e sonhos).
                  </div>
                )}
              </div>
            </div>

            {/* Oracle Spread & Table Cloth Editor (quando ativado pelo botão ou notas oraculares) */}
            {hasOracleTable && (
              <div className="p-5 rounded-xl bg-medium-850 border border-amber-500/30 space-y-4 shadow-lg animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-medium-750 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Mesa Oracular do Altar (Lâminas & Disposição)
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-medium-400 hidden sm:inline">
                      Pano de veludo, baralho de Thoth 3D e métodos de tiragem
                    </span>
                    <button
                      type="button"
                      onClick={() => setHasOracleTable(false)}
                      className="px-2 py-1 text-[11px] font-mono text-medium-400 hover:text-red-300 hover:bg-red-950/30 border border-medium-700 hover:border-red-800/50 rounded transition-colors"
                      title="Recolher mesa oracular (as cartas permanecerão salvas se mantidas)"
                    >
                      Recolher Mesa
                    </button>
                  </div>
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
                  <div>
                    <label className="block text-[10px] font-mono text-medium-400 mb-1">
                      NOME DA PESSOA FOCO DA TIRAGEM
                    </label>
                    <input
                      type="text"
                      value={editQuerentName}
                      onChange={(e) => setEditQuerentName(e.target.value)}
                      placeholder="Ex: Frater Perdurabo, Maria Silva..."
                      className="w-full bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-white font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-medium-400 mb-1">
                      DATA DE NASCIMENTO <span className="text-medium-500">(opcional · Arcanos Pessoais)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={editQuerentBirthdate}
                        onChange={(e) => setEditQuerentBirthdate(e.target.value)}
                        className="flex-1 bg-medium-800 border border-medium-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-white font-mono"
                      />
                      {editQuerentBirthdate && (
                        <button
                          type="button"
                          onClick={() => setEditQuerentBirthdate("")}
                          className="p-2 text-medium-400 hover:text-red-300 border border-medium-700 rounded-md transition-colors"
                          title="Limpar data de nascimento"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* The Interactive Table */}
                <OracleTable
                  cards={editCards}
                  onChange={setEditCards}
                  isEditable={true}
                  query={editQuery}
                  spreadName={editSpread}
                  querentName={editQuerentName}
                  querentBirthdate={editQuerentBirthdate}
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
              <button
                type="button"
                onClick={() => insertFormatting("==", "==")}
                className="p-1.5 text-medium-300 hover:text-amber-300 hover:bg-medium-750 rounded transition-colors"
                title="Marca-texto Solar (==Destaque==)"
              >
                <Highlighter className="w-4 h-4 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("~~", "~~")}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Tachado / Riscado (~~Texto~~)"
              >
                <Strikethrough className="w-4 h-4" />
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
                onClick={handleInsertChecklist}
                className="p-1.5 text-medium-300 hover:text-white hover:bg-medium-750 rounded transition-colors"
                title="Inserir Lista de Tarefas / Checklist do Ritual (- [ ])"
              >
                <CheckSquare className="w-4 h-4" />
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

              <button
                type="button"
                onClick={() => setIsTarotPickerOpen(true)}
                className="p-1.5 text-medium-300 hover:text-amber-300 hover:bg-medium-750 rounded transition-colors"
                title="Inserir Lâmina Individual do Tarot de Thoth (![tarot:...])"
              >
                <Layers className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleToggleOracleTable}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono border ${
                  hasOracleTable
                    ? "bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm font-semibold"
                    : "text-medium-300 hover:text-white hover:bg-medium-750 border-transparent"
                }`}
                title={hasOracleTable ? "Mesa Oracular aberta (clique para recolher/fechar)" : "Inserir Mesa Oracular (Pano de Altar, Baralho de Thoth 3D & Tiragens)"}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline font-sans font-medium">Mesa Oracular</span>
              </button>

              {/* Callouts Herméticos */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCalloutsMenuOpen(!isCalloutsMenuOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono border ${
                    isCalloutsMenuOpen
                      ? "bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm font-semibold"
                      : "text-medium-300 hover:text-white hover:bg-medium-750 border-transparent"
                  }`}
                  title="Inserir Callout Hermético (Gnose, Ritual, Alerta ou Liber 777)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline font-sans font-medium">Callout</span>
                </button>

                {isCalloutsMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-medium-850 border border-medium-700 rounded-xl p-2 shadow-2xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-mono font-bold text-medium-400 uppercase tracking-wider border-b border-medium-750 mb-1">
                      Callouts Esotéricos
                    </div>
                    <button
                      type="button"
                      onClick={() => insertCallout("INSIGHT")}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-amber-500/15 text-amber-200 hover:text-amber-100 flex items-center gap-2 text-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Insight & Gnose</div>
                        <div className="text-[10px] opacity-70">Revelações e iluminações astrais</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCallout("RITUAL")}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-purple-500/15 text-purple-200 hover:text-purple-100 flex items-center gap-2 text-xs transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Ritual & Operação</div>
                        <div className="text-[10px] opacity-70">Passo a passo, posturas e vibrações</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCallout("AVISO")}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-500/15 text-rose-200 hover:text-rose-100 flex items-center gap-2 text-xs transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Advertência Hermética</div>
                        <div className="text-[10px] opacity-70">Cuidados, banimentos e proteção</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCallout("CORRESPONDENCIA")}
                      className="w-full text-left px-2.5 py-1.5 rounded hover:bg-sky-500/15 text-sky-200 hover:text-sky-100 flex items-center gap-2 text-xs transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Liber 777 Atribuição</div>
                        <div className="text-[10px] opacity-70">Cores, incensos e deidades</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Símbolos Herméticos e Thelêmicos */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSymbolsMenuOpen(!isSymbolsMenuOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono border ${
                    isSymbolsMenuOpen
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm font-semibold"
                      : "text-medium-300 hover:text-white hover:bg-medium-750 border-transparent"
                  }`}
                  title="Inserir Símbolos Mágickos Herméticos (☉ ☽ 🜂 🜄 ⛤ 𓁹 ☥ ⚚)"
                >
                  <span className="text-amber-300 font-bold text-sm leading-none">☉</span>
                  <span className="hidden sm:inline font-sans font-medium">Símbolos</span>
                </button>

                {isSymbolsMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-medium-850 border border-medium-700 rounded-xl p-3 shadow-2xl z-40 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-medium-750">
                      <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                        Símbolos Herméticos & 777
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSymbolsMenuOpen(false)}
                        className="text-medium-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {HERMETIC_SYMBOLS.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-1">
                          <div className="text-[10px] font-mono text-medium-400 uppercase tracking-wide">
                            {group.group}
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {group.symbols.map((sym, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => insertSymbol(sym.char)}
                                className="h-8 rounded bg-medium-800 hover:bg-medium-750 border border-medium-700/80 text-white hover:text-amber-300 text-sm flex items-center justify-center transition-all hover:scale-105"
                                title={sym.name}
                              >
                                {sym.char}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Linkar Nota Estilo Obsidian ([[Nome da Nota]]) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNoteLinkMenuOpen(!isNoteLinkMenuOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono border ${
                    isNoteLinkMenuOpen
                      ? "bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm font-semibold"
                      : "text-medium-300 hover:text-white hover:bg-medium-750 border-transparent"
                  }`}
                  title="Linkar outra nota do diário (Wikilink [[Nome da Nota]])"
                >
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-sans font-medium">Linkar Nota</span>
                </button>

                {isNoteLinkMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-medium-850 border border-medium-700 rounded-xl p-3 shadow-2xl z-40 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-1.5 border-b border-medium-750">
                      <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Link2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Linkar Outra Nota</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsNoteLinkMenuOpen(false)}
                        className="text-medium-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={noteLinkSearch}
                      onChange={(e) => setNoteLinkSearch(e.target.value)}
                      placeholder="Buscar título da nota..."
                      className="w-full bg-medium-800 border border-medium-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-amber-400 font-sans"
                      autoFocus
                    />

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {allEntries
                        .filter(
                          (other) =>
                            other.id !== entry?.id &&
                            (noteLinkSearch === "" ||
                              other.title.toLowerCase().includes(noteLinkSearch.toLowerCase()) ||
                              other.type.toLowerCase().includes(noteLinkSearch.toLowerCase()))
                        )
                        .slice(0, 15)
                        .map((other) => (
                          <button
                            key={other.id}
                            type="button"
                            onClick={() => insertNoteLink(other.title)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-amber-500/15 text-medium-200 hover:text-white text-xs transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate group-hover:text-amber-300 font-medium">{other.title}</span>
                            <span className="text-[9px] font-mono text-medium-400 uppercase shrink-0 ml-2">
                              {normalizeCategory(other.type)}
                            </span>
                          </button>
                        ))}
                      {allEntries.filter(
                        (other) =>
                          other.id !== entry?.id &&
                          (noteLinkSearch === "" ||
                            other.title.toLowerCase().includes(noteLinkSearch.toLowerCase()))
                      ).length === 0 && (
                        <div className="text-[11px] font-mono text-medium-400 italic text-center py-2">
                          Nenhuma nota encontrada.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Carimbo Astral do Momento */}
              <button
                type="button"
                onClick={handleInsertAstralStamp}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono text-medium-300 hover:text-amber-300 hover:bg-medium-750 border border-transparent"
                title="Carimbar Trânsito Astral do Momento (Sol, Lua, Signos e Hora Planetária)"
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline font-sans font-medium">Carimbo Astral</span>
              </button>

              {/* Selo Thelêmico */}
              <button
                type="button"
                onClick={handleInsertThelemicSeal}
                className="flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono text-medium-300 hover:text-amber-300 hover:bg-medium-750 border border-transparent"
                title="Inserir Selo Thelêmico Formal (∴ 93 93/93 ∴ Amor é a lei, amor sob vontade)"
              >
                <span className="text-amber-400 font-bold text-xs">∴93∴</span>
                <span className="hidden sm:inline font-sans font-medium">Selo 93</span>
              </button>

              {/* Gravador de Áudio de Voz */}
              {!isRecordingAudio ? (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  className="flex items-center gap-1.5 px-2 py-1 rounded transition-all text-xs font-mono text-medium-300 hover:text-rose-300 hover:bg-medium-750 border border-transparent"
                  title="Gravar nota de voz ou descrição do ritual com microfone nativo"
                >
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline font-sans font-medium">Gravar Voz</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-mono bg-rose-600 text-white border border-rose-400 shadow-md animate-pulse font-semibold"
                  title="Clique para encerrar gravação e anexar ao diário"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>
                    Gravando {Math.floor(recordingDuration / 60)}:
                    {(recordingDuration % 60).toString().padStart(2, "0")}s · Parar
                  </span>
                </button>
              )}

              <div className="w-[1px] h-5 bg-medium-700 mx-1 hidden sm:block" />

              {/* Botão Split-Screen */}
              <button
                type="button"
                onClick={() => setEditorLayout(editorLayout === "split" ? "edit" : "split")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-mono border ${
                  editorLayout === "split"
                    ? "bg-white text-black border-white font-semibold shadow-sm"
                    : "text-medium-300 hover:text-white hover:bg-medium-750 border-medium-700"
                }`}
                title={editorLayout === "split" ? "Voltar ao Editor Normal" : "Ativar Tela Dividida (Editor à esquerda + Preview ao vivo à direita)"}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-sans font-medium">
                  {editorLayout === "split" ? "Tela Dividida" : "Split-Screen"}
                </span>
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

            {/* Notificação de Upload de Mídia ao Colar / Arrastar */}
            {uploadMediaNotice && (
              <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>{uploadMediaNotice}</span>
                </span>
              </div>
            )}

            {/* Content Textarea & Live Split-Screen Preview */}
            {editorLayout === "split" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-medium-400 px-1">
                    <span>EDITOR (MARKDOWN · Cole Ctrl+V ou Arraste Imagens aqui)</span>
                    <span className="text-amber-400/90 font-semibold">{fontFamily} · {fontSize}px</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    rows={22}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onPaste={handleTextareaPaste}
                    onDrop={handleTextareaDrop}
                    placeholder="Escreva livremente com formatação rica, reflexões, invocações e visões... (Pode colar ou arrastar imagens aqui!)"
                    className={`w-full bg-medium-850 border border-medium-700 rounded-lg p-4 text-white placeholder-medium-500 focus:outline-none focus:border-white leading-relaxed resize-y min-h-[480px] ${getFontClass()}`}
                    style={{ fontSize: `${fontSize}px` }}
                  />
                  {/* Barra de Métricas em Tempo Real */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-medium-400 pt-1.5 px-1 border-t border-medium-750/60 mt-1 select-none">
                    <div className="flex items-center gap-2.5">
                      <span><strong className="text-white">{editContent.trim() ? editContent.trim().split(/\s+/).length : 0}</strong> palavras</span>
                      <span>•</span>
                      <span><strong className="text-white">{editContent.length}</strong> caracteres</span>
                      <span>•</span>
                      <span><strong className="text-white">{editContent.split("\n").length}</strong> linhas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-medium-400">
                      <span>Leitura estimada: ~<strong className="text-white">{Math.max(1, Math.ceil((editContent.trim() ? editContent.trim().split(/\s+/).length : 0) / 200))}</strong> min</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-medium-400 px-1">
                    <span className="text-amber-400 font-semibold">PREVIEW EM TEMPO REAL</span>
                    <span>Modo Leitura</span>
                  </div>
                  <div className="w-full bg-medium-850/80 border border-medium-700/80 rounded-lg p-5 overflow-y-auto max-h-[620px] shadow-inner space-y-4">
                    {editTitle && (
                      <h2 className="text-2xl font-sans font-bold text-white tracking-tight border-b border-medium-750 pb-2">
                        {editTitle}
                      </h2>
                    )}
                    <div className={`prose prose-invert max-w-none ${getFontClass()}`} style={{ fontSize: `${fontSize}px` }}>
                      {renderFormattedContent(editContent || "*Nenhum conteúdo digitado ainda.*")}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <textarea
                  ref={textareaRef}
                  rows={16}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onPaste={handleTextareaPaste}
                  onDrop={handleTextareaDrop}
                  placeholder="Escreva livremente com formatação rica, reflexões, invocações e visões... (Pode colar Ctrl+V ou arrastar imagens diretamente aqui!)"
                  className={`w-full bg-medium-850 border border-medium-700 rounded-lg p-4 text-white placeholder-medium-500 focus:outline-none focus:border-white leading-relaxed ${getFontClass()}`}
                  style={{ fontSize: `${fontSize}px` }}
                />
                {/* Barra de Métricas em Tempo Real */}
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-medium-400 pt-1.5 px-1 border-t border-medium-750/60 mt-1 select-none">
                  <div className="flex items-center gap-2.5">
                    <span><strong className="text-white">{editContent.trim() ? editContent.trim().split(/\s+/).length : 0}</strong> palavras</span>
                    <span>•</span>
                    <span><strong className="text-white">{editContent.length}</strong> caracteres</span>
                    <span>•</span>
                    <span><strong className="text-white">{editContent.split("\n").length}</strong> linhas</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-medium-400">
                    <span>Leitura estimada: ~<strong className="text-white">{Math.max(1, Math.ceil((editContent.trim() ? editContent.trim().split(/\s+/).length : 0) / 200))}</strong> min</span>
                  </div>
                </div>
              </div>
            )}

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

      {/* Modal Seletor de Cartas do Tarot de Thoth */}
      {isTarotPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-medium-850 border border-medium-700 w-full max-w-3xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-medium-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
                    Tarot de Thoth — Inserir Lâmina no Texto
                  </h3>
                  <span className="text-[11px] font-mono text-medium-400">
                    Selecione uma das 80 cartas para incorporar ao diário com correspondências completas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTarotPickerOpen(false)}
                className="p-1.5 text-medium-400 hover:text-white rounded-lg hover:bg-medium-750 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Busca de Cartas */}
            <div className="p-3 border-b border-medium-750 bg-medium-900/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-medium-400" />
                <input
                  type="text"
                  value={tarotPickerSearch}
                  onChange={(e) => setTarotPickerSearch(e.target.value)}
                  placeholder="Buscar por nome, número ou naipe (ex: Diabo, Louco, Espadas, 15)..."
                  className="w-full bg-medium-800 border border-medium-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-medium-500 focus:outline-none focus:border-amber-400 font-sans"
                  autoFocus
                />
              </div>
            </div>

            {/* Grid de Cartas */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 custom-scrollbar">
              {THOTH_TAROT_DECK.filter((c) => {
                if (!tarotPickerSearch.trim()) return true;
                const q = tarotPickerSearch.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  c.number.toLowerCase().includes(q) ||
                  c.suit.toLowerCase().includes(q) ||
                  (c.hebrewName && c.hebrewName.toLowerCase().includes(q)) ||
                  (c.astrologicalSign && c.astrologicalSign.toLowerCase().includes(q))
                );
              }).map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    insertFormatting(`\n![tarot:${card.name}](${card.imageUrl})\n`);
                    setIsTarotPickerOpen(false);
                  }}
                  className="group flex flex-col items-center p-2 rounded-xl bg-medium-800 hover:bg-medium-750 border border-medium-700 hover:border-amber-400/80 transition-all text-left"
                >
                  <div className="w-full aspect-[600/894] rounded-lg overflow-hidden bg-black mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-sans font-semibold text-white group-hover:text-amber-300 truncate w-full text-center">
                    {card.number ? `${card.number}. ` : ""}{card.name}
                  </span>
                  <span className="text-[9px] font-mono text-medium-400 uppercase">
                    {card.suit === "major" ? "Arcano Maior" : card.suit}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom de Carta de Tarot */}
      {selectedTarotCardForZoom && (
        <div
          onClick={() => setSelectedTarotCardForZoom(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-medium-850 border border-amber-500/40 max-w-4xl w-full max-h-[90vh] rounded-2xl flex flex-col md:flex-row shadow-2xl overflow-hidden"
          >
            {/* Imagem em Destaque */}
            <div className="md:w-1/2 p-6 bg-black/60 flex items-center justify-center border-b md:border-b-0 md:border-r border-medium-750">
              <div className="max-h-[70vh] aspect-[600/894] rounded-xl overflow-hidden border border-amber-400/40 shadow-2xl">
                <img
                  src={selectedTarotCardForZoom.imageUrl}
                  alt={selectedTarotCardForZoom.name}
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            </div>

            {/* Informações e Correspondências */}
            <div className="md:w-1/2 p-6 flex flex-col overflow-y-auto space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold">
                    {selectedTarotCardForZoom.suit === "major"
                      ? `Atu ${selectedTarotCardForZoom.number}`
                      : selectedTarotCardForZoom.suit.toUpperCase()}
                  </span>
                  <h3 className="text-2xl font-sans font-bold text-white tracking-tight mt-1">
                    {selectedTarotCardForZoom.number ? `${selectedTarotCardForZoom.number}. ` : ""}
                    {selectedTarotCardForZoom.name}
                  </h3>
                  {selectedTarotCardForZoom.thelemicTitle && (
                    <p className="text-xs font-mono text-amber-300/90 italic">
                      "{selectedTarotCardForZoom.thelemicTitle}"
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTarotCardForZoom(null)}
                  className="p-1.5 text-medium-400 hover:text-white rounded-lg hover:bg-medium-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Atribuições Herméticas */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {selectedTarotCardForZoom.hebrewLetter && (
                  <div className="p-2.5 rounded-lg bg-medium-800 border border-medium-750">
                    <span className="text-[10px] text-medium-400 block">LETRA HEBRAICA:</span>
                    <span className="text-white font-semibold">
                      {selectedTarotCardForZoom.hebrewLetter} ({selectedTarotCardForZoom.hebrewName})
                    </span>
                  </div>
                )}
                {selectedTarotCardForZoom.astrologicalSign && (
                  <div className="p-2.5 rounded-lg bg-medium-800 border border-medium-750">
                    <span className="text-[10px] text-medium-400 block">SIGNO / PLANETA:</span>
                    <span className="text-white font-semibold">{selectedTarotCardForZoom.astrologicalSign}</span>
                  </div>
                )}
                {selectedTarotCardForZoom.sephirahPath && (
                  <div className="p-2.5 rounded-lg bg-medium-800 border border-medium-750">
                    <span className="text-[10px] text-medium-400 block">CAMINHO / ÁRVORE:</span>
                    <span className="text-white font-semibold">{selectedTarotCardForZoom.sephirahPath}</span>
                  </div>
                )}
                {selectedTarotCardForZoom.element && (
                  <div className="p-2.5 rounded-lg bg-medium-800 border border-medium-750">
                    <span className="text-[10px] text-medium-400 block">ELEMENTO:</span>
                    <span className="text-white font-semibold">{selectedTarotCardForZoom.element}</span>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold block">
                  Significado Arquetípico & Instrução
                </span>
                <p className="text-xs text-medium-200 font-serif leading-relaxed">
                  {selectedTarotCardForZoom.description}
                </p>
              </div>

              {/* Palavras-chave */}
              {selectedTarotCardForZoom.keywords && selectedTarotCardForZoom.keywords.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-medium-750">
                  <span className="text-[10px] font-mono text-medium-400 uppercase font-semibold block">
                    Palavras-Chave (Crowley)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTarotCardForZoom.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="px-2 py-0.5 rounded-md bg-medium-800 border border-medium-700 text-xs text-medium-300 font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
