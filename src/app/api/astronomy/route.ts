import { NextResponse } from "next/server";
import { getFullAstrologicalData } from "@/lib/astronomy";
import { getAppSetting } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Prioritize query parameters, then persisted app settings, then São Paulo default
    const paramLat = searchParams.get("lat");
    const paramLng = searchParams.get("lng");

    const savedLat = getAppSetting("geo_latitude");
    const savedLng = getAppSetting("geo_longitude");
    const savedCity = getAppSetting("geo_city") || "São Paulo (Padrão)";

    const latitude = paramLat ? parseFloat(paramLat) : savedLat ? parseFloat(savedLat) : -23.5505;
    const longitude = paramLng ? parseFloat(paramLng) : savedLng ? parseFloat(savedLng) : -46.6333;

    const astro = getFullAstrologicalData(date, latitude, longitude);
    return NextResponse.json({
      success: true,
      locationName: savedCity,
      latitude,
      longitude,
      ...astro,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
