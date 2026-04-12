import { NextResponse } from "next/server";

export function mobileOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function mobileError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function requireString(
  value: unknown,
  field: string
): string | { error: string } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { error: `${field} is required` };
  }

  return value.trim();
}

export function parseLevel(
  value: unknown,
  fallback = 1
): number | { error: string } {
  const raw = value ?? fallback;
  const parsed =
    typeof raw === "number"
      ? raw
      : parseInt(typeof raw === "string" ? raw : String(raw), 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 6) {
    return { error: "hsk_level must be between 1 and 6" };
  }

  return parsed;
}
