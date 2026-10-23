import { NextResponse } from "next/server";
import { getAppSetting } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || getAppSetting("ollama_endpoint") || "http://localhost:11434";
  const cleanEndpoint = endpoint.replace(/\/+$/, "");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${cleanEndpoint}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Ollama respondeu com status ${res.status}`,
      });
    }

    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models.map((m: any) => m.name) : [];

    return NextResponse.json({
      success: true,
      online: true,
      endpoint: cleanEndpoint,
      models,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      online: false,
      error:
        err.name === "AbortError"
          ? "Tempo limite esgotado ao conectar ao Ollama (serviço offline)."
          : `Não foi possível conectar ao Ollama em ${cleanEndpoint}: ${err.message}`,
    });
  }
}
