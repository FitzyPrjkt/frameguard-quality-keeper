import { cn } from "@/lib/utils";
import type { Field } from "@/lib/frameguard/types";

/** Renders a measured value, or an honest "Unknown" / "Not available". */
export function FieldValue({ field, className }: { field: Field; className?: string }) {
  if (field.kind === "measured") {
    return <span className={cn("font-mono text-[13px] text-foreground", className)}>{field.value}</span>;
  }
  return (
    <span
      className={cn("text-sm text-muted-foreground italic", className)}
      title={field.note}
    >
      {field.kind === "unknown" ? "Unknown" : "Not available"}
      {field.note && <span className="sr-only"> — {field.note}</span>}
    </span>
  );
}
