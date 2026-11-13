import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FilePlus2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataList, DemoNotice, Page, PageHeader, Section } from "@/components/fg/layout";
import { FieldValue } from "@/components/fg/field-value";
import { Status, decisionStatusMeta } from "@/components/fg/status";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { canGenerate, decisionMeta, isLossy, outputFilename } from "@/lib/frameguard/preparation";
import { useWorkflow } from "@/lib/frameguard/workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review Preparation — FrameGuard" },
      { name: "description", content: "Review every planned change, its reason and quality impact before anything is processed." },
      { property: "og:title", content: "Review Preparation — FrameGuard" },
      { property: "og:description", content: "Review every planned change before processing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const w = useWorkflow();
  const navigate = useNavigate();
  const { scenario, decision, lossyAuthorized, file, settings } = w;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rows = scenario.compatibility;
  const ds = decisionStatusMeta[decision];
  const meta = decisionMeta[decision];
  const outName = file ? outputFilename(file.name, settings.outputSuffix) : "";
  const allowed = canGenerate(decision, lossyAuthorized);
  const blocked = decision === "UNSUPPORTED" || decision === "INSUFFICIENT_EVIDENCE";

  const start = () => {
    w.startProcessing();
    toast("Preparation started", { description: "Simulated processing — no file is being written." });
    navigate({ to: "/processing" });
  };

  const changed = rows.filter((r) => r.assessment === "needs_adjustment");
  const impacts = Array.from(new Set(changed.map((r) => r.qualityImpact).filter(Boolean)));

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader title="Review" description="Source → prepared output. Nothing happens until you confirm." />
      <StepGate step={4}>
        <div className="flex flex-wrap items-center gap-3">
          <Status variant="pill" tone={ds.tone} icon={ds.icon} label={ds.label} className="font-mono text-[13px]" />
          <span className="text-sm text-muted-foreground">{meta.method}</span>
        </div>

        {decision === "NO_CHANGE" ? (
          <div className="mt-8 border-l-2 border-l-success pl-4">
            <p className="flex items-center gap-2 font-medium text-foreground">
              <CheckCircle2 className="size-4 text-success" aria-hidden /> Processing is unnecessary
            </p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              The source already meets every verified capability. Re-processing it could only lose quality, so
              FrameGuard won't create a new file. You can use your original as-is.
            </p>
          </div>
        ) : blocked ? (
          <div className="mt-8 border-l-2 border-l-muted-foreground/40 pl-4">
            <p className="font-medium text-foreground">Preparation isn't possible</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{meta.summary}</p>
          </div>
        ) : null}

        <Section title="Comparison" className="mt-10">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Parameter</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Expected output</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const isChanged = r.assessment === "needs_adjustment" && !blocked;
                  return (
                    <TableRow key={r.id} className={cn("align-top hover:bg-transparent", isChanged && "bg-warning/5")}>
                      <TableCell className="py-3 font-medium">{r.parameter}</TableCell>
                      <TableCell className="py-3"><FieldValue field={r.source} /></TableCell>
                      <TableCell className="py-3">
                        {blocked ? (
                          <span className="text-sm text-muted-foreground italic">—</span>
                        ) : isChanged ? (
                          <span className="font-mono text-[13px] font-medium">{r.target}</span>
                        ) : (
                          <FieldValue field={r.source} />
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-sm whitespace-normal">
                        {isChanged ? (
                          <>
                            <span className="font-medium text-foreground">Changed</span>
                            <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{r.explanation}</p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">{blocked ? "Not processed" : "Preserved"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <ul className="divide-y divide-border border-y border-border md:hidden">
            {rows.map((r) => {
              const isChanged = r.assessment === "needs_adjustment" && !blocked;
              return (
                <li key={r.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{r.parameter}</span>
                    <span className={cn("text-xs", isChanged ? "font-medium text-warning" : "text-muted-foreground")}>
                      {isChanged ? "Changed" : blocked ? "Not processed" : "Preserved"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[13px]">
                    <FieldValue field={r.source} />
                    {isChanged && <> <span className="text-muted-foreground">→</span> {r.target}</>}
                  </p>
                  {isChanged && <p className="mt-1 text-xs text-muted-foreground">{r.explanation}</p>}
                </li>
              );
            })}
          </ul>
        </Section>

        {!blocked && decision !== "NO_CHANGE" && (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <Section title="Output" className="mt-0">
              <DataList
                rows={[
                  { label: "New file", value: <span className="font-mono text-[13px] break-all">{outName}</span> },
                  { label: "Original", value: <span className="text-sm">Kept untouched</span> },
                  { label: "Method", value: <span className="text-sm">{meta.method}</span> },
                ]}
              />
            </Section>
            <Section title="Quality implications" className="mt-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {impacts.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {isLossy(decision) && (
          <label
            htmlFor="authorize"
            className="mt-8 flex cursor-pointer items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 p-4"
          >
            <Checkbox
              id="authorize"
              checked={lossyAuthorized}
              onCheckedChange={(v) => w.setLossyAuthorized(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium text-foreground">I authorize lossy re-encoding</span>
              <span className="mt-0.5 block text-muted-foreground">
                Only the affected stream is re-encoded. Some quality loss is unavoidable. Your original file is kept.
              </span>
            </span>
          </label>
        )}

        <DemoNotice compact className="mt-8" />

        <StepFooter>
          <Button variant="ghost" asChild>
            <Link to="/preparation">Back to Preparation</Link>
          </Button>
          {decision === "NO_CHANGE" ? (
            <Button
              onClick={() => {
                w.acknowledgeNoChange();
                navigate({ to: "/export" });
              }}
            >
              Continue without processing <ArrowRight />
            </Button>
          ) : (
            <div className="flex flex-col items-stretch gap-1 sm:items-end">
              <Button
                disabled={!allowed}
                onClick={() => (settings.confirmBeforeProcessing ? setConfirmOpen(true) : start())}
              >
                <FilePlus2 /> Generate Prepared Video
              </Button>
              {!allowed && (
                <span className="text-xs text-muted-foreground">
                  {blocked
                    ? "Disabled: no safe preparation is available for this source."
                    : "Authorize lossy re-encoding above to continue."}
                </span>
              )}
            </div>
          )}
        </StepFooter>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate prepared video?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    A new file <span className="font-mono text-foreground">{outName}</span> will be created using{" "}
                    {meta.method.toLowerCase()}.
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    Your original file will not be modified.
                  </p>
                  {isLossy(decision) && <p>This operation is lossy. You authorized it on the previous screen.</p>}
                  <p className="text-xs">In this prototype, processing is simulated and no file is written.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={start}>Generate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StepGate>
    </Page>
  );
}
