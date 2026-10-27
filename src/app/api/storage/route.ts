import { NextResponse } from "next/server";
import {
  getStorageInfo,
  setStorageDirectory,
  resetStorageDirectory,
  inspectDatabaseLocation,
} from "@/lib/db";

export async function GET() {
  try {
    const info = getStorageInfo();
    const inspection = inspectDatabaseLocation(info.dbFile);
    return NextResponse.json({
      success: true,
      ...info,
      inspection,
    });
  } catch (err: any) {
    console.error("Erro na API storage GET:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      path: newPath,
      copyExisting = false,
      seedExamples = true,
      dbFileName,
      vaultName,
    } = body;

    if (action === "inspect") {
      const inspection = inspectDatabaseLocation(newPath || "");
      return NextResponse.json(inspection);
    }

    if (action === "reset") {
      const result = resetStorageDirectory();
      const updatedInfo = getStorageInfo();
      return NextResponse.json({ ...result, ...updatedInfo });
    }

    if (action === "confirm_current") {
      const info = getStorageInfo();
      const result = setStorageDirectory(info.currentPath, false, {
        dbFileName: info.dbFileName,
        seedExamples: true,
      });
      const updatedInfo = getStorageInfo();
      return NextResponse.json({ ...result, ...updatedInfo });
    }

    if (!newPath || typeof newPath !== "string") {
      return NextResponse.json(
        { success: false, error: "O caminho da pasta ou do arquivo .db é obrigatório." },
        { status: 400 }
      );
    }

    const result = setStorageDirectory(newPath, copyExisting, {
      seedExamples,
      dbFileName,
      vaultName,
    });

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
