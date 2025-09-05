import { Combine } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Bifrost Logo">
      <Combine className="h-7 w-7 text-primary" />
      <span className="text-xl font-semibold tracking-tight">Bifrost</span>
    </div>
  );
}
