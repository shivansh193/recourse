// Gemini occasionally retypes a proper noun with a single character altered
// (seen in testing: "Müller" came back as "Múller" — an accented letter
// swapped for a visually similar one). Self-verification can't catch this
// because it's just another LLM judgment call reasoning over the same
// (already-corrupted) string, not a literal comparison against the source.
// This does the literal comparison: if the extracted value isn't found
// verbatim in the source text, it searches for the closest actual
// substring by edit distance and uses that instead — so a name on the
// filing is either the user's own words, character for character, or
// left as-is because no close match existed to substitute.

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function findVerbatimSpan(candidate: string, sourceText: string, maxDistanceRatio = 0.15): string {
  const trimmed = candidate.trim();
  if (!trimmed || trimmed.length < 2) return candidate;

  const normSource = sourceText.normalize("NFC");
  const normCandidate = trimmed.normalize("NFC");

  const idx = normSource.toLowerCase().indexOf(normCandidate.toLowerCase());
  if (idx !== -1) return normSource.slice(idx, idx + normCandidate.length);

  const len = normCandidate.length;
  const maxDistance = Math.max(1, Math.ceil(len * maxDistanceRatio));
  let best: { distance: number; text: string } | null = null;

  for (let start = 0; start <= normSource.length - Math.max(1, len - 2); start++) {
    for (const delta of [0, -1, 1, -2, 2]) {
      const windowLen = len + delta;
      if (windowLen <= 0 || start + windowLen > normSource.length) continue;
      const window = normSource.slice(start, start + windowLen);
      const distance = levenshtein(window.toLowerCase(), normCandidate.toLowerCase());
      if (!best || distance < best.distance) best = { distance, text: window };
    }
  }

  return best && best.distance <= maxDistance ? best.text : candidate;
}
