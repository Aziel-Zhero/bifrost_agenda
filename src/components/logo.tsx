import { Combine } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  isHeader?: boolean;
}

export function Logo({ isHeader = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Bifrost Logo">
      <Combine className={cn("h-7 w-7", isHeader ? "text-white" : "text-primary")} />
      <span className={cn("text-xl font-semibold tracking-tight", isHeader ? "text-white" : "text-foreground")}>
        Bifrost
      </span>
    </div>
  );
}
