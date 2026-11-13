import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, ScanSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataList, DemoNotice, EmptyState, Page, PageHeader, Section } from "@/components/fg/layout";
import { FieldValue } from "@/components/fg/field-value";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Source Analysis — FrameGuard" },
      { name: "description", content: "Video, audio and container characteristics of the selected source." },
      { property: "og:title", content: "Source Analysis — FrameGuard" },
      { property: "og:description", content: "Video, audio and container characteristics of the source." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const w = useWorkflow();
  const { file, analysis, scenario } = w;

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader
        title="Analysis"
        description="Characteristics of the source file. Values that couldn't be determined are shown as unknown — never guessed."
      />
      <StepGate step={1}>
        {analysis === "idle" && (
          <EmptyState
            icon={ScanSearch}
            title="Not analyzed yet"
            description={`${file?.name} is selected. Run analysis to read its characteristics (simulated in this prototype).`}
            action={<Button onClick={w.runAnalysis}>Run analysis</Button>}
          />
        )}

        {analysis === "running" && (
          <div aria-busy="true" aria-live="polite">
            <p className="mb-6 text-sm text-muted-foreground">Reading stream information… (simulated)</p>
            <div className="grid gap-10 md:grid-cols-2">
              {[0, 1, 2, 3].map((g) => (
                <div key={g} className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  {[0, 1, 2, 3].map((r) => (
                    <div key={r} className="flex justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis === "done" && (
          <>
            <DemoNotice className="mb-6" />
            {file && !file.isSample && (
              <p className="mb-8 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  These values are from the “{scenario.label}” scenario, not from{" "}
                  <span className="font-medium text-foreground">{file.name}</span>.
                </span>
              </p>
            )}
            <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
              {scenario.metadata.map((g) => (
                <Section key={g.id} title={g.title} className="mt-0">
                  <DataList
                    rows={g.rows.map((r) => ({ key: r.key, label: r.label, value: <FieldValue field={r.field} /> }))}
                  />
                </Section>
              ))}
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
              <span className="italic">Unknown</span> — the value exists but couldn't be determined.{" "}
              <span className="italic">Not available</span> — the file doesn't carry this information.
            </p>
          </>
        )}

        <StepFooter>
          <Button variant="ghost" asChild>
            <Link to="/videos">Back</Link>
          </Button>
          {analysis === "done" ? (
            <Button asChild>
              <Link to="/compatibility">
                Assess compatibility <ArrowRight />
              </Link>
            </Button>
          ) : (
            <Button disabled title="Run analysis first">
              Assess compatibility <ArrowRight />
            </Button>
          )}
        </StepFooter>
      </StepGate>
    </Page>
  );
}
