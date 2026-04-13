import { NextResponse } from "next/server";

export function mobileOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function mobileError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function requireObject(
  value: unknown,
  field = "body"
): Record<string, unknown> | { error: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: `${field} must be an object` };
  }

  return value as Record<string, unknown>;
}

export function requireArray<T = unknown>(
  value: unknown,
  field: string
): T[] | { error: string } {
  if (!Array.isArray(value)) {
    return { error: `${field} must be an array` };
  }

  return value as T[];
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

export function parseQuality(
  value: unknown,
  fallback = 3
): number | { error: string } {
  const raw = value ?? fallback;
  const parsed =
    typeof raw === "number"
      ? raw
      : parseInt(typeof raw === "string" ? raw : String(raw), 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return { error: "quality must be between 1 and 5" };
  }

  return parsed;
}
