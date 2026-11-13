import { FlaskConical } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCENARIOS } from "@/lib/frameguard/mock-data";
import { useWorkflow } from "@/lib/frameguard/workflow";

export function ScenarioSelect() {
  const { scenario, setScenario } = useWorkflow();
  return (
    <div className="space-y-2">
      <Label htmlFor="scenario" className="flex items-center gap-1.5 text-sm">
        <FlaskConical className="size-3.5 text-warning" aria-hidden />
        Demo scenario
      </Label>
      <Select value={scenario.id} onValueChange={setScenario}>
        <SelectTrigger id="scenario" className="w-full bg-surface">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SCENARIOS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{scenario.description}</p>
    </div>
  );
}
