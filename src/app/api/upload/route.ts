import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getMediaDirectory } from "@/lib/db";

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  // Audio (Gravações de Voz e Áudio-Diário)
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/aac",
  "audio/x-m4a",
]);

const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validação de Tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Arquivo excede o limite máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        },
        { status: 400 }
      );
    }

    // Validação de Tipo MIME
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Formato de arquivo "${file.type}" não suportado. Envie imagens, vídeos ou gravações de áudio.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Pasta de mídia ativa dentro do Grimório / Banco de Dados escolhido
    const vaultMediaDir = getMediaDirectory();
    if (!fs.existsSync(vaultMediaDir)) {
      await fs.promises.mkdir(vaultMediaDir, { recursive: true });
    }

    // 2. Pasta public/uploads como espelho secundário de compatibilidade
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicUploadsDir)) {
      await fs.promises.mkdir(publicUploadsDir, { recursive: true });
    }

    // Sanitiza e gera nome de arquivo seguro
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedOriginal}`;

    const vaultFilePath = path.join(vaultMediaDir, uniqueFileName);
    await fs.promises.writeFile(vaultFilePath, buffer);

    try {
      const publicFilePath = path.join(publicUploadsDir, uniqueFileName);
      await fs.promises.writeFile(publicFilePath, buffer);
    } catch {}

    // URL dinâmica servida por /api/media/ (funciona em dev, start de produção e Tauri!)
    const dynamicMediaUrl = `/api/media/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: dynamicMediaUrl,
      fileUrl: dynamicMediaUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Erro no upload de mídia:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno ao processar upload" },
      { status: 500 }
    );
  }
}
