import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MoveRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoNotice, Page, PageHeader, Section } from "@/components/fg/layout";
import { FieldValue } from "@/components/fg/field-value";
import { Status, assessmentMeta, decisionStatusMeta } from "@/components/fg/status";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { decisionMeta, groupRows } from "@/lib/frameguard/preparation";
import type { CompatibilityRow } from "@/lib/frameguard/types";
import { useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/preparation")({
  head: () => ({
    meta: [
      { title: "Preparation Decision — FrameGuard" },
      { name: "description", content: "What FrameGuard will preserve, adjust, or refuse to change — and why." },
      { property: "og:title", content: "Preparation Decision — FrameGuard" },
      { property: "og:description", content: "What will be preserved, adjusted, or left alone — and why." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreparationPage,
});

const RULES = [
  "Preserve every compatible source parameter.",
  "Adjust only verified violations.",
  "Never upscale resolution.",
  "Never interpolate frames.",
  "Never forge metadata.",
  "No unnecessary transcoding.",
  "Never overwrite the original file.",
  "Lossy re-encoding requires your explicit authorization.",
  "Unknown platform limits never trigger automatic conversion.",
];

function pick(rows: CompatibilityRow[], id: string) {
  const r = rows.find((x) => x.id === id);
  return r?.source.kind === "measured" ? r.source.value.split(" (")[0] : "—";
}

function PreparationPage() {
  const { scenario, decision } = useWorkflow();
  const rows = scenario.compatibility;
  const { preserve, adjust, cannotHandle } = groupRows(rows);
  const meta = decisionMeta[decision];
  const ds = decisionStatusMeta[decision];

  const sourceProfile = ["container", "vcodec", "resolution", "fps", "bitrate"].map((k) => pick(rows, k)).join(" · ");
  const targetProfile = ["container", "vcodec", "resolution", "fps", "bitrate"]
    .map((k) => {
      const r = rows.find((x) => x.id === k);
      return r?.target ?? pick(rows, k);
    })
    .join(" · ");
  const blocked = decision === "UNSUPPORTED" || decision === "INSUFFICIENT_EVIDENCE";

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader title="Preparation" description="FrameGuard's decision, based only on verified evidence." />
      <StepGate step={3}>
        <div>
          <p className="text-xs text-muted-foreground">Decision</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Status variant="pill" tone={ds.tone} icon={ds.icon} label={ds.label} className="font-mono text-[13px]" />
            <span className="text-lg font-semibold text-foreground">{meta.label}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{meta.summary}</p>
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Method: </span>
            <span className="text-foreground">{meta.method}</span>
          </p>
        </div>

        <div className="mt-8 grid gap-3 rounded-lg border border-border bg-surface p-4 text-sm sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Source profile</p>
            <p className="mt-1 font-mono text-[13px] break-words text-foreground">{sourceProfile}</p>
          </div>
          <MoveRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Target compatible profile</p>
            <p className="mt-1 font-mono text-[13px] break-words text-foreground">
              {blocked ? <span className="font-sans text-muted-foreground italic">Not determined</span> : targetProfile}
            </p>
          </div>
        </div>

        <DemoNotice compact className="mt-6" />

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <Section title={`Preserve (${preserve.length})`} className="mt-0">
            <ul className="space-y-2">
              {preserve.map((r) => (
                <li key={r.id} className="flex items-baseline gap-2 text-sm">
                  <Check className="size-3.5 shrink-0 translate-y-0.5 text-success" aria-hidden />
                  <span className="text-foreground">{r.parameter}</span>
                  <FieldValue field={r.source} className="ml-auto truncate text-xs text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`Adjust (${adjust.length})`} className="mt-0">
            {adjust.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing needs to change.</p>
            ) : (
              <ul className="space-y-4">
                {adjust.map((r) => (
                  <li key={r.id} className="text-sm">
                    <p className="font-medium text-foreground">{r.parameter}</p>
                    <p className="mt-0.5 font-mono text-[13px]">
                      <FieldValue field={r.source} /> <span className="text-muted-foreground">→</span>{" "}
                      {r.target ?? "—"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      <span className="text-foreground">Why: </span>
                      {r.explanation}
                    </p>
                    {decision === "UNSUPPORTED" && (
                      <p className="mt-1 text-xs text-muted-foreground italic">Not applied — preparation is blocked.</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title={`Cannot currently handle (${cannotHandle.length})`} className="mt-0">
            {cannotHandle.length === 0 ? (
              <p className="text-sm text-muted-foreground">None.</p>
            ) : (
              <ul className="space-y-4">
                {cannotHandle.map((r) => {
                  const a = assessmentMeta[r.assessment];
                  return (
                    <li key={r.id} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground">{r.parameter}</p>
                        <Status tone={a.tone} icon={a.icon} label={a.label} className="text-xs" />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.explanation}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>

        <Section title="Rules FrameGuard follows" className="mt-12">
          <ul className="grid gap-x-8 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            {RULES.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden />
                {rule}
              </li>
            ))}
          </ul>
        </Section>

        <StepFooter>
          <Button variant="ghost" asChild>
            <Link to="/compatibility">Back</Link>
          </Button>
          <Button asChild>
            <Link to="/review">
              Review preparation <ArrowRight />
            </Link>
          </Button>
        </StepFooter>
      </StepGate>
    </Page>
  );
}
