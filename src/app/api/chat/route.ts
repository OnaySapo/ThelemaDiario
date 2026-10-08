import { NextResponse } from "next/server";
import { processChatRequest } from "@/lib/aiService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Mensagem não informada." }, { status: 400 });
    }

    const reply = await processChatRequest(message);
    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error("Erro na API chat:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
