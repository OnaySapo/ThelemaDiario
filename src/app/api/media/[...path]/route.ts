import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getMediaDirectory, getDefaultStorageDirectory } from "@/lib/db";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".aac": "audio/aac",
  ".m4a": "audio/x-m4a",
};

function resolveMediaFilePath(segments: string[]): string | null {
  const rawName = segments.map((s) => decodeURIComponent(s)).join("/");
  const safeBasename = path.basename(rawName);
  if (!safeBasename || safeBasename === "." || safeBasename === "..") {
    return null;
  }

  const candidateDirs = [
    getMediaDirectory(),
    path.join(process.cwd(), "public", "uploads"),
    path.join(getDefaultStorageDirectory(), "media"),
    path.join(process.cwd(), "data", "uploads"),
  ];

  for (const dir of candidateDirs) {
    const candidate = path.join(dir, safeBasename);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Filename required", { status: 400 });
    }

    const targetPath = resolveMediaFilePath(segments);
    if (!targetPath) {
      return new NextResponse(`Media not found: ${segments.join("/")}`, { status: 404 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Erro ao servir arquivo de mídia:", err);
    return new NextResponse(`Erro ao carregar mídia: ${err.message}`, { status: 500 });
  }
}

export async function HEAD(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const targetPath = resolveMediaFilePath(segments);
    if (!targetPath) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || "application/octet-stream";
    const stat = await fs.promises.stat(targetPath);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
