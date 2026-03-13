/**
 * SM-2 spaced repetition algorithm.
 * Returns new interval (days) and ease factor after a review.
 *
 * @param quality   - Review quality score (0-5). 0-2 = fail, 3-5 = pass.
 * @param prevInterval - Previous interval in days.
 * @param prevEaseFactor - Previous ease factor (minimum 1.3).
 * @param reviewCount - Number of successful reviews so far.
 */
export function sm2(
  quality: number,
  prevInterval: number,
  prevEaseFactor: number,
  reviewCount: number
): { interval: number; easeFactor: number } {
  // Clamp quality to 0-5
  const q = Math.max(0, Math.min(5, quality));

  // New ease factor
  const newEF = Math.max(
    1.3,
    prevEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  if (q < 3) {
    // Failed: reset interval to 1, keep ease factor from dropping too fast
    return { interval: 1, easeFactor: newEF };
  }

  // Passed: compute next interval
  let interval: number;
  if (reviewCount === 0) {
    interval = 1;
  } else if (reviewCount === 1) {
    interval = 6;
  } else {
    interval = Math.round(prevInterval * prevEaseFactor);
  }

  return { interval, easeFactor: newEF };
}
