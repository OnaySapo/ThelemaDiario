"use client";

import React, { useMemo, forwardRef, useImperativeHandle, useRef, useState } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Image as ImageIcon, Maximize2, Trash2, Eye, EyeOff } from "lucide-react";

export interface MagickCodeMirrorHandle {
  insertFormatting: (before: string, after?: string) => void;
  focus: () => void;
}

interface MagickCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onFileUpload?: (file: File) => Promise<boolean>;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  onWikilinkTrigger?: (query: string, coords: { x: number; y: number }) => void;
  onSlashTrigger?: (coords: { x: number; y: number }) => void;
}

export function normalizeMediaSrc(rawUrl: string): string {
  const trimmed = (rawUrl || "").trim().replace(/^["']|["']$/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("/uploads/")) {
    return `/api/media/${trimmed.slice("/uploads/".length)}`;
  }
  return trimmed;
}

export function extractImagesFromMarkdown(md: string): {
  rawMatch: string;
  alt: string;
  src: string;
}[] {
  const results: { rawMatch: string; alt: string; src: string }[] = [];
  if (!md) return results;

  // 1. Standard Markdown images: ![alt](url) (excluding ![video:...], ![audio:...], ![tarot:...])
  const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdRegex.exec(md)) !== null) {
    const rawAlt = (match[1] || "").trim();
    if (/^(video|audio|tarot):/i.test(rawAlt) || /^(video|audio)$/i.test(rawAlt)) {
      continue;
    }
    const rawUrl = (match[2] || "").trim().replace(/^["']|["']$/g, "");
    if (/\.(mp4|webm|ogg|mov|mkv)(\?.*)?$/i.test(rawUrl)) {
      continue;
    }
    results.push({
      rawMatch: match[0],
      alt: rawAlt || "Imagem anexada",
      src: normalizeMediaSrc(rawUrl),
    });
  }

  // 2. Obsidian-style embedded images: ![[arquivo.png|legenda]]
  const obsRegex = /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  while ((match = obsRegex.exec(md)) !== null) {
    const target = (match[1] || "").trim();
    const caption = (match[2] || "").trim();
    if (/\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i.test(target)) {
      const src =
        target.startsWith("http") || target.startsWith("/")
          ? normalizeMediaSrc(target)
          : `/api/media/${target}`;
      results.push({
        rawMatch: match[0],
        alt: caption || target,
        src,
      });
    }
  }

  return results;
}

export const MagickCodeMirror = forwardRef<MagickCodeMirrorHandle, MagickCodeMirrorProps>(
  (
    {
      value,
      onChange,
      onSave,
      onFileUpload,
      placeholder = "Descreva sua operação mágica, meditação, sonhos, sincronicidades... (Cole imagens com Ctrl+V ou arraste arquivos aqui)",
      minHeight = "450px",
      className = "",
    },
    ref
  ) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);
    const onFileUploadRef = useRef(onFileUpload);
    onFileUploadRef.current = onFileUpload;

    const [showInlineMediaStrip, setShowInlineMediaStrip] = useState(true);
    const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

    // Expõe métodos imperativos para toolbar e atalhos
    useImperativeHandle(ref, () => ({
      insertFormatting: (before: string, after: string = "") => {
        const view = editorRef.current?.view;
        if (!view) {
          // Fallback caso o editor não esteja focado no momento do modal fechar
          onChange(`${value}${before}${after}`);
          return;
        }

        const { from, to } = view.state.selection.main;
        const selectedText = view.state.sliceDoc(from, to);
        const replacement = `${before}${selectedText}${after}`;

        view.dispatch({
          changes: { from, to, insert: replacement },
          selection: { anchor: from + before.length + selectedText.length },
        });
        view.focus();
      },
      focus: () => {
        editorRef.current?.view?.focus();
      },
    }));

    // Extensões customizadas do CodeMirror (incluindo Paste e Drop de imagens!)
    const extensions = useMemo(() => {
      const baseExtensions = [
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          paste(event) {
            const items = event.clipboardData?.items;
            if (!items || !onFileUploadRef.current) return false;
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                  event.preventDefault();
                  onFileUploadRef.current(file);
                  return true;
                }
              }
            }
            return false;
          },
          drop(event) {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0 || !onFileUploadRef.current) return false;
            const file = files[0];
            if (
              file.type.startsWith("image/") ||
              file.type.startsWith("video/") ||
              file.type.startsWith("audio/")
            ) {
              event.preventDefault();
              onFileUploadRef.current(file);
              return true;
            }
            return false;
          },
        }),
        EditorView.theme({
          "&": {
            backgroundColor: "transparent !important",
            fontSize: "15px",
            fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          },
          ".cm-content": {
            padding: "16px 12px",
            caretColor: "#F59E0B",
          },
          ".cm-line": {
            lineHeight: "1.8",
            padding: "0 4px",
          },
          "&.cm-focused": {
            outline: "none !important",
          },
          ".cm-cursor": {
            borderLeftColor: "#F59E0B",
            borderLeftWidth: "2.5px",
          },
          ".cm-selectionBackground, ::selection": {
            backgroundColor: "rgba(245, 158, 11, 0.25) !important",
          },
          ".cm-header": {
            color: "#FDE68A",
            fontWeight: "bold",
          },
          ".cm-header-1": {
            fontSize: "1.45em",
            color: "#FBBF24",
          },
          ".cm-header-2": {
            fontSize: "1.25em",
            color: "#FCD34D",
          },
          ".cm-header-3": {
            fontSize: "1.1em",
            color: "#FEF08A",
          },
          ".cm-strong": {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
          ".cm-emphasis": {
            color: "#E2E8F0",
            fontStyle: "italic",
          },
          ".cm-quote": {
            color: "#CBD5E1",
            fontStyle: "italic",
            borderLeft: "3px solid #D97706",
            paddingLeft: "8px",
          },
          ".cm-link": {
            color: "#93C5FD",
            textDecoration: "underline",
          },
        }),
      ];

      return baseExtensions;
    }, []);

    // Extrai imagens presentes na nota para exibição visual imediata no editor
    const detectedImages = useMemo(() => extractImagesFromMarkdown(value), [value]);

    // Atalhos de Teclado no CodeMirror
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
      }
    };

    const handleRemoveImageFromDoc = (rawMatch: string) => {
      const updated = value.replace(rawMatch, "").replace(/\n{3,}/g, "\n\n");
      onChange(updated);
    };

    return (
      <div onKeyDown={handleKeyDown} className={`relative rounded-lg overflow-hidden flex flex-col ${className}`}>
        <CodeMirror
          ref={editorRef}
          value={value}
          minHeight={minHeight}
          theme={oneDark}
          extensions={extensions}
          placeholder={placeholder}
          onChange={onChange}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
          }}
          className="text-stone-200"
        />

        {/* Galeria Visual ao Vivo das Imagens Anexadas na Nota (Modo Edição) */}
        {detectedImages.length > 0 && (
          <div className="border-t border-medium-700 bg-medium-900/90 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-semibold">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  IMAGENS NA NOTA ({detectedImages.length}) — VISUALIZAÇÃO AO VIVO
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInlineMediaStrip((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-mono text-medium-400 hover:text-white px-2 py-0.5 rounded bg-medium-800 border border-medium-700 transition-colors"
              >
                {showInlineMediaStrip ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar Miniaturas</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Mostrar Miniaturas</span>
                  </>
                )}
              </button>
            </div>

            {showInlineMediaStrip && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {detectedImages.map((img, idx) => (
                  <div
                    key={`${img.src}-${idx}`}
                    className="group relative rounded-lg overflow-hidden border border-medium-700 bg-black/60 flex flex-col shadow-md hover:border-amber-400/60 transition-all"
                  >
                    <div
                      onClick={() => setZoomImage(img)}
                      className="relative h-40 w-full bg-black/80 flex items-center justify-center cursor-pointer overflow-hidden"
                      title="Clique para ampliar a imagem"
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="px-2.5 py-1 rounded-full bg-black/80 text-white text-[11px] font-mono flex items-center gap-1 border border-white/20">
                          <Maximize2 className="w-3 h-3 text-amber-400" />
                          Ampliar
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1.5 bg-medium-850 border-t border-medium-750 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-medium-200 truncate" title={img.alt}>
                        {img.alt}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageFromDoc(img.rawMatch)}
                        className="p-1 text-medium-400 hover:text-red-400 rounded hover:bg-medium-800 transition-colors shrink-0"
                        title="Remover imagem da nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lightbox de Zoom da Imagem */}
        {zoomImage && (
          <div
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <img
              src={zoomImage.src}
              alt={zoomImage.alt}
              className="max-h-[85vh] max-w-[92vw] object-contain rounded-xl border border-medium-700 shadow-2xl"
            />
            {zoomImage.alt && (
              <p className="mt-3 text-xs font-mono text-medium-200 bg-medium-850/90 px-4 py-1.5 rounded-full border border-medium-700">
                {zoomImage.alt}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

MagickCodeMirror.displayName = "MagickCodeMirror";
