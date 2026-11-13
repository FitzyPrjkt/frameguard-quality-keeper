import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, FileText, RotateCcw, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataList, DemoNotice, Page, PageHeader, Section } from "@/components/fg/layout";
import { Status, verificationMeta } from "@/components/fg/status";
import { StepFooter, StepGate } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { formatBytes } from "@/lib/frameguard/format";
import { decisionMeta, outputFilename } from "@/lib/frameguard/preparation";
import { buildReport, downloadText } from "@/lib/frameguard/report";
import { useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/export")({
  head: () => ({
    meta: [
      { title: "Export & Share — FrameGuard" },
      { name: "description", content: "Save the prepared video, share it, or export a session report." },
      { property: "og:title", content: "Export & Share — FrameGuard" },
      { property: "og:description", content: "Save, share, or export a session report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExportPage,
});

function ExportPage() {
  const w = useWorkflow();
  const navigate = useNavigate();
  const { file, scenario, profile, decision, settings, processing } = w;
  const processed = processing.status === "succeeded";
  const v = scenario.verification;
  const outName = file ? outputFilename(file.name, settings.outputSuffix) : "";

  const exportReport = () => {
    if (!file) return;
    const text = buildReport({ file, scenario, profile, decision, suffix: settings.outputSuffix, processed });
    const base = file.name.replace(/\.[^.]+$/, "");
    downloadText(`${base}.frameguard-report.txt`, text);
    toast.success("Report downloaded", { description: "Contains demo data only." });
  };

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader title="Export & Share" description="Save or share the result. FrameGuard never uploads anything on your behalf." />
      <StepGate step={7}>
        {processed ? (
          <div className="grid gap-10 md:grid-cols-[1fr_240px]">
            <Section title="Prepared output" className="mt-0">
              <DataList
                rows={[
                  { label: "Filename", value: <span className="font-mono text-[13px] break-all">{outName}</span> },
                  { label: "File size", value: <span className="font-mono text-[13px]">{scenario.output?.sizeLabel ?? "Unknown"}</span> },
                  { label: "Method", value: <span className="text-sm">{decisionMeta[decision].label}</span> },
                  {
                    label: "Verification",
                    value: v ? (
                      <Status tone={verificationMeta[v.overall].tone} icon={verificationMeta[v.overall].icon} label={verificationMeta[v.overall].label} />
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Not run</span>
                    ),
                  },
                  { label: "Original", value: <span className="text-sm">{file?.name} — untouched</span> },
                ]}
              />
              {v && <p className="mt-3 text-sm text-muted-foreground">{v.summary}</p>}
            </Section>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() =>
                  toast("Save simulated", {
                    description: "The prototype doesn't produce a real file. The Android app will save via native file access.",
                  })
                }
              >
                <Download /> Save Output
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast("Share placeholder", { description: "The Android app will open the system Share Sheet here." })
                }
              >
                <Share2 /> Share
              </Button>
              <Button variant="outline" onClick={exportReport}>
                <FileText /> Export Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_240px]">
            <div className="border-l-2 border-l-success pl-4">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="size-4 text-success" aria-hidden /> No prepared file was needed
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-mono text-[13px] text-foreground">{file?.name}</span>
                {file && ` (${formatBytes(file.sizeBytes)})`} already meets every verified capability. Use your
                original as-is.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={exportReport}>
                <FileText /> Export Report
              </Button>
            </div>
          </div>
        )}

        <p className="mt-10 text-xs text-muted-foreground">
          FrameGuard doesn't upload to TikTok or any other platform. Upload the file yourself through the platform's
          own app or website.
        </p>
        <DemoNotice compact className="mt-4" />

        <StepFooter>
          <Button variant="ghost" asChild>
            <Link to={processed ? "/verification" : "/review"}>Back</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              w.startOver();
              navigate({ to: "/videos" });
            }}
          >
            <RotateCcw /> Prepare another video
          </Button>
        </StepFooter>
      </StepGate>
    </Page>
  );
}
