import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DemoNotice, EmptyState, Page, PageHeader, Section } from "@/components/fg/layout";
import { Status, verificationMeta } from "@/components/fg/status";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { useWorkflow } from "@/lib/frameguard/workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Quality Verification — FrameGuard" },
      { name: "description", content: "Compare the prepared output with the source and see exactly what was checked." },
      { property: "og:title", content: "Quality Verification — FrameGuard" },
      { property: "og:description", content: "Source vs. output, and exactly what was checked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VerificationPage,
});

const borderTone = {
  passed: "border-l-success",
  warning: "border-l-warning",
  failed: "border-l-destructive",
  inconclusive: "border-l-muted-foreground/40",
} as const;

function VerificationPage() {
  const { scenario, decision, noChangeAcknowledged } = useWorkflow();
  const v = scenario.verification;

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader title="Verification" description="What the prepared output looks like compared with the source." />
      {decision === "NO_CHANGE" && noChangeAcknowledged ? (
        <EmptyState
          icon={Info}
          title="Nothing to verify"
          description="No prepared file was created because the source already meets every verified capability."
          action={<Button asChild><Link to="/export">Go to export</Link></Button>}
        />
      ) : (
        <StepGate step={6}>
          {v && (
            <>
              <div className={cn("border-l-2 pl-4", borderTone[v.overall])} role="status">
                <p className="text-xs text-muted-foreground">Overall result</p>
                <div className="mt-1">
                  <Status
                    tone={verificationMeta[v.overall].tone}
                    icon={verificationMeta[v.overall].icon}
                    label={verificationMeta[v.overall].label}
                    className="text-base font-semibold"
                  />
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{v.summary}</p>
              </div>

              <DemoNotice className="mt-6" />
              <p className="mt-3 text-xs text-muted-foreground">
                Results below are <strong className="font-medium text-foreground">simulated</strong>. No measurement was
                performed on any file.
              </p>

              <Section title="Source vs. output" className="mt-10">
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Check</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Output</TableHead>
                        <TableHead className="w-[140px]">Result</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {v.checks.map((c) => {
                        const m = verificationMeta[c.result];
                        return (
                          <TableRow key={c.id} className="align-top hover:bg-transparent">
                            <TableCell className="py-3 font-medium">{c.label}</TableCell>
                            <TableCell className="py-3 font-mono text-[13px]">{c.source}</TableCell>
                            <TableCell className="py-3 font-mono text-[13px]">{c.output}</TableCell>
                            <TableCell className="py-3"><Status tone={m.tone} icon={m.icon} label={m.label} /></TableCell>
                            <TableCell className="py-3 text-xs whitespace-normal text-muted-foreground">{c.note}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <ul className="divide-y divide-border border-y border-border md:hidden">
                  {v.checks.map((c) => {
                    const m = verificationMeta[c.result];
                    return (
                      <li key={c.id} className="py-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{c.label}</span>
                          <Status tone={m.tone} icon={m.icon} label={m.label} />
                        </div>
                        <p className="mt-1 font-mono text-[13px]">
                          {c.source} <span className="text-muted-foreground">→</span> {c.output}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                      </li>
                    );
                  })}
                </ul>
              </Section>

              <div className="mt-10 grid gap-10 md:grid-cols-2">
                <Section title="Unexpected changes" className="mt-0">
                  {v.unexpectedChanges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">None detected among the checked properties.</p>
                  ) : (
                    <ul className="space-y-1.5 text-sm text-foreground">
                      {v.unexpectedChanges.map((u) => <li key={u}>{u}</li>)}
                    </ul>
                  )}
                </Section>
                <Section title="What was checked" className="mt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Stream metadata (codec, resolution, frame rate, duration, audio properties) and stream integrity
                    (packet and frame counts). These checks confirm the file is structurally what was planned. They
                    do <strong className="font-medium text-foreground">not</strong> prove perceptual quality is
                    equivalent — that can't be established from metadata alone.
                  </p>
                </Section>
              </div>
            </>
          )}

          <StepFooter>
            <Button variant="ghost" asChild>
              <Link to="/processing">Back</Link>
            </Button>
            <Button asChild>
              <Link to="/export">
                Export or share <ArrowRight />
              </Link>
            </Button>
          </StepFooter>
        </StepGate>
      )}
    </Page>
  );
}
