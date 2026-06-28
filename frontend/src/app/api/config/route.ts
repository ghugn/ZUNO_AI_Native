import { NextResponse } from "next/server";

export async function GET() {
  // Return the configured backend API URL so client-side static pages can connect automatically
  let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  // Ensure it has /api suffix if not present
  if (apiBaseUrl && !apiBaseUrl.endsWith("/api")) {
    apiBaseUrl = `${apiBaseUrl.replace(/\/$/, "")}/api`;
  }

  return NextResponse.json({ apiBaseUrl });
}
