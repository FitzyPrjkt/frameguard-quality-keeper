import { Link, useRouterState } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  WORKFLOW_STEPS,
  furthestReachableStep,
  stepAt,
  useWorkflow,
  type StepState,
} from "@/lib/frameguard/workflow";

export function useStepStates(): { states: StepState[]; current: number; furthest: number } {
  const w = useWorkflow();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = WORKFLOW_STEPS.findIndex((s) => s.to === pathname);
  const furthest = furthestReachableStep(w);
  const skipped = w.decision === "NO_CHANGE" && w.noChangeAcknowledged;
  const states = WORKFLOW_STEPS.map((_, i): StepState => {
    if (skipped && (i === 5 || i === 6)) return "skipped";
    if (i === current) return "current";
    if (i < furthest) return "complete";
    if (i === furthest) return "available";
    return "locked";
  });
  return { states, current, furthest };
}

export function WorkflowStepper() {
  const { states, current } = useStepStates();
  const step = WORKFLOW_STEPS[current];

  return (
    <nav aria-label="Preparation workflow" className="mb-8 md:mb-10">
      {/* Mobile: compact summary */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-foreground">
            Step {current + 1} of {WORKFLOW_STEPS.length}
            <span className="text-muted-foreground"> · {step?.label}</span>
          </span>
          {current < WORKFLOW_STEPS.length - 1 && (
            <span className="text-muted-foreground">Next: {stepAt(current + 1).label}</span>
          )}
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {states.map((s, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                s === "complete" || s === "current" ? "bg-primary" : s === "skipped" ? "bg-border" : "bg-muted",
                s === "current" && "bg-primary",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center gap-1 md:flex">
        {WORKFLOW_STEPS.map((s, i) => {
          const state = states[i];
          const reachable = state !== "locked";
          const inner = (
            <>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition-colors",
                  state === "current" && "border-primary bg-primary text-primary-foreground",
                  state === "complete" && "border-primary/40 bg-primary/10 text-primary",
                  state === "available" && "border-primary/60 text-primary",
                  state === "locked" && "border-border text-muted-foreground",
                  state === "skipped" && "border-dashed border-border text-muted-foreground",
                )}
              >
                {state === "complete" ? <Check className="size-3" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs lg:inline",
                  state === "current" ? "font-medium text-foreground" : "text-muted-foreground",
                  state === "skipped" && "line-through",
                )}
              >
                {s.short}
              </span>
              <span className="sr-only">
                {s.label} — {state === "locked" ? "not yet available" : state}
              </span>
            </>
          );
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
              {reachable && state !== "current" ? (
                <Link
                  to={s.to}
                  className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-accent"
                  title={s.label}
                >
                  {inner}
                </Link>
              ) : (
                <span
                  className="flex min-w-0 items-center gap-2 px-1 py-1"
                  aria-current={state === "current" ? "step" : undefined}
                  title={state === "locked" ? `${s.label} — complete earlier steps first` : s.label}
                >
                  {inner}
                </span>
              )}
              {i < WORKFLOW_STEPS.length - 1 && (
                <span
                  className={cn("h-px min-w-2 flex-1", i < current ? "bg-primary/40" : "bg-border")}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
