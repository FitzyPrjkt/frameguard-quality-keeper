/**
 * Centralized synthetic data for the FrameGuard prototype.
 * DEMO DATA — NOT A VERIFIED TIKTOK CAPABILITY PROFILE.
 * Nothing in this file is a real platform requirement or a real measurement.
 */
import type {
  CompatibilityRow,
  Field,
  HistoryEntry,
  MetadataGroup,
  PlatformProfile,
  Scenario,
} from "./types";

export const DEMO_LABEL = "DEMO DATA — NOT A VERIFIED TIKTOK CAPABILITY PROFILE";

const m = (value: string): Field => ({ kind: "measured", value });
const unknown = (note?: string): Field => ({ kind: "unknown", note });
const na = (note?: string): Field => ({ kind: "unavailable", note });

export const SAMPLE_FILE = {
  name: "sample-video.mp4",
  sizeBytes: 45 * 1024 * 1024,
  type: "video/mp4",
  durationSeconds: 30,
  isSample: true,
} as const;

export const SUPPORTED_FORMATS = ["MP4", "MOV", "M4V", "MKV", "WEBM"];

/* ------------------------------------------------------------------ */
/* Platform profiles                                                   */
/* ------------------------------------------------------------------ */

export const PROFILES: PlatformProfile[] = [
  {
    id: "tiktok-web-demo",
    platform: "TikTok Web",
    name: "TikTok Web — Demo Profile",
    version: "0.4-demo",
    status: "unverified",
    evidenceSummary: "Mixed (synthetic)",
    lastVerified: null,
    isDemo: true,
    capabilities: [
      { parameter: "Container", value: "MP4", evidence: "official", source: "Synthetic citation — demo help article" },
      { parameter: "Video codec", value: "H.264", evidence: "official", source: "Synthetic citation — demo help article" },
      { parameter: "Resolution", value: "Up to 1920 × 1080", evidence: "secondary", source: "Synthetic — community report" },
      { parameter: "Frame rate", value: "Up to 60 fps", evidence: "empirical", source: "Synthetic — demo upload test" },
      { parameter: "Video bitrate", value: "Up to 16 Mbps", evidence: "empirical", source: "Synthetic — demo upload test" },
      { parameter: "Pixel format", value: "yuv420p (8-bit)", evidence: "empirical", source: "Synthetic — demo upload test" },
      { parameter: "Audio codec", value: "AAC", evidence: "official", source: "Synthetic citation — demo help article" },
      { parameter: "Sample rate", value: "44.1 kHz or 48 kHz", evidence: "secondary", source: "Synthetic — community report" },
      { parameter: "Faststart", value: "Required", evidence: "empirical", source: "Synthetic — demo upload test" },
      { parameter: "HDR", value: "SDR only", evidence: "conflicting", source: "Synthetic — two sources disagree" },
      { parameter: "Maximum duration", value: "Not established", evidence: "unknown", source: "No evidence collected" },
    ],
  },
  {
    id: "tiktok-web-pending",
    platform: "TikTok Web",
    name: "TikTok Web — Evidence Pending",
    version: "0.1-draft",
    status: "insufficient",
    evidenceSummary: "Mostly unknown",
    lastVerified: null,
    isDemo: true,
    capabilities: [
      { parameter: "Container", value: "MP4", evidence: "official", source: "Synthetic citation — demo help article" },
      { parameter: "Video codec", value: "H.264", evidence: "official", source: "Synthetic citation — demo help article" },
      { parameter: "Frame rate", value: "Not established", evidence: "unknown", source: "No evidence collected" },
      { parameter: "Video bitrate", value: "8 Mbps vs 20 Mbps", evidence: "conflicting", source: "Synthetic — two sources disagree" },
      { parameter: "Audio codec", value: "AAC", evidence: "secondary", source: "Synthetic — community report" },
    ],
  },
  {
    id: "web-mp4-baseline-demo",
    platform: "Generic web player",
    name: "Web MP4 Baseline — Demo",
    version: "1.0-demo",
    status: "partial",
    evidenceSummary: "Official + empirical (synthetic)",
    lastVerified: "2026-10-02",
    isDemo: true,
    capabilities: [
      { parameter: "Container", value: "MP4", evidence: "official", source: "Synthetic citation — demo spec" },
      { parameter: "Video codec", value: "H.264", evidence: "official", source: "Synthetic citation — demo spec" },
      { parameter: "Audio codec", value: "AAC", evidence: "official", source: "Synthetic citation — demo spec" },
      { parameter: "Faststart", value: "Recommended", evidence: "empirical", source: "Synthetic — demo playback test" },
    ],
  },
];

export const getProfile = (id: string) => PROFILES.find((p) => p.id === id) ?? PROFILES[0];

/* ------------------------------------------------------------------ */
/* Source metadata                                                     */
/* ------------------------------------------------------------------ */

interface SourceSpec {
  codec: string;
  profile: string;
  resolution: string;
  aspect: string;
  fps: string;
  bitrate: string;
  pixfmt: string;
  audioCodec: string;
  sampleRate: string;
  channels: string;
  audioBitrate: Field;
  container: string;
  duration: string;
  size: string;
  faststart: Field;
  hdr: string;
  bitDepth: string;
  color: Field;
  fpsMode: string;
}

const BASE: SourceSpec = {
  codec: "H.264 (AVC)",
  profile: "High @ L4.2",
  resolution: "1920 × 1080",
  aspect: "16:9",
  fps: "60 fps",
  bitrate: "12.0 Mbps",
  pixfmt: "yuv420p",
  audioCodec: "AAC-LC",
  sampleRate: "48000 Hz",
  channels: "2 (stereo)",
  audioBitrate: m("192 kbps"),
  container: "MP4 (ISO BMFF)",
  duration: "00:30",
  size: "45 MB",
  faststart: m("Yes — moov at start"),
  hdr: "None (SDR)",
  bitDepth: "8-bit",
  color: m("BT.709 / limited range"),
  fpsMode: "CFR",
};

function metadata(s: SourceSpec): MetadataGroup[] {
  return [
    {
      id: "video",
      title: "Video",
      rows: [
        { key: "codec", label: "Codec", field: m(s.codec) },
        { key: "resolution", label: "Resolution", field: m(s.resolution) },
        { key: "aspect", label: "Aspect ratio", field: m(s.aspect) },
        { key: "fps", label: "Frame rate", field: m(s.fps) },
        { key: "bitrate", label: "Bitrate", field: m(s.bitrate) },
        { key: "pixfmt", label: "Pixel format", field: m(s.pixfmt) },
        { key: "profile", label: "Profile / level", field: m(s.profile) },
      ],
    },
    {
      id: "audio",
      title: "Audio",
      rows: [
        { key: "acodec", label: "Codec", field: m(s.audioCodec) },
        { key: "rate", label: "Sample rate", field: m(s.sampleRate) },
        { key: "channels", label: "Channels", field: m(s.channels) },
        { key: "abitrate", label: "Bitrate", field: s.audioBitrate },
      ],
    },
    {
      id: "container",
      title: "Container",
      rows: [
        { key: "format", label: "Format", field: m(s.container) },
        { key: "duration", label: "Duration", field: m(s.duration) },
        { key: "size", label: "File size", field: m(s.size) },
        { key: "faststart", label: "Faststart", field: s.faststart },
      ],
    },
    {
      id: "additional",
      title: "Additional information",
      rows: [
        { key: "hdr", label: "HDR", field: m(s.hdr) },
        { key: "depth", label: "Bit depth", field: m(s.bitDepth) },
        { key: "color", label: "Color metadata", field: s.color },
        { key: "mode", label: "Frame rate mode", field: m(s.fpsMode) },
        { key: "rotation", label: "Rotation", field: na("Tag not present in container") },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Compatibility rows                                                  */
/* ------------------------------------------------------------------ */

const ok = (
  id: string,
  parameter: string,
  source: string,
  cap: string,
  evidence: CompatibilityRow["capability"]["evidence"],
  explanation = "Source value is within the documented capability. Preserved as-is.",
): CompatibilityRow => ({
  id,
  parameter,
  source: m(source),
  capability: { value: cap, evidence },
  assessment: "compatible",
  explanation,
});

function compatibleRows(s: SourceSpec): CompatibilityRow[] {
  return [
    ok("container", "Container", s.container, "MP4", "official"),
    ok("vcodec", "Video codec", s.codec, "H.264", "official"),
    ok("resolution", "Resolution", s.resolution, "Up to 1920 × 1080", "secondary"),
    ok("fps", "Frame rate", s.fps, "Up to 60 fps", "empirical"),
    ok("bitrate", "Video bitrate", s.bitrate, "Up to 16 Mbps", "empirical"),
    ok("pixfmt", "Pixel format", s.pixfmt, "yuv420p (8-bit)", "empirical"),
    ok("acodec", "Audio codec", s.audioCodec, "AAC", "official"),
    ok("rate", "Sample rate", s.sampleRate, "44.1 kHz or 48 kHz", "secondary"),
    ok("faststart", "Faststart", "Yes — moov at start", "Required", "empirical"),
    {
      id: "duration",
      parameter: "Duration",
      source: m(s.duration),
      capability: { value: "Not established", evidence: "unknown" },
      assessment: "unknown",
      explanation:
        "No evidence for a duration limit. Not used to make any decision, and no guarantee is implied.",
    },
  ];
}

const replace = (rows: CompatibilityRow[], ...next: CompatibilityRow[]) =>
  rows.map((r) => next.find((n) => n.id === r.id) ?? r);

const REMUX_SPEC: SourceSpec = { ...BASE, faststart: m("No — moov at end") };
const REENCODE_SPEC: SourceSpec = { ...BASE, bitrate: "24.0 Mbps", size: "90 MB" };
const HDR_SPEC: SourceSpec = {
  ...BASE,
  codec: "H.265 (HEVC)",
  profile: "Main 10 @ L5.1",
  pixfmt: "yuv420p10le",
  bitrate: "14.2 Mbps",
  size: "53 MB",
  hdr: "HDR10 (PQ)",
  bitDepth: "10-bit",
  color: m("BT.2020 / PQ / limited range"),
};
const INSUFFICIENT_SPEC: SourceSpec = { ...BASE, audioBitrate: unknown("Not reported by container") };

const remuxRow: CompatibilityRow = {
  id: "faststart",
  parameter: "Faststart",
  source: m("No — moov at end"),
  capability: { value: "Required", evidence: "empirical" },
  assessment: "needs_adjustment",
  explanation:
    "The index (moov atom) is at the end of the file. Moving it to the start only rewrites the container.",
  fix: "remux",
  target: "Yes — moov at start",
  qualityImpact: "None. Streams are copied bit-for-bit.",
};

const PROCESS_REMUX = ["Preparing workspace", "Copying streams", "Writing container", "Finalizing output"];
const PROCESS_REENCODE = [
  "Preparing workspace",
  "Re-encoding video stream",
  "Copying audio stream",
  "Writing container",
  "Finalizing output",
];

function remuxVerification(overall: "passed" | "inconclusive"): Scenario["verification"] {
  const inconclusive = overall === "inconclusive";
  return {
    overall,
    summary: inconclusive
      ? "Most properties match, but stream integrity could not be confirmed from the available information."
      : "All checked properties match the source. Only the container layout changed, as planned.",
    unexpectedChanges: [],
    checks: [
      { id: "codec", label: "Video codec", source: "H.264", output: "H.264", result: "passed", note: "Stream copied, codec unchanged." },
      { id: "res", label: "Resolution", source: "1920 × 1080", output: "1920 × 1080", result: "passed", note: "Identical." },
      { id: "fps", label: "Frame rate", source: "60 fps", output: "60 fps", result: "passed", note: "Identical, CFR preserved." },
      {
        id: "dur",
        label: "Duration",
        source: "00:30.02",
        output: inconclusive ? "00:29.98" : "00:30.02",
        result: inconclusive ? "inconclusive" : "passed",
        note: inconclusive
          ? "40 ms difference. Could be timestamp rounding or a dropped frame — cannot tell from metadata."
          : "Identical.",
      },
      { id: "audio", label: "Audio", source: "AAC-LC · 48 kHz · stereo", output: "AAC-LC · 48 kHz · stereo", result: "passed", note: "Stream copied." },
      {
        id: "integrity",
        label: "Stream integrity",
        source: "1800 frames",
        output: inconclusive ? "Unknown" : "1800 frames",
        result: inconclusive ? "inconclusive" : "passed",
        note: inconclusive ? "Frame count was not available for the output." : "Packet and frame counts match.",
      },
      { id: "faststart", label: "Faststart", source: "No", output: "Yes", result: "passed", note: "Expected change." },
    ],
  };
}

export const SCENARIOS: Scenario[] = [
  {
    id: "compatible",
    label: "Fully compatible source",
    description: "Every verified capability is met. Expected decision: no change.",
    profileId: "tiktok-web-demo",
    metadata: metadata(BASE),
    compatibility: compatibleRows(BASE),
    processing: { stages: [] },
    verification: null,
    output: null,
  },
  {
    id: "remux",
    label: "Container needs remux",
    description: "Streams are fine, container layout is not. Expected: smart remux, verification passes.",
    profileId: "tiktok-web-demo",
    metadata: metadata(REMUX_SPEC),
    compatibility: replace(compatibleRows(REMUX_SPEC), remuxRow),
    processing: { stages: PROCESS_REMUX },
    verification: remuxVerification("passed"),
    output: { sizeLabel: "45 MB" },
  },
  {
    id: "reencode",
    label: "Verified violation (bitrate)",
    description: "Video bitrate exceeds a verified limit. Expected: conditional re-encode with authorization.",
    profileId: "tiktok-web-demo",
    metadata: metadata(REENCODE_SPEC),
    compatibility: replace(compatibleRows(REENCODE_SPEC), {
      id: "bitrate",
      parameter: "Video bitrate",
      source: m("24.0 Mbps"),
      capability: { value: "Up to 16 Mbps", evidence: "empirical" },
      assessment: "needs_adjustment",
      explanation:
        "Bitrate exceeds the empirically verified limit. Only the video stream is re-encoded, to the limit — not below it.",
      fix: "reencode",
      target: "≤ 16.0 Mbps",
      qualityImpact:
        "Lossy. Some generational loss is expected. Resolution, frame rate and pixel format are preserved.",
    }),
    processing: { stages: PROCESS_REENCODE },
    verification: {
      overall: "warning",
      summary: "The planned change was applied. One property differs slightly from the expected value.",
      unexpectedChanges: ["Audio bitrate reported as 191 kbps (expected 192 kbps)."],
      checks: [
        { id: "codec", label: "Video codec", source: "H.264", output: "H.264", result: "passed", note: "Same codec, re-encoded." },
        { id: "res", label: "Resolution", source: "1920 × 1080", output: "1920 × 1080", result: "passed", note: "Preserved." },
        { id: "fps", label: "Frame rate", source: "60 fps", output: "60 fps", result: "passed", note: "Preserved, no interpolation." },
        { id: "bitrate", label: "Video bitrate", source: "24.0 Mbps", output: "15.8 Mbps", result: "passed", note: "Within the verified limit." },
        { id: "dur", label: "Duration", source: "00:30.02", output: "00:30.02", result: "passed", note: "Identical." },
        { id: "audio", label: "Audio", source: "AAC-LC · 192 kbps", output: "AAC-LC · 191 kbps", result: "warning", note: "Stream copied; reported bitrate differs, likely metadata rounding." },
        { id: "integrity", label: "Stream integrity", source: "1800 frames", output: "1800 frames", result: "passed", note: "Frame counts match." },
      ],
    },
    output: { sizeLabel: "60 MB" },
  },
  {
    id: "unsupported",
    label: "Unsupported (HDR source)",
    description: "Compatibility would require HDR→SDR tone mapping, which FrameGuard does not perform.",
    profileId: "tiktok-web-demo",
    metadata: metadata(HDR_SPEC),
    compatibility: replace(
      compatibleRows(HDR_SPEC),
      {
        id: "vcodec",
        parameter: "Video codec",
        source: m("H.265 (HEVC)"),
        capability: { value: "H.264", evidence: "official" },
        assessment: "needs_adjustment",
        explanation: "Codec differs from the documented capability and would require re-encoding.",
        fix: "reencode",
        target: "H.264",
        qualityImpact: "Lossy.",
      },
      {
        id: "pixfmt",
        parameter: "Pixel format",
        source: m("yuv420p10le"),
        capability: { value: "yuv420p (8-bit)", evidence: "empirical" },
        assessment: "unsupported",
        explanation:
          "Reducing 10-bit HDR to 8-bit SDR requires tone mapping, which changes color and brightness. FrameGuard does not do this.",
      },
    ),
    processing: { stages: [] },
    verification: null,
    output: null,
  },
  {
    id: "insufficient",
    label: "Insufficient evidence",
    description: "The platform profile has unknown and conflicting limits. No conversion is made on guesses.",
    profileId: "tiktok-web-pending",
    metadata: metadata(INSUFFICIENT_SPEC),
    compatibility: [
      ok("container", "Container", INSUFFICIENT_SPEC.container, "MP4", "official"),
      ok("vcodec", "Video codec", INSUFFICIENT_SPEC.codec, "H.264", "official"),
      {
        id: "fps",
        parameter: "Frame rate",
        source: m("60 fps"),
        capability: { value: "Not established", evidence: "unknown" },
        assessment: "insufficient_evidence",
        explanation: "No evidence for a frame rate limit. FrameGuard will not reduce frame rate on a guess.",
      },
      {
        id: "bitrate",
        parameter: "Video bitrate",
        source: m("12.0 Mbps"),
        capability: { value: "8 Mbps vs 20 Mbps", evidence: "conflicting" },
        assessment: "insufficient_evidence",
        explanation: "Two sources disagree. Compatibility cannot be determined until the conflict is resolved.",
      },
      ok("acodec", "Audio codec", INSUFFICIENT_SPEC.audioCodec, "AAC", "secondary"),
      {
        id: "abitrate",
        parameter: "Audio bitrate",
        source: unknown("Not reported by container"),
        capability: { value: "Not established", evidence: "unknown" },
        assessment: "unknown",
        explanation: "Neither the source value nor a platform limit is known.",
      },
    ],
    processing: { stages: [] },
    verification: null,
    output: null,
  },
  {
    id: "failure",
    label: "Processing failure",
    description: "Smart remux that fails mid-way. Shows that the original is untouched.",
    profileId: "tiktok-web-demo",
    metadata: metadata(REMUX_SPEC),
    compatibility: replace(compatibleRows(REMUX_SPEC), remuxRow),
    processing: {
      stages: PROCESS_REMUX,
      failAt: 64,
      failureMessage: "Writing container stopped: the output stream ended unexpectedly (simulated failure).",
    },
    verification: null,
    output: null,
  },
  {
    id: "inconclusive",
    label: "Inconclusive verification",
    description: "Smart remux succeeds, but verification cannot confirm every property.",
    profileId: "tiktok-web-demo",
    metadata: metadata(REMUX_SPEC),
    compatibility: replace(compatibleRows(REMUX_SPEC), remuxRow),
    processing: { stages: PROCESS_REMUX },
    verification: remuxVerification("inconclusive"),
    output: { sizeLabel: "45 MB" },
  },
];

export const getScenario = (id: string) => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[1];

/* ------------------------------------------------------------------ */
/* History                                                             */
/* ------------------------------------------------------------------ */

export const SEED_HISTORY: HistoryEntry[] = [
  { id: "h1", filename: "studio-interview-final.mp4", date: "2026-11-11T14:20:00Z", decision: "SMART_REMUX", verification: "passed", sourceProfile: "H.264 · 1080p · 30 fps", platformProfile: "TikTok Web — Demo Profile", isDemo: true },
  { id: "h2", filename: "drone-coastline.mov", date: "2026-11-09T09:05:00Z", decision: "UNSUPPORTED", verification: "not_run", sourceProfile: "HEVC 10-bit · 4K · HDR10", platformProfile: "TikTok Web — Demo Profile", isDemo: true },
  { id: "h3", filename: "product-teaser-v3.mp4", date: "2026-11-06T17:42:00Z", decision: "CONDITIONAL_REENCODE", verification: "warning", sourceProfile: "H.264 · 1080p · 60 fps", platformProfile: "TikTok Web — Demo Profile", isDemo: true },
  { id: "h4", filename: "recipe-short.mp4", date: "2026-11-02T12:10:00Z", decision: "NO_CHANGE", verification: "not_run", sourceProfile: "H.264 · 1080p · 30 fps", platformProfile: "Web MP4 Baseline — Demo", isDemo: true },
  { id: "h5", filename: "concert-clip-raw.mp4", date: "2026-10-28T20:31:00Z", decision: "INSUFFICIENT_EVIDENCE", verification: "not_run", sourceProfile: "H.264 · 1080p · 60 fps", platformProfile: "TikTok Web — Evidence Pending", isDemo: true },
  { id: "h6", filename: "vlog-episode-12.mp4", date: "2026-10-21T08:15:00Z", decision: "SMART_REMUX", verification: "inconclusive", sourceProfile: "H.264 · 1080p · 30 fps", platformProfile: "TikTok Web — Demo Profile", isDemo: true },
];
