import { NextResponse } from "next/server";
import { getAppSetting, setAppSetting } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "gemini_api_key";
    const value = getAppSetting(key);

    // Mask only sensitive credentials
    const isSensitive = key.includes("key") || key.includes("secret") || key.includes("password");
    const masked = isSensitive
      ? value
        ? `${value.slice(0, 4)}...${value.slice(-4)}`
        : ""
      : value;

    return NextResponse.json({
      success: true,
      key,
      hasKey: Boolean(value),
      value: value || "",
      masked,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key) {
      return NextResponse.json({ success: false, error: "Chave não informada." }, { status: 400 });
    }
    setAppSetting(key, value || "");
    return NextResponse.json({ success: true, message: "Configuração atualizada com sucesso." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
