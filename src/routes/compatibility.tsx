import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoNotice, Page, PageHeader, Section } from "@/components/fg/layout";
import { FieldValue } from "@/components/fg/field-value";
import {
  EvidenceTag,
  Status,
  assessmentMeta,
  evidenceMeta,
  profileStatusMeta,
  type Tone,
} from "@/components/fg/status";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { formatDate } from "@/lib/frameguard/format";
import type { Assessment, EvidenceClass } from "@/lib/frameguard/types";
import { useWorkflow } from "@/lib/frameguard/workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compatibility")({
  head: () => ({
    meta: [
      { title: "Compatibility Assessment — FrameGuard" },
      { name: "description", content: "Compare the source video against a platform capability profile, with evidence for every limit." },
      { property: "og:title", content: "Compatibility Assessment — FrameGuard" },
      { property: "og:description", content: "Source vs. platform capability profile, with evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompatibilityPage,
});

function verdict(counts: Record<Assessment, number>): { tone: Tone; title: string; body: string } {
  if (counts.unsupported)
    return { tone: "destructive", title: "Not preparable", body: "At least one requirement can't be met without compromising the source." };
  if (counts.insufficient_evidence)
    return {
      tone: "neutral",
      title: "Compatibility can't be determined",
      body: "Some platform limits are unknown or conflicting. No compatibility guarantee is made.",
    };
  if (counts.needs_adjustment)
    return { tone: "warning", title: "Needs adjustment", body: "One or more verified capabilities are not met." };
  return {
    tone: "success",
    title: "No verified violations",
    body: counts.unknown
      ? "Every verified capability is met. Some parameters have no evidence and are not guaranteed."
      : "Every verified capability is met.",
  };
}

const toneBorder: Record<Tone, string> = {
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
  info: "border-l-primary",
  neutral: "border-l-muted-foreground/40",
};

function CompatibilityPage() {
  const { scenario, profile } = useWorkflow();
  const rows = scenario.compatibility;
  const counts = rows.reduce(
    (acc, r) => ({ ...acc, [r.assessment]: acc[r.assessment] + 1 }),
    { compatible: 0, needs_adjustment: 0, unknown: 0, unsupported: 0, insufficient_evidence: 0 } as Record<Assessment, number>,
  );
  const v = verdict(counts);
  const ps = profileStatusMeta[profile.status];

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader title="Compatibility" description="How the source compares with each capability in the selected platform profile." />
      <StepGate step={2}>
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <p className="text-xs text-muted-foreground">Platform profile</p>
            <p className="mt-1 font-medium text-foreground">{profile.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <Status tone={ps.tone} icon={ps.icon} label={ps.label} />
              <span>v{profile.version}</span>
              <span>Last verified: {profile.lastVerified ? formatDate(profile.lastVerified) : "never"}</span>
              <span>Evidence: {profile.evidenceSummary}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profiles">View evidence</Link>
          </Button>
        </div>

        <DemoNotice className="mt-6" />

        <div className={cn("mt-8 border-l-2 pl-4", toneBorder[v.tone])} role="status">
          <p className="font-medium text-foreground">{v.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{v.body}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(counts) as Assessment[])
              .filter((k) => counts[k] > 0)
              .map((k) => (
                <span key={k}>
                  {assessmentMeta[k].label}: <span className="tabular-nums text-foreground">{counts[k]}</span>
                </span>
              ))}
          </p>
        </div>

        <Section title="Results" className="mt-10">
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Parameter</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Capability</TableHead>
                  <TableHead className="w-[190px]">Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const a = assessmentMeta[r.assessment];
                  return (
                    <TableRow key={r.id} className="align-top hover:bg-transparent">
                      <TableCell className="py-3 font-medium">{r.parameter}</TableCell>
                      <TableCell className="py-3"><FieldValue field={r.source} /></TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm">{r.capability.value}</div>
                        <EvidenceTag evidence={r.capability.evidence} />
                      </TableCell>
                      <TableCell className="py-3">
                        <Status tone={a.tone} icon={a.icon} label={a.label} />
                        <p className="mt-1 max-w-[260px] text-xs leading-relaxed whitespace-normal text-muted-foreground">
                          {r.explanation}
                        </p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile list */}
          <ul className="divide-y divide-border border-y border-border md:hidden">
            {rows.map((r) => {
              const a = assessmentMeta[r.assessment];
              return (
                <li key={r.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{r.parameter}</p>
                    <Status tone={a.tone} icon={a.icon} label={a.label} />
                  </div>
                  <dl className="mt-2 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd><FieldValue field={r.source} /></dd>
                    <dt className="text-muted-foreground">Capability</dt>
                    <dd>
                      {r.capability.value} <EvidenceTag evidence={r.capability.evidence} />
                    </dd>
                  </dl>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.explanation}</p>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title="Evidence classes" className="mt-10">
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(evidenceMeta) as EvidenceClass[]).map((e) => (
              <div key={e}>
                <dt><EvidenceTag evidence={e} /></dt>
                <dd className="text-xs text-muted-foreground">{evidenceMeta[e].description}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Only official, empirical and secondary evidence can trigger an adjustment. Unknown or conflicting
            evidence never does.
          </p>
        </Section>

        <StepFooter>
          <Button variant="ghost" asChild>
            <Link to="/analysis">Back</Link>
          </Button>
          <Button asChild>
            <Link to="/preparation">
              See preparation decision <ArrowRight />
            </Link>
          </Button>
        </StepFooter>
      </StepGate>
    </Page>
  );
}
