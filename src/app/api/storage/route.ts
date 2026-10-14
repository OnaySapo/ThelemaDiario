import { NextResponse } from "next/server";
import { getStorageInfo, setStorageDirectory, resetStorageDirectory } from "@/lib/db";

export async function GET() {
  try {
    const info = getStorageInfo();
    return NextResponse.json({ success: true, ...info });
  } catch (err: any) {
    console.error("Erro na API storage GET:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, path: newPath, copyExisting = true } = body;

    if (action === "reset") {
      const result = resetStorageDirectory();
      const updatedInfo = getStorageInfo();
      return NextResponse.json({ ...result, ...updatedInfo });
    }

    if (!newPath || typeof newPath !== "string") {
      return NextResponse.json(
        { success: false, error: "O caminho da pasta de armazenamento é obrigatório." },
        { status: 400 }
      );
    }

    const result = setStorageDirectory(newPath, copyExisting);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    const updatedInfo = getStorageInfo();
    return NextResponse.json({ ...result, ...updatedInfo });
  } catch (err: any) {
    console.error("Erro na API storage POST:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
