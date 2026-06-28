import { NextResponse } from "next/server";

export async function GET() {
  // Use explicit bank API URL, fall back to main API URL, or localhost
  let apiBaseUrl = process.env.NEXT_PUBLIC_MOCK_BANK_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  // Ensure it has /api suffix if not present
  if (apiBaseUrl && !apiBaseUrl.endsWith("/api")) {
    apiBaseUrl = `${apiBaseUrl.replace(/\/$/, "")}/api`;
  }

  return NextResponse.json({ apiBaseUrl });
}
