import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { SAMPLE_FILE, SEED_HISTORY, getProfile, getScenario } from "./mock-data";
import { decidePreparation } from "./preparation";
import type { Decision, HistoryEntry, PlatformProfile, Scenario, SelectedFile } from "./types";

export type AnalysisStatus = "idle" | "running" | "done";
export type ProcessingStatus = "idle" | "running" | "succeeded" | "failed" | "cancelled";

export interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
  stageIndex: number;
  error: string | null;
}

export interface Settings {
  outputSuffix: string;
  confirmBeforeProcessing: boolean;
  keepHistory: boolean;
  historyRetention: "30" | "90" | "forever";
}

const DEFAULT_SETTINGS: Settings = {
  outputSuffix: "frameguard",
  confirmBeforeProcessing: true,
  keepHistory: true,
  historyRetention: "90",
};

const IDLE: ProcessingState = { status: "idle", progress: 0, stageIndex: 0, error: null };
const SETTINGS_KEY = "frameguard-settings";

interface WorkflowContextValue {
  file: SelectedFile | null;
  scenario: Scenario;
  profile: PlatformProfile;
  decision: Decision;
  analysis: AnalysisStatus;
  lossyAuthorized: boolean;
  noChangeAcknowledged: boolean;
  processing: ProcessingState;
  history: HistoryEntry[];
  settings: Settings;
  selectFile: (file: SelectedFile) => void;
  loadSampleFile: () => void;
  removeFile: () => void;
  setScenario: (id: string) => void;
  runAnalysis: () => void;
  setLossyAuthorized: (v: boolean) => void;
  acknowledgeNoChange: () => void;
  startProcessing: () => void;
  cancelProcessing: () => void;
  resetProcessing: () => void;
  startOver: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  clearHistory: () => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [scenarioId, setScenarioId] = useState("remux");
  const [analysis, setAnalysis] = useState<AnalysisStatus>("idle");
  const [lossyAuthorized, setLossyAuthorized] = useState(false);
  const [noChangeAcknowledged, setNoChangeAcknowledged] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>(IDLE);
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = getScenario(scenarioId);
  const profile = getProfile(scenario.profileId);
  const decision = useMemo(() => decidePreparation(scenario.compatibility), [scenario]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed settings */
    }
  }, []);

  const resetDownstream = useCallback(() => {
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
    setAnalysis("idle");
    setLossyAuthorized(false);
    setNoChangeAcknowledged(false);
    setProcessing(IDLE);
  }, []);

  const recordSession = useCallback(
    (verification: HistoryEntry["verification"]) => {
      if (!settings.keepHistory || !file) return;
      const video = scenario.metadata.find((g) => g.id === "video");
      const pick = (k: string) => {
        const f = video?.rows.find((r) => r.key === k)?.field;
        return f?.kind === "measured" ? f.value : "?";
      };
      setHistory((h) => [
        {
          id: `s-${Date.now()}`,
          filename: file.name,
          date: new Date().toISOString(),
          decision,
          verification,
          sourceProfile: `${pick("codec").split(" ")[0]} · ${pick("resolution")} · ${pick("fps")}`,
          platformProfile: profile.name,
          isDemo: true,
        },
        ...h,
      ]);
    },
    [settings.keepHistory, file, scenario, decision, profile.name],
  );

  // Simulated processing loop. This is a timer, not FFmpeg.
  useEffect(() => {
    if (processing.status !== "running") return;
    const stages = scenario.processing.stages.length || 1;
    const id = setInterval(() => {
      setProcessing((p) => {
        if (p.status !== "running") return p;
        const next = Math.min(100, p.progress + 1.4 + Math.random() * 2.2);
        const failAt = scenario.processing.failAt;
        if (failAt != null && next >= failAt) {
          return {
            ...p,
            status: "failed",
            progress: failAt,
            error: scenario.processing.failureMessage ?? "Processing failed (simulated).",
          };
        }
        const stageIndex = Math.min(stages - 1, Math.floor((next / 100) * stages));
        if (next >= 100) return { ...p, status: "succeeded", progress: 100, stageIndex };
        return { ...p, progress: next, stageIndex };
      });
    }, 110);
    return () => clearInterval(id);
  }, [processing.status, scenario]);

  const prevStatus = useRef<ProcessingStatus>("idle");
  useEffect(() => {
    if (prevStatus.current !== "succeeded" && processing.status === "succeeded") {
      recordSession(scenario.verification?.overall ?? "inconclusive");
    }
    prevStatus.current = processing.status;
  }, [processing.status, recordSession, scenario.verification]);

  const value: WorkflowContextValue = {
    file,
    scenario,
    profile,
    decision,
    analysis,
    lossyAuthorized,
    noChangeAcknowledged,
    processing,
    history,
    settings,
    selectFile: (f) => {
      resetDownstream();
      setFile(f);
    },
    loadSampleFile: () => {
      resetDownstream();
      setFile({ ...SAMPLE_FILE });
    },
    removeFile: () => {
      resetDownstream();
      setFile(null);
    },
    setScenario: (id) => {
      resetDownstream();
      setScenarioId(id);
    },
    runAnalysis: () => {
      if (!file) return;
      resetDownstream();
      setAnalysis("running");
      analysisTimer.current = setTimeout(() => setAnalysis("done"), 1400);
    },
    setLossyAuthorized,
    acknowledgeNoChange: () => {
      if (!noChangeAcknowledged) recordSession("not_run");
      setNoChangeAcknowledged(true);
    },
    startProcessing: () => setProcessing({ ...IDLE, status: "running" }),
    cancelProcessing: () =>
      setProcessing((p) => (p.status === "running" ? { ...p, status: "cancelled" } : p)),
    resetProcessing: () => setProcessing(IDLE),
    startOver: () => {
      resetDownstream();
      setFile(null);
    },
    updateSettings: (patch) =>
      setSettings((s) => {
        const next = { ...s, ...patch };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
      }),
    clearHistory: () => setHistory([]),
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error("useWorkflow must be used within WorkflowProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Workflow steps                                                      */
/* ------------------------------------------------------------------ */

export const WORKFLOW_STEPS = [
  { id: "select", label: "Select video", short: "Select", to: "/videos" },
  { id: "analyze", label: "Analyze source", short: "Analyze", to: "/analysis" },
  { id: "assess", label: "Assess compatibility", short: "Assess", to: "/compatibility" },
  { id: "decide", label: "Preparation decision", short: "Decide", to: "/preparation" },
  { id: "confirm", label: "Confirm", short: "Confirm", to: "/review" },
  { id: "process", label: "Process", short: "Process", to: "/processing" },
  { id: "verify", label: "Verify output", short: "Verify", to: "/verification" },
  { id: "export", label: "Export or share", short: "Export", to: "/export" },
] as const;

export function stepAt(i: number) {
  return WORKFLOW_STEPS[i] ?? WORKFLOW_STEPS[0];
}

export type StepState = "complete" | "current" | "available" | "locked" | "skipped";

/** Index of the furthest step the user may open. */
export function furthestReachableStep(w: {
  file: SelectedFile | null;
  analysis: AnalysisStatus;
  decision: Decision;
  processing: ProcessingState;
  noChangeAcknowledged: boolean;
}): number {
  if (!w.file) return 0;
  if (w.analysis !== "done") return 1;
  if (w.decision === "NO_CHANGE" && w.noChangeAcknowledged) return 7;
  if (w.processing.status === "succeeded") return 7;
  if (w.processing.status !== "idle") return 5;
  return 4;
}
