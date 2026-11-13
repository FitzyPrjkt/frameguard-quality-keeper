import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DemoNotice, Page, PageHeader, Section } from "@/components/fg/layout";
import { EvidenceTag, Status, evidenceMeta, profileStatusMeta } from "@/components/fg/status";
import { formatDate } from "@/lib/frameguard/format";
import { PROFILES } from "@/lib/frameguard/mock-data";
import type { EvidenceClass, PlatformProfile } from "@/lib/frameguard/types";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Platform Profiles — FrameGuard" },
      { name: "description", content: "Platform capability profiles with evidence classification and verification status." },
      { property: "og:title", content: "Platform Profiles — FrameGuard" },
      { property: "og:description", content: "Platform capability profiles and their evidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilesPage,
});

function ProfilesPage() {
  const [open, setOpen] = useState<PlatformProfile | null>(null);
  return (
    <Page>
      <PageHeader
        title="Platform Profiles"
        description="What FrameGuard knows about each platform's upload capabilities, and how it knows it."
      />
      <DemoNotice className="mb-8" />

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Last verified</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PROFILES.map((p) => {
              const s = profileStatusMeta[p.status];
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.platform}</p>
                  </TableCell>
                  <TableCell className="font-mono text-[13px]">{p.version}</TableCell>
                  <TableCell><Status tone={s.tone} icon={s.icon} label={s.label} /></TableCell>
                  <TableCell className="text-muted-foreground">{p.evidenceSummary}</TableCell>
                  <TableCell className="text-muted-foreground">{p.lastVerified ? `${formatDate(p.lastVerified)} (demo)` : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(p)}>View details</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y divide-border border-y border-border md:hidden">
        {PROFILES.map((p) => {
          const s = profileStatusMeta[p.status];
          return (
            <li key={p.id}>
              <button type="button" className="w-full py-4 text-left" onClick={() => setOpen(p)}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <span className="font-mono text-xs text-muted-foreground">{p.version}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <Status tone={s.tone} icon={s.icon} label={s.label} className="text-xs" />
                  <span>Last verified: {p.lastVerified ? formatDate(p.lastVerified) : "never"}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <Section title="About evidence" className="mt-12">
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {(Object.keys(evidenceMeta) as EvidenceClass[]).map((e) => (
            <div key={e}>
              <dt><EvidenceTag evidence={e} /></dt>
              <dd className="text-xs text-muted-foreground">{evidenceMeta[e].description}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 max-w-2xl text-xs text-muted-foreground">
          Platform limits are not editable here. A profile changes only when new evidence is collected and reviewed —
          never by guessing a number.
        </p>
      </Section>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>
                  Version {open.version} · {profileStatusMeta[open.status].label} · Last verified{" "}
                  {open.lastVerified ? `${formatDate(open.lastVerified)} (demo)` : "never"}
                </DialogDescription>
              </DialogHeader>
              <DemoNotice compact />
              <ul className="divide-y divide-border">
                {open.capabilities.map((c) => (
                  <li key={c.parameter} className="grid gap-1 py-3 text-sm sm:grid-cols-[150px_1fr_auto] sm:items-baseline sm:gap-4">
                    <span className="font-medium text-foreground">{c.parameter}</span>
                    <span>
                      <span className={c.evidence === "unknown" ? "text-muted-foreground italic" : "text-foreground"}>{c.value}</span>
                      <span className="block text-xs text-muted-foreground">{c.source}</span>
                    </span>
                    <EvidenceTag evidence={c.evidence} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
