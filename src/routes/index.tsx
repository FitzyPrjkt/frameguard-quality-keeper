import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DemoNotice, EmptyState, Page, PageHeader, Section, Surface } from "@/components/fg/layout";
import { Status, profileStatusMeta, verificationMeta } from "@/components/fg/status";
import { formatDate } from "@/lib/frameguard/format";
import { decisionMeta } from "@/lib/frameguard/preparation";
import { WORKFLOW_STEPS, furthestReachableStep, useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — FrameGuard" },
      { name: "description", content: "Your video quality workspace: prepare videos with the minimum necessary changes." },
      { property: "og:title", content: "Overview — FrameGuard" },
      { property: "og:description", content: "Your video quality workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const w = useWorkflow();
  const { history, profile, file } = w;
  const furthest = furthestReachableStep(w);
  const next = WORKFLOW_STEPS[furthest];

  const analyzed = history.length;
  const prepared = history.filter(
    (h) => (h.decision === "SMART_REMUX" || h.decision === "CONDITIONAL_REENCODE") && h.verification !== "not_run",
  ).length;
  const verified = history.filter((h) => h.verification !== "not_run");
  const passed = verified.filter((h) => h.verification === "passed").length;

  return (
    <Page>
      <PageHeader title="Overview" description="Your video quality workspace." />

      <Surface className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            {file ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">Session in progress</p>
                <h2 className="mt-1 truncate text-lg font-semibold text-foreground">{file.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Next step: <span className="text-foreground">{next.label}</span> · Step {furthest + 1} of{" "}
                  {WORKFLOW_STEPS.length}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-foreground">Prepare a video</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a file, see how it compares to a platform profile, and apply only the changes that
                  evidence supports. Your original is never modified.
                </p>
              </>
            )}
          </div>
          <Button size="lg" asChild className="w-full md:w-auto">
            <Link to={file ? next.to : "/videos"}>
              {file ? (
                <>
                  Continue <ArrowRight />
                </>
              ) : (
                <>
                  <Plus /> Prepare a Video
                </>
              )}
            </Link>
          </Button>
        </div>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground italic">
          “Don't maximize the numbers. Maximize the preserved quality.”
        </p>
      </Surface>

      <dl className="mt-10 grid grid-cols-3 divide-x divide-border">
        {[
          { label: "Videos analyzed", value: analyzed },
          { label: "Videos prepared", value: prepared },
          { label: "Verification results", value: verified.length, sub: `${passed} passed` },
        ].map((m) => (
          <div key={m.label} className="px-3 first:pl-0 sm:px-6">
            <dt className="text-xs text-muted-foreground">{m.label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-foreground">{m.value}</span>
              {m.sub && <span className="hidden text-xs text-muted-foreground sm:inline">{m.sub}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_280px]">
        <Section
          title="Recent activity"
          actions={
            history.length > 0 && (
              <Button variant="link" size="sm" asChild className="h-auto px-0">
                <Link to="/history">View all</Link>
              </Button>
            )
          }
        >
          {history.length === 0 ? (
            <Surface>
              <EmptyState
                icon={Clock}
                title="No sessions yet"
                description="When you analyze and prepare videos, they'll appear here."
                action={
                  <Button asChild variant="outline">
                    <Link to="/videos">Select a video</Link>
                  </Button>
                }
              />
            </Surface>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {history.slice(0, 5).map((h) => {
                const v = verificationMeta[h.verification];
                return (
                  <li key={h.id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{h.filename}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(h.date)} · {decisionMeta[h.decision].label}
                      </p>
                    </div>
                    <Status tone={v.tone} icon={v.icon} label={v.label} />
                  </li>
                );
              })}
            </ul>
          )}
          <DemoNotice compact className="mt-4" />
        </Section>

        <Section title="Platform profile">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">{profile.name}</p>
            <Status
              tone={profileStatusMeta[profile.status].tone}
              icon={profileStatusMeta[profile.status].icon}
              label={profileStatusMeta[profile.status].label}
            />
            <p className="text-muted-foreground">
              Version <span className="font-mono text-[13px] text-foreground">{profile.version}</span>
              <br />
              Last verified: {profile.lastVerified ? formatDate(profile.lastVerified) : "never"}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/profiles">Review evidence</Link>
            </Button>
          </div>
        </Section>
      </div>
    </Page>
  );
}
