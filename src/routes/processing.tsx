import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, CheckCircle2, Circle, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { EmptyState, Page, PageHeader } from "@/components/fg/layout";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { decisionMeta, outputFilename } from "@/lib/frameguard/preparation";
import { useWorkflow } from "@/lib/frameguard/workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing — FrameGuard" },
      { name: "description", content: "Track preparation progress. The original file is never modified." },
      { property: "og:title", content: "Processing — FrameGuard" },
      { property: "og:description", content: "Track preparation progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProcessingPage,
});

function ProcessingPage() {
  const w = useWorkflow();
  const navigate = useNavigate();
  const { processing, scenario, decision, file, settings, noChangeAcknowledged } = w;
  const [cancelOpen, setCancelOpen] = useState(false);
  const stages = scenario.processing.stages;
  const { status, progress, stageIndex, error } = processing;
  const outName = file ? outputFilename(file.name, settings.outputSuffix) : "";

  if (decision === "NO_CHANGE" && noChangeAcknowledged) {
    return (
      <Page>
        <WorkflowStepper />
        <PageHeader title="Processing" />
        <EmptyState
          icon={CheckCircle2}
          title="Skipped — nothing to process"
          description="The source already meets every verified capability, so no new file was created."
          action={
            <Button asChild>
              <Link to="/export">Go to export</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  const heading =
    status === "running"
      ? "Preparing your video"
      : status === "succeeded"
        ? "Prepared video ready"
        : status === "failed"
          ? "Processing failed"
          : "Processing cancelled";

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader
        title="Processing"
        description={`${decisionMeta[decision].label} · simulated progress, not real FFmpeg execution.`}
      />
      <StepGate step={5}>
        <div className="max-w-2xl">
          <div className="flex items-center gap-3" role="status" aria-live="polite">
            {status === "running" && <Loader2 className="size-5 animate-spin text-primary" aria-hidden />}
            {status === "succeeded" && <CheckCircle2 className="size-5 text-success" aria-hidden />}
            {(status === "failed" || status === "cancelled") && (
              <XCircle className={cn("size-5", status === "failed" ? "text-destructive" : "text-muted-foreground")} aria-hidden />
            )}
            <h2 className="text-lg font-semibold text-foreground">{heading}</h2>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">
                {status === "running" ? stages[stageIndex] : status === "succeeded" ? "Complete" : `Stopped during: ${stages[stageIndex]}`}
              </span>
              <span className="font-mono text-[13px] tabular-nums text-foreground">{Math.floor(progress)}%</span>
            </div>
            <Progress
              value={progress}
              aria-label="Processing progress"
              className={cn("h-1.5 bg-muted", status === "failed" && "[&>div]:bg-destructive", status === "cancelled" && "[&>div]:bg-muted-foreground")}
            />
          </div>

          <ol className="mt-8 space-y-3">
            {stages.map((s, i) => {
              const done = status === "succeeded" || i < stageIndex;
              const active = i === stageIndex && status === "running";
              const stopped = i === stageIndex && (status === "failed" || status === "cancelled");
              return (
                <li key={s} className="flex items-center gap-3 text-sm">
                  {done ? (
                    <Check className="size-4 text-success" aria-hidden />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
                  ) : stopped ? (
                    <XCircle className="size-4 text-destructive" aria-hidden />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/50" aria-hidden />
                  )}
                  <span className={cn(done || active || stopped ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  <span className="sr-only">
                    {done ? "done" : active ? "in progress" : stopped ? "stopped" : "pending"}
                  </span>
                </li>
              );
            })}
          </ol>

          {status === "running" && (
            <p className="mt-8 text-xs text-muted-foreground">
              Writing to <span className="font-mono text-foreground">{outName}</span>. Time estimates are not shown
              because a simulation can't justify them.
            </p>
          )}

          {(status === "failed" || status === "cancelled") && (
            <div className={cn("mt-8 rounded-lg border p-4", status === "failed" ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/40")}>
              {error && <p className="text-sm font-medium text-foreground">{error}</p>}
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  Your original file is untouched.
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  The incomplete output was discarded and is not considered a prepared file.
                </li>
              </ul>
            </div>
          )}
        </div>

        <StepFooter>
          {status === "running" ? (
            <>
              <span className="hidden sm:block" />
              <Button variant="outline" onClick={() => setCancelOpen(true)}>
                Cancel processing
              </Button>
            </>
          ) : status === "succeeded" ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/review">Back to review</Link>
              </Button>
              <Button asChild>
                <Link to="/verification">
                  Verify output <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  w.resetProcessing();
                  navigate({ to: "/review" });
                }}
              >
                Back to review
              </Button>
              <Button
                onClick={() => {
                  w.startProcessing();
                  toast("Retrying", { description: "Simulated processing restarted." });
                }}
              >
                Try again
              </Button>
            </>
          )}
        </StepFooter>

        <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel processing?</AlertDialogTitle>
              <AlertDialogDescription>
                The partial output will be discarded. Your original file stays exactly as it is.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep processing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  w.cancelProcessing();
                  toast("Processing cancelled", { description: "Original untouched. Partial output discarded." });
                }}
              >
                Cancel processing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StepGate>
    </Page>
  );
}
