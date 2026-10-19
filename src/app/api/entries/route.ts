import { NextResponse } from "next/server";
import { getAllEntries, saveEntry } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;

    const entries = getAllEntries({ type, tag, search });
    return NextResponse.json({ success: true, entries });
  } catch (err: any) {
    console.error("Erro na API entries GET:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dados inválidos." }, { status: 400 });
    }

    const batchList = Array.isArray(body)
      ? body
      : Array.isArray(body.entries)
      ? body.entries
      : null;

    if (batchList) {
      let importedCount = 0;
      for (const item of batchList) {
        if (item && typeof item === "object" && (item.title || item.content)) {
          saveEntry(item);
          importedCount++;
        }
      }
      return NextResponse.json({ success: true, importedCount });
    }

    const saved = saveEntry(body);
    return NextResponse.json({ success: true, entry: saved });
  } catch (err: any) {
    console.error("Erro na API entries POST:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
