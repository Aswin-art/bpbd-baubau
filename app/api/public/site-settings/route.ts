import { NextResponse } from "next/server";
import { publicSiteSettingsService } from "@/modules/public/site-settings";

export async function GET() {
  const data = await publicSiteSettingsService.getSettings();
  return NextResponse.json(data);
}

