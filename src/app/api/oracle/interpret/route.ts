import { NextRequest, NextResponse } from "next/server";
import { interpretOracleSpread } from "@/lib/aiService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, spreadName, cards } = body;

    const interpretation = await interpretOracleSpread({
      query,
      spreadName,
      cards,
    });

    return NextResponse.json({
      success: true,
      interpretation,
    });
  } catch (err: any) {
    console.error("Erro na API de interpretação oracular:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
