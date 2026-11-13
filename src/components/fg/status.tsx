import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDashed,
  CircleHelp,
  FileQuestion,
  type LucideIcon,
  MinusCircle,
  Repeat,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  Assessment,
  Decision,
  EvidenceClass,
  ProfileStatus,
  VerificationState,
} from "@/lib/frameguard/types";

export type Tone = "success" | "warning" | "destructive" | "info" | "neutral";

const toneText: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-primary",
  neutral: "text-muted-foreground",
};

const toneBg: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/12 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

interface StatusProps {
  tone: Tone;
  label: string;
  icon?: LucideIcon;
  variant?: "inline" | "pill";
  className?: string;
}

/** Status is always icon + text, never color alone. */
export function Status({ tone, label, icon: Icon, variant = "inline", className }: StatusProps) {
  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
          toneBg[tone],
          className,
        )}
      >
        {Icon && <Icon className="size-3.5" aria-hidden />}
        {label}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm whitespace-nowrap", className)}>
      {Icon && <Icon className={cn("size-4 shrink-0", toneText[tone])} aria-hidden />}
      <span className="text-foreground">{label}</span>
    </span>
  );
}

type Meta = { tone: Tone; label: string; icon: LucideIcon };

export const assessmentMeta: Record<Assessment, Meta> = {
  compatible: { tone: "success", label: "Compatible", icon: CheckCircle2 },
  needs_adjustment: { tone: "warning", label: "Needs adjustment", icon: AlertTriangle },
  unknown: { tone: "neutral", label: "Unknown", icon: CircleHelp },
  unsupported: { tone: "destructive", label: "Unsupported", icon: Ban },
  insufficient_evidence: { tone: "neutral", label: "Insufficient evidence", icon: FileQuestion },
};

export const decisionStatusMeta: Record<Decision, Meta> = {
  NO_CHANGE: { tone: "success", label: "NO_CHANGE", icon: CheckCircle2 },
  SMART_REMUX: { tone: "info", label: "SMART_REMUX", icon: Repeat },
  CONDITIONAL_REENCODE: { tone: "warning", label: "CONDITIONAL_REENCODE", icon: AlertTriangle },
  UNSUPPORTED: { tone: "destructive", label: "UNSUPPORTED", icon: Ban },
  INSUFFICIENT_EVIDENCE: { tone: "neutral", label: "INSUFFICIENT_EVIDENCE", icon: FileQuestion },
};

export const verificationMeta: Record<VerificationState | "not_run", Meta> = {
  passed: { tone: "success", label: "Passed", icon: CheckCircle2 },
  warning: { tone: "warning", label: "Warning", icon: AlertTriangle },
  failed: { tone: "destructive", label: "Failed", icon: XCircle },
  inconclusive: { tone: "neutral", label: "Inconclusive", icon: CircleDashed },
  not_run: { tone: "neutral", label: "Not run", icon: MinusCircle },
};

export const evidenceMeta: Record<EvidenceClass, { label: string; description: string }> = {
  official: { label: "Official", description: "Documented by the platform." },
  empirical: { label: "Empirical", description: "Confirmed by controlled upload tests." },
  secondary: { label: "Secondary", description: "Reported by third parties; not confirmed." },
  unknown: { label: "Unknown", description: "No evidence collected." },
  conflicting: { label: "Conflicting", description: "Sources disagree; cannot be relied on." },
};

export const profileStatusMeta: Record<ProfileStatus, Meta> = {
  verified: { tone: "success", label: "Verified", icon: ShieldCheck },
  partial: { tone: "info", label: "Partially verified", icon: ShieldCheck },
  unverified: { tone: "warning", label: "Unverified", icon: AlertTriangle },
  insufficient: { tone: "neutral", label: "Insufficient evidence", icon: FileQuestion },
};

export function EvidenceTag({ evidence }: { evidence: EvidenceClass }) {
  const dotTone: Record<EvidenceClass, string> = {
    official: "bg-success",
    empirical: "bg-primary",
    secondary: "bg-warning",
    unknown: "bg-muted-foreground/50",
    conflicting: "bg-destructive",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap"
      title={evidenceMeta[evidence].description}
    >
      <span className={cn("size-1.5 rounded-full", dotTone[evidence])} aria-hidden />
      {evidenceMeta[evidence].label}
    </span>
  );
}
