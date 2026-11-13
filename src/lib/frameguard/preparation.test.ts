import { describe, expect, it } from "vitest";

import { SCENARIOS, getScenario } from "./mock-data";
import { canGenerate, decidePreparation, outputFilename } from "./preparation";
import type { CompatibilityRow } from "./types";

const row = (over: Partial<CompatibilityRow>): CompatibilityRow => ({
  id: "x",
  parameter: "X",
  source: { kind: "measured", value: "v" },
  capability: { value: "c", evidence: "official" },
  assessment: "compatible",
  explanation: "",
  ...over,
});

describe("preparation decision", () => {
  it("returns NO_CHANGE when every verified capability is met", () => {
    expect(decidePreparation([row({}), row({ assessment: "unknown", capability: { value: "?", evidence: "unknown" } })])).toBe("NO_CHANGE");
  });

  it("prefers SMART_REMUX for container-only violations", () => {
    expect(decidePreparation([row({ assessment: "needs_adjustment", fix: "remux" })])).toBe("SMART_REMUX");
  });

  it("requires CONDITIONAL_REENCODE when a verified violation needs re-encoding", () => {
    expect(
      decidePreparation([row({ assessment: "needs_adjustment", fix: "remux" }), row({ assessment: "needs_adjustment", fix: "reencode" })]),
    ).toBe("CONDITIONAL_REENCODE");
  });

  it("never converts based on unknown or conflicting evidence", () => {
    expect(
      decidePreparation([row({ assessment: "needs_adjustment", fix: "reencode", capability: { value: "?", evidence: "conflicting" } })]),
    ).toBe("NO_CHANGE");
    expect(decidePreparation([row({ assessment: "insufficient_evidence" }), row({ assessment: "needs_adjustment", fix: "remux" })])).toBe(
      "INSUFFICIENT_EVIDENCE",
    );
  });

  it("blocks preparation when anything is unsupported", () => {
    expect(decidePreparation([row({ assessment: "unsupported" }), row({ assessment: "insufficient_evidence" })])).toBe("UNSUPPORTED");
  });

  it("maps each demo scenario to its intended decision", () => {
    const expected: Record<string, string> = {
      compatible: "NO_CHANGE",
      remux: "SMART_REMUX",
      reencode: "CONDITIONAL_REENCODE",
      unsupported: "UNSUPPORTED",
      insufficient: "INSUFFICIENT_EVIDENCE",
      failure: "SMART_REMUX",
      inconclusive: "SMART_REMUX",
    };
    for (const s of SCENARIOS) expect(decidePreparation(s.compatibility)).toBe(expected[s.id]);
    expect(getScenario("failure").processing.failAt).toBeDefined();
    expect(getScenario("inconclusive").verification?.overall).toBe("inconclusive");
  });
});

describe("generation gating", () => {
  it("requires explicit authorization for lossy re-encoding", () => {
    expect(canGenerate("CONDITIONAL_REENCODE", false)).toBe(false);
    expect(canGenerate("CONDITIONAL_REENCODE", true)).toBe(true);
  });

  it("allows remux without authorization and never processes NO_CHANGE, UNSUPPORTED or INSUFFICIENT_EVIDENCE", () => {
    expect(canGenerate("SMART_REMUX", false)).toBe(true);
    expect(canGenerate("NO_CHANGE", true)).toBe(false);
    expect(canGenerate("UNSUPPORTED", true)).toBe(false);
    expect(canGenerate("INSUFFICIENT_EVIDENCE", true)).toBe(false);
  });
});

describe("output filename", () => {
  it("never matches the original filename", () => {
    expect(outputFilename("sample-video.mp4")).toBe("sample-video.frameguard.mp4");
    expect(outputFilename("sample-video.mp4", "")).not.toBe("sample-video.mp4");
    expect(outputFilename("clip.mov", "web")).toBe("clip.web.mp4");
  });
});
