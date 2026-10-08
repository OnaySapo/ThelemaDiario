import { NextResponse } from "next/server";
import { getEntryById, deleteEntry } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = getEntryById(id);
    if (!entry) {
      return NextResponse.json({ success: false, error: "Entrada não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteEntry(id);
    return NextResponse.json({ success: true, message: "Entrada excluída com sucesso." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
