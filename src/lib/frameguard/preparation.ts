import type { CompatibilityRow, Decision, Field } from "./types";

/**
 * Derives the preparation decision from compatibility results.
 * Rules:
 * - Anything FrameGuard cannot handle blocks preparation (UNSUPPORTED).
 * - Unknown/insufficient platform evidence never triggers automatic conversion.
 * - Only verified violations are adjusted; container-only fixes prefer remuxing.
 */
export function decidePreparation(rows: CompatibilityRow[]): Decision {
  if (rows.some((r) => r.assessment === "unsupported")) return "UNSUPPORTED";
  if (rows.some((r) => r.assessment === "insufficient_evidence")) return "INSUFFICIENT_EVIDENCE";

  const verifiedViolations = rows.filter(
    (r) => r.assessment === "needs_adjustment" && isVerifiedEvidence(r.capability.evidence),
  );
  if (verifiedViolations.some((r) => r.fix === "reencode")) return "CONDITIONAL_REENCODE";
  if (verifiedViolations.some((r) => r.fix === "remux")) return "SMART_REMUX";
  return "NO_CHANGE";
}

export function isVerifiedEvidence(e: CompatibilityRow["capability"]["evidence"]): boolean {
  return e === "official" || e === "empirical" || e === "secondary";
}

/** Whether "Generate Prepared Video" may run. Lossy re-encoding requires explicit authorization. */
export function canGenerate(decision: Decision, lossyAuthorized: boolean): boolean {
  if (decision === "SMART_REMUX") return true;
  if (decision === "CONDITIONAL_REENCODE") return lossyAuthorized;
  return false;
}

export function isLossy(decision: Decision): boolean {
  return decision === "CONDITIONAL_REENCODE";
}

/** Output is always a new file; the original is never overwritten. */
export function outputFilename(source: string, suffix = "frameguard"): string {
  const clean = suffix.trim().replace(/[^a-zA-Z0-9_-]/g, "") || "frameguard";
  const dot = source.lastIndexOf(".");
  const base = dot > 0 ? source.slice(0, dot) : source;
  return `${base}.${clean}.mp4`;
}

export function groupRows(rows: CompatibilityRow[]) {
  return {
    preserve: rows.filter((r) => r.assessment === "compatible"),
    adjust: rows.filter((r) => r.assessment === "needs_adjustment"),
    cannotHandle: rows.filter(
      (r) =>
        r.assessment === "unsupported" ||
        r.assessment === "insufficient_evidence" ||
        r.assessment === "unknown",
    ),
  };
}

export function fieldText(f: Field): string {
  if (f.kind === "measured") return f.value;
  return f.kind === "unknown" ? "Unknown" : "Not available";
}

export const decisionMeta: Record<
  Decision,
  { label: string; method: string; summary: string; modifiesStreams: boolean }
> = {
  NO_CHANGE: {
    label: "No change",
    method: "None",
    summary: "The source already meets every verified capability. No processing is needed.",
    modifiesStreams: false,
  },
  SMART_REMUX: {
    label: "Smart remux",
    method: "Stream copy into a new container",
    summary:
      "Audio and video streams are copied bit-for-bit into a new container. No re-encoding, no quality loss.",
    modifiesStreams: false,
  },
  CONDITIONAL_REENCODE: {
    label: "Conditional re-encode",
    method: "Targeted re-encode of affected stream only",
    summary:
      "A verified violation can only be resolved by re-encoding. This is lossy and requires your authorization.",
    modifiesStreams: true,
  },
  UNSUPPORTED: {
    label: "Unsupported",
    method: "Not available",
    summary:
      "The required change is outside what FrameGuard can do without compromising quality or integrity.",
    modifiesStreams: false,
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient evidence",
    method: "Not available",
    summary:
      "Some platform limits are unknown or conflicting. FrameGuard will not convert based on guesses.",
    modifiesStreams: false,
  },
};
