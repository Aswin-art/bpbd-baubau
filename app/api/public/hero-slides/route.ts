import { NextResponse } from "next/server";
import { publicHeroSlidesService } from "@/modules/public/hero-slides";

export async function GET() {
  const data = await publicHeroSlidesService.getSlides();
  return NextResponse.json(data);
}

