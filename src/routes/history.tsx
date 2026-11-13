import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Search, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataList, DemoNotice, EmptyState, Page, PageHeader } from "@/components/fg/layout";
import { Status, decisionStatusMeta, verificationMeta } from "@/components/fg/status";
import { formatDate, formatDateTime } from "@/lib/frameguard/format";
import { decisionMeta } from "@/lib/frameguard/preparation";
import type { Decision, HistoryEntry } from "@/lib/frameguard/types";
import { useWorkflow } from "@/lib/frameguard/workflow";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — FrameGuard" },
      { name: "description", content: "Previous analysis and preparation sessions, with decisions and verification results." },
      { property: "og:title", content: "History — FrameGuard" },
      { property: "og:description", content: "Previous analysis and preparation sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

const DECISIONS = Object.keys(decisionMeta) as Decision[];
const VERIFICATIONS = Object.keys(verificationMeta) as HistoryEntry["verification"][];

function HistoryPage() {
  const { history } = useWorkflow();
  const [q, setQ] = useState("");
  const [decision, setDecision] = useState<string>("all");
  const [verification, setVerification] = useState<string>("all");
  const [open, setOpen] = useState<HistoryEntry | null>(null);

  const filtered = useMemo(
    () =>
      history.filter(
        (h) =>
          h.filename.toLowerCase().includes(q.trim().toLowerCase()) &&
          (decision === "all" || h.decision === decision) &&
          (verification === "all" || h.verification === verification),
      ),
    [history, q, decision, verification],
  );
  const hasFilters = q !== "" || decision !== "all" || verification !== "all";
  const clear = () => {
    setQ("");
    setDecision("all");
    setVerification("all");
  };

  return (
    <Page>
      <PageHeader title="History" description="Previous analysis and preparation sessions." />

      {history.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No history yet"
          description="Sessions appear here after you prepare a video. History can be turned off in Settings."
          action={<Button asChild><Link to="/videos">Prepare a video</Link></Button>}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by filename"
                aria-label="Search by filename"
                className="bg-surface pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger className="bg-surface sm:w-[190px]" aria-label="Filter by method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  {DECISIONS.map((d) => <SelectItem key={d} value={d}>{decisionMeta[d].label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={verification} onValueChange={setVerification}>
                <SelectTrigger className="bg-surface sm:w-[170px]" aria-label="Filter by verification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All results</SelectItem>
                  {VERIFICATIONS.map((v) => <SelectItem key={v} value={v}>{verificationMeta[v].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {filtered.length} of {history.length} sessions
            {hasFilters && (
              <Button variant="link" size="sm" className="ml-2 h-auto p-0 text-xs" onClick={clear}>Clear filters</Button>
            )}
          </p>

          {filtered.length === 0 ? (
            <EmptyState icon={SearchX} title="No matching sessions" description="Try a different search or clear the filters." action={<Button variant="outline" onClick={clear}>Clear filters</Button>} />
          ) : (
            <>
              <div className="mt-4 hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Source profile</TableHead>
                      <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((h) => {
                      const d = decisionStatusMeta[h.decision];
                      const v = verificationMeta[h.verification];
                      return (
                        <TableRow key={h.id}>
                          <TableCell className="max-w-[220px] truncate font-medium">{h.filename}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(h.date)}</TableCell>
                          <TableCell><Status tone={d.tone} icon={d.icon} label={decisionMeta[h.decision].label} /></TableCell>
                          <TableCell><Status tone={v.tone} icon={v.icon} label={v.label} /></TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{h.sourceProfile}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(h)}>Open report</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ul className="mt-4 divide-y divide-border border-y border-border md:hidden">
                {filtered.map((h) => {
                  const v = verificationMeta[h.verification];
                  return (
                    <li key={h.id}>
                      <button type="button" onClick={() => setOpen(h)} className="flex w-full items-center gap-3 py-3.5 text-left">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{h.filename}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(h.date)} · {decisionMeta[h.decision].label}
                          </p>
                        </div>
                        <Status tone={v.tone} icon={v.icon} label={v.label} className="text-xs" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <DemoNotice compact className="mt-6" />
        </>
      )}

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-md">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="break-all">{open.filename}</DialogTitle>
                <DialogDescription>{formatDateTime(open.date)}</DialogDescription>
              </DialogHeader>
              <DataList
                rows={[
                  { label: "Decision", value: <span className="font-mono text-[13px]">{open.decision}</span> },
                  { label: "Method", value: <span className="text-sm">{decisionMeta[open.decision].method}</span> },
                  { label: "Verification", value: <Status tone={verificationMeta[open.verification].tone} icon={verificationMeta[open.verification].icon} label={verificationMeta[open.verification].label} /> },
                  { label: "Source profile", value: <span className="font-mono text-xs">{open.sourceProfile}</span> },
                  { label: "Platform profile", value: <span className="text-sm">{open.platformProfile}</span> },
                ]}
              />
              <p className="text-sm text-muted-foreground">{decisionMeta[open.decision].summary}</p>
              <DemoNotice compact />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}
