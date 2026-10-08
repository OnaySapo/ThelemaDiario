import { NextResponse } from "next/server";
import { getFullAstrologicalData } from "@/lib/astronomy";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const astro = getFullAstrologicalData(date);
    return NextResponse.json({ success: true, ...astro });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
