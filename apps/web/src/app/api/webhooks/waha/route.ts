import { processWahaMessage } from "@myrehat-task-b/api";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const result = await processWahaMessage(rawBody);
  return NextResponse.json(result.data, { status: result.status });
}
