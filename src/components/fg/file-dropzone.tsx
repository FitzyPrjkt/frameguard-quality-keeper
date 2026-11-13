import { useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SUPPORTED_FORMATS } from "@/lib/frameguard/mock-data";

const ACCEPT = "video/*,.mp4,.mov,.m4v,.mkv,.webm";

export function FileDropzone({ onFile, className }: { onFile: (file: File) => void; className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors md:py-16",
        dragging ? "border-primary bg-primary/5" : "border-input bg-surface",
        className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted">
        <Upload className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-[15px] font-medium text-foreground">
        <span className="hidden md:inline">Drop a video here, or</span>
        <span className="md:hidden">Choose a video from your device</span>
      </p>
      <Button variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
        Browse files
      </Button>
      <p className="mt-4 text-xs text-muted-foreground">
        {SUPPORTED_FORMATS.join(" · ")} — the file stays on your device.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-label="Select a video file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
