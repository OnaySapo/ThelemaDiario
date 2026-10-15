import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const decodedFilename = decodeURIComponent(filename || "");

    const fileParam = req.nextUrl.searchParams.get("file");
    const filenameToFind = fileParam ? decodeURIComponent(fileParam) : decodedFilename;

    const publicTarotDir = path.join(process.cwd(), "public", "tarot");
    const localRawDir = path.join(process.cwd(), "Tarot de Toth");

    let targetPath = path.join(publicTarotDir, filenameToFind);
    if (!fs.existsSync(targetPath)) {
      targetPath = path.join(localRawDir, filenameToFind);
    }

    if (!fs.existsSync(targetPath)) {
      return new NextResponse(`Image not found: ${filenameToFind}`, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Erro ao servir imagem do Tarot:", err);
    return new NextResponse(`Erro ao carregar imagem: ${err.message}`, { status: 500 });
  }
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const decodedFilename = decodeURIComponent(filename || "");

    const fileParam = req.nextUrl.searchParams.get("file");
    const filenameToFind = fileParam ? decodeURIComponent(fileParam) : decodedFilename;

    const publicTarotDir = path.join(process.cwd(), "public", "tarot");
    const localRawDir = path.join(process.cwd(), "Tarot de Toth");

    let targetPath = path.join(publicTarotDir, filenameToFind);
    if (!fs.existsSync(targetPath)) {
      targetPath = path.join(localRawDir, filenameToFind);
    }

    if (!fs.existsSync(targetPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stat = await fs.promises.stat(targetPath);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
