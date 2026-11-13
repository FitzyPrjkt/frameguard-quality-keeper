import { cn } from "@/lib/utils";

/** FrameGuard mark: a frame with a protected inner frame. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("size-6", className)} aria-hidden>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" className="stroke-primary" strokeWidth="1.6" />
      <path d="M8 12.2l2.6 2.5L16 9.5" className="stroke-primary" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
