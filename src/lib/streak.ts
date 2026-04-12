function toUtcDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function calculateUserStreak(
  activeDateKeys: Iterable<string>,
  today = new Date()
): number {
  const dates = new Set(activeDateKeys);
  if (dates.size === 0) return 0;

  let streak = 0;

  for (let i = 0; i <= 365; i++) {
    const day = new Date(today);
    day.setUTCHours(12, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - i);
    const key = toUtcDateKey(day);

    if (dates.has(key)) {
      streak++;
      continue;
    }

    if (i === 0) {
      // Grace period: allow "not active yet today" if yesterday was active.
      continue;
    }

    break;
  }

  return streak;
}
