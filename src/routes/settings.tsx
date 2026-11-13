import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DataList, Page, PageHeader, Section } from "@/components/fg/layout";
import { outputFilename } from "@/lib/frameguard/preparation";
import { useWorkflow, type Settings } from "@/lib/frameguard/workflow";
import { useTheme, type ThemePreference } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FrameGuard" },
      { name: "description", content: "Theme, output, processing and history preferences for FrameGuard." },
      { property: "og:title", content: "Settings — FrameGuard" },
      { property: "og:description", content: "Theme, output, processing and history preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function Row({ label, description, htmlFor, children }: { label: string; description?: ReactNode; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">{label}</Label>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function LockedSwitch({ id, label }: { id: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Lock className="size-3.5" aria-hidden /> Always on
      <Switch id={id} checked disabled aria-label={`${label} (always on, cannot be changed)`} />
    </span>
  );
}

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, clearHistory, history } = useWorkflow();

  return (
    <Page className="max-w-3xl">
      <PageHeader title="Settings" description="Preferences are stored in this browser." />

      <Section title="Appearance">
        <div className="divide-y divide-border border-y border-border">
          <Row label="Theme" description="System follows your device setting.">
            <ToggleGroup
              type="single"
              variant="outline"
              value={theme}
              onValueChange={(v) => v && setTheme(v as ThemePreference)}
              aria-label="Theme"
            >
              <ToggleGroupItem value="system" aria-label="System" className="gap-1.5 px-3"><Monitor className="size-4" /> System</ToggleGroupItem>
              <ToggleGroupItem value="light" aria-label="Light" className="gap-1.5 px-3"><Sun className="size-4" /> Light</ToggleGroupItem>
              <ToggleGroupItem value="dark" aria-label="Dark" className="gap-1.5 px-3"><Moon className="size-4" /> Dark</ToggleGroupItem>
            </ToggleGroup>
          </Row>
        </div>
      </Section>

      <Section title="Output">
        <div className="divide-y divide-border border-y border-border">
          <Row
            label="Filename suffix"
            htmlFor="suffix"
            description={<>Example: <span className="font-mono text-[13px] text-foreground">{outputFilename("sample-video.mp4", settings.outputSuffix)}</span></>}
          >
            <Input
              id="suffix"
              value={settings.outputSuffix}
              onChange={(e) => updateSettings({ outputSuffix: e.target.value.slice(0, 24) })}
              className="w-full bg-surface sm:w-44"
            />
          </Row>
          <Row label="Never overwrite the original" description="Prepared videos are always saved as a new file." htmlFor="no-overwrite">
            <LockedSwitch id="no-overwrite" label="Never overwrite the original" />
          </Row>
        </div>
      </Section>

      <Section title="Processing">
        <div className="divide-y divide-border border-y border-border">
          <Row label="Confirm before generating" description="Show a summary dialog before any new file is created." htmlFor="confirm">
            <Switch
              id="confirm"
              checked={settings.confirmBeforeProcessing}
              onCheckedChange={(v) => updateSettings({ confirmBeforeProcessing: v })}
            />
          </Row>
          <Row label="Require authorization for lossy re-encoding" description="Re-encoding always needs your explicit approval for each video." htmlFor="lossy">
            <LockedSwitch id="lossy" label="Require authorization for lossy re-encoding" />
          </Row>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Platform limits aren't configurable. They come from evidence in{" "}
          <Link to="/profiles" className="text-primary underline-offset-4 hover:underline">Platform Profiles</Link>.
        </p>
      </Section>

      <Section title="History">
        <div className="divide-y divide-border border-y border-border">
          <Row label="Keep session history" description="Record new sessions on this device." htmlFor="keep">
            <Switch id="keep" checked={settings.keepHistory} onCheckedChange={(v) => updateSettings({ keepHistory: v })} />
          </Row>
          <Row label="Keep sessions for" htmlFor="retention">
            <Select
              value={settings.historyRetention}
              onValueChange={(v) => updateSettings({ historyRetention: v as Settings["historyRetention"] })}
              disabled={!settings.keepHistory}
            >
              <SelectTrigger id="retention" className="w-full bg-surface sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="forever">Until cleared</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Clear history" description={`${history.length} session${history.length === 1 ? "" : "s"} stored.`}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={history.length === 0}>Clear history</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Session records will be removed. Your video files are not affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      clearHistory();
                      toast.success("History cleared");
                    }}
                  >
                    Clear history
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Row>
        </div>
      </Section>

      <Section title="About">
        <DataList
          rows={[
            { label: "Application", value: <span className="text-sm">FrameGuard</span> },
            { label: "Build", value: <span className="font-mono text-[13px]">web-prototype 0.1</span> },
            { label: "Media processing", value: <span className="text-sm">Simulated — no FFmpeg</span> },
            { label: "Platform data", value: <span className="text-sm">Demo profiles only</span> },
          ]}
        />
        <p className="mt-4 text-xs text-muted-foreground italic">
          “Don't maximize the numbers. Maximize the preserved quality.”
        </p>
      </Section>
    </Page>
  );
}
