import { DEMO_LABEL } from "./mock-data";
import { decisionMeta, fieldText, outputFilename } from "./preparation";
import type { Decision, PlatformProfile, Scenario, SelectedFile } from "./types";

/** Builds a plain-text session report. All values are synthetic demo data. */
export function buildReport(args: {
  file: SelectedFile;
  scenario: Scenario;
  profile: PlatformProfile;
  decision: Decision;
  suffix: string;
  processed: boolean;
}): string {
  const { file, scenario, profile, decision, suffix, processed } = args;
  const lines: string[] = [];
  lines.push("FRAMEGUARD SESSION REPORT", DEMO_LABEL, "");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Source file: ${file.name}`);
  lines.push(`Scenario: ${scenario.label}`);
  lines.push(`Platform profile: ${profile.name} (v${profile.version}, ${profile.status})`, "");
  lines.push("SOURCE ANALYSIS (simulated)");
  for (const g of scenario.metadata) {
    lines.push(`  ${g.title}`);
    for (const r of g.rows) lines.push(`    ${r.label}: ${fieldText(r.field)}`);
  }
  lines.push("", "COMPATIBILITY");
  for (const r of scenario.compatibility) {
    lines.push(
      `  ${r.parameter}: ${fieldText(r.source)} vs ${r.capability.value} [${r.capability.evidence}] → ${r.assessment}`,
    );
  }
  lines.push("", `DECISION: ${decision} — ${decisionMeta[decision].summary}`);
  if (processed) {
    lines.push(`Output file: ${outputFilename(file.name, suffix)} (original untouched)`);
    if (scenario.verification) {
      lines.push("", `VERIFICATION (simulated): ${scenario.verification.overall}`);
      for (const c of scenario.verification.checks) {
        lines.push(`  ${c.label}: ${c.source} → ${c.output} [${c.result}] ${c.note}`);
      }
      lines.push("  Note: metadata checks do not establish perceptual quality equivalence.");
    }
  } else {
    lines.push("No output file was created.");
  }
  return lines.join("\n");
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
