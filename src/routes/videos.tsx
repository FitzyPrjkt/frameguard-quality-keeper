import { useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Film, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DataList, Page, PageHeader, Section, Surface } from "@/components/fg/layout";
import { FileDropzone } from "@/components/fg/file-dropzone";
import { ScenarioSelect } from "@/components/fg/scenario-select";
import { StepFooter } from "@/components/fg/step-gate";
import { WorkflowStepper } from "@/components/fg/workflow-stepper";
import { formatBytes, formatDuration } from "@/lib/frameguard/format";
import { useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "My Videos — FrameGuard" },
      { name: "description", content: "Select a video file to inspect and prepare. Files stay on your device." },
      { property: "og:title", content: "My Videos — FrameGuard" },
      { property: "og:description", content: "Select a video file to inspect and prepare." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideosPage,
});

function readDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? v.duration : null);
    v.onerror = () => resolve(null);
    v.src = url;
  });
}

function VideosPage() {
  const w = useWorkflow();
  const navigate = useNavigate();
  const replaceRef = useRef<HTMLInputElement>(null);
  const { file } = w;

  const handleFile = async (f: File) => {
    if (!f.type.startsWith("video/") && !/\.(mp4|mov|m4v|mkv|webm)$/i.test(f.name)) {
      toast.error("That doesn't look like a video file", { description: f.name });
      return;
    }
    if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
    const url = URL.createObjectURL(f);
    const duration = await readDuration(url);
    w.selectFile({ name: f.name, sizeBytes: f.size, type: f.type || "unknown", durationSeconds: duration, isSample: false, previewUrl: url });
    toast.success("Video selected", { description: "Nothing has been analyzed yet." });
  };

  const analyze = () => {
    w.runAnalysis();
    navigate({ to: "/analysis" });
  };

  return (
    <Page>
      <WorkflowStepper />
      <PageHeader
        title="My Videos"
        description="Choose the video you want to prepare. It's read locally and never uploaded."
      />

      {!file ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            <FileDropzone onFile={handleFile} />
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground lg:justify-start">
              No video handy?
              <Button variant="link" className="h-auto p-0" onClick={w.loadSampleFile}>
                Use sample-video.mp4
              </Button>
            </div>
          </div>
          <aside className="space-y-6">
            <ScenarioSelect />
            <p className="text-xs leading-relaxed text-muted-foreground">
              This prototype doesn't inspect real media. The scenario decides which synthetic analysis results
              you'll see after you run analysis.
            </p>
          </aside>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              {file.previewUrl ? (
                <video src={file.previewUrl} controls className="size-full bg-foreground/90 object-contain" aria-label={`Preview of ${file.name}`} />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Film className="size-6" aria-hidden />
                  <span className="text-xs">Preview not available for the sample file</span>
                </div>
              )}
            </div>

            <Section title="File" className="mt-8">
              <DataList
                rows={[
                  { label: "Filename", value: <span className="break-all font-mono text-[13px]">{file.name}</span> },
                  { label: "File size", value: <span className="font-mono text-[13px]">{formatBytes(file.sizeBytes)}</span> },
                  {
                    label: "Duration",
                    value: formatDuration(file.durationSeconds) ? (
                      <span className="font-mono text-[13px]">{formatDuration(file.durationSeconds)}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unknown</span>
                    ),
                  },
                  { label: "Type", value: <span className="font-mono text-[13px]">{file.type}</span> },
                  {
                    label: "Origin",
                    value: (
                      <span className="text-sm">{file.isSample ? "Built-in sample (synthetic)" : "Your device"}</span>
                    ),
                  },
                ]}
              />
              <p className="mt-3 text-xs text-muted-foreground">
                Basic details as reported by the browser. Codec, bitrate and other properties are determined during
                analysis.
              </p>
            </Section>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => replaceRef.current?.click()}>
                <RefreshCw /> Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
                  w.removeFile();
                  toast("Video removed");
                }}
              >
                <Trash2 /> Remove
              </Button>
              <input
                ref={replaceRef}
                type="file"
                accept="video/*,.mp4,.mov,.m4v,.mkv,.webm"
                className="sr-only"
                aria-label="Replace video file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <aside className="space-y-6">
            <ScenarioSelect />
            {!file.isSample && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your file will <strong className="font-medium text-foreground">not</strong> be analyzed. Analysis
                results come from the selected demo scenario.
              </p>
            )}
          </aside>
        </div>
      )}

      <StepFooter>
        <Button variant="ghost" asChild>
          <Link to="/">Back to overview</Link>
        </Button>
        <Button onClick={analyze} disabled={!file}>
          {w.analysis === "done" ? "Re-run analysis" : "Analyze source"} <ArrowRight />
        </Button>
      </StepFooter>
      {!file && <p className="mt-2 text-right text-xs text-muted-foreground">Select a video to continue.</p>}
    </Page>
  );
}
