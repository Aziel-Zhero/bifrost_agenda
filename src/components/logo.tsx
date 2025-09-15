import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  isHeader?: boolean;
}

export function Logo({ isHeader = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Agenda Logo">
      <Image 
        src="/logo_calendario.png"
        alt="Agenda Logo"
        width={isHeader ? 28 : 40}
        height={isHeader ? 28 : 40}
        className={cn(isHeader ? "brightness-0 invert" : "")}
        priority
      />
    </div>
  );
}
