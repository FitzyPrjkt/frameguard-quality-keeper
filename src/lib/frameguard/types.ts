/** A single metadata value. Missing data is never fabricated: it is "unknown" or "unavailable". */
export type Field =
  | { kind: "measured"; value: string }
  | { kind: "unknown"; note?: string }
  | { kind: "unavailable"; note?: string };

export interface MetadataRow {
  key: string;
  label: string;
  field: Field;
}

export interface MetadataGroup {
  id: "video" | "audio" | "container" | "additional";
  title: string;
  rows: MetadataRow[];
}

/** How a platform capability is known. */
export type EvidenceClass = "official" | "empirical" | "secondary" | "unknown" | "conflicting";

export type Assessment =
  | "compatible"
  | "needs_adjustment"
  | "unknown"
  | "unsupported"
  | "insufficient_evidence";

export type Fix = "remux" | "reencode";

export interface CompatibilityRow {
  id: string;
  parameter: string;
  source: Field;
  capability: { value: string; evidence: EvidenceClass };
  assessment: Assessment;
  explanation: string;
  /** Operation needed to resolve a verified violation. */
  fix?: Fix;
  /** Expected output value after preparation (only when adjusted). */
  target?: string;
  qualityImpact?: string;
}

export type Decision =
  | "NO_CHANGE"
  | "SMART_REMUX"
  | "CONDITIONAL_REENCODE"
  | "UNSUPPORTED"
  | "INSUFFICIENT_EVIDENCE";

export type ProfileStatus = "verified" | "partial" | "unverified" | "insufficient";

export interface PlatformCapability {
  parameter: string;
  value: string;
  evidence: EvidenceClass;
  source: string;
}

export interface PlatformProfile {
  id: string;
  platform: string;
  name: string;
  version: string;
  status: ProfileStatus;
  evidenceSummary: string;
  lastVerified: string | null;
  isDemo: boolean;
  capabilities: PlatformCapability[];
}

export type VerificationState = "passed" | "warning" | "failed" | "inconclusive";

export interface VerificationCheck {
  id: string;
  label: string;
  source: string;
  output: string;
  result: VerificationState;
  note: string;
}

export interface VerificationResult {
  overall: VerificationState;
  summary: string;
  checks: VerificationCheck[];
  unexpectedChanges: string[];
}

export interface ScenarioProcessing {
  stages: string[];
  /** Progress percentage at which the simulated job fails, if it fails. */
  failAt?: number;
  failureMessage?: string;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  profileId: string;
  metadata: MetadataGroup[];
  compatibility: CompatibilityRow[];
  processing: ScenarioProcessing;
  verification: VerificationResult | null;
  output: { sizeLabel: string } | null;
}

export interface SelectedFile {
  name: string;
  sizeBytes: number;
  type: string;
  /** Duration read by the browser's media element, when it could be read. */
  durationSeconds: number | null;
  isSample: boolean;
  /** Local object URL for in-browser preview of a user-selected file. */
  previewUrl?: string;
}

export interface HistoryEntry {
  id: string;
  filename: string;
  date: string;
  decision: Decision;
  verification: VerificationState | "not_run";
  sourceProfile: string;
  platformProfile: string;
  isDemo: boolean;
}
