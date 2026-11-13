import type { ReactNode } from "react";
import { FlaskConical, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { DEMO_LABEL } from "@/lib/frameguard/mock-data";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16 lg:px-10", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-xs font-medium text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold text-foreground md:text-[28px]">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-[15px]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-10 first:mt-0", className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface", className)}>{children}</div>
  );
}

export function DemoNotice({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-md border border-dashed border-warning/40 bg-warning/5 px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <FlaskConical className="mt-px size-3.5 shrink-0 text-warning" aria-hidden />
      <span>
        <span className="font-semibold tracking-wide text-foreground">{DEMO_LABEL}</span>
        {!compact && (
          <span className="block sm:inline sm:before:content-['_—_']">
            Values are synthetic and shown for demonstration only.
          </span>
        )}
      </span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/** Definition list of label/value rows separated by hairlines. */
export function DataList({
  rows,
  className,
}: {
  rows: { label: ReactNode; value: ReactNode; key?: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {rows.map((r, i) => (
        <div key={r.key ?? i} className="flex items-baseline justify-between gap-4 py-2.5">
          <dt className="text-sm text-muted-foreground">{r.label}</dt>
          <dd className="min-w-0 text-right">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
