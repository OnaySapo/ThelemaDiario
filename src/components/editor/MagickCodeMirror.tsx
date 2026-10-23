"use client";

import React, { useMemo, forwardRef, useImperativeHandle, useRef } from "react";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

export interface MagickCodeMirrorHandle {
  insertFormatting: (before: string, after?: string) => void;
  focus: () => void;
}

interface MagickCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  onWikilinkTrigger?: (query: string, coords: { x: number; y: number }) => void;
  onSlashTrigger?: (coords: { x: number; y: number }) => void;
}

export const MagickCodeMirror = forwardRef<MagickCodeMirrorHandle, MagickCodeMirrorProps>(
  (
    {
      value,
      onChange,
      onSave,
      placeholder = "Descreva sua operação mágica, meditação, sonhos, sincronicidades...",
      minHeight = "450px",
      className = "",
      onWikilinkTrigger,
      onSlashTrigger,
    },
    ref
  ) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);

    // Expõe métodos imperativos para toolbar e atalhos
    useImperativeHandle(ref, () => ({
      insertFormatting: (before: string, after: string = "") => {
        const view = editorRef.current?.view;
        if (!view) return;

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

    // Extensões customizadas do CodeMirror
    const extensions = useMemo(() => {
      const baseExtensions = [
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        EditorView.theme({
          "&": {
            backgroundColor: "transparent !important",
            fontSize: "14px",
            fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
          },
          ".cm-content": {
            padding: "16px 8px",
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
          // Estilização semântica do Markdown inline
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

    // Atalhos de Teclado no CodeMirror
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
      }
    };

    return (
      <div onKeyDown={handleKeyDown} className={`relative rounded-lg overflow-hidden ${className}`}>
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
      </div>
    );
  }
);

MagickCodeMirror.displayName = "MagickCodeMirror";
