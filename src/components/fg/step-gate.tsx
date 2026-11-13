import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/fg/layout";
import { WORKFLOW_STEPS } from "@/lib/frameguard/workflow";
import { useStepStates } from "@/components/fg/workflow-stepper";

/** Renders children only when the workflow has reached this step. */
export function StepGate({ step, children }: { step: number; children: ReactNode }) {
  const { furthest } = useStepStates();
  if (step <= furthest) return <>{children}</>;
  const target = WORKFLOW_STEPS[furthest];
  return (
    <EmptyState
      icon={Lock}
      title="This step isn't available yet"
      description={`Complete "${target.label}" first. FrameGuard only moves forward once each earlier step has produced a result.`}
      action={
        <Button asChild>
          <Link to={target.to}>
            Go to {target.label.toLowerCase()} <ArrowRight />
          </Link>
        </Button>
      }
    />
  );
}

export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-12 flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
