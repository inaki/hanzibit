export function canAccessHskLevelFromPlan(
  level: number,
  isPro: boolean
): boolean {
  if (level <= 1) return true;
  return isPro;
}
