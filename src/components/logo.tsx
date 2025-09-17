
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  isHeader?: boolean;
  title?: string;
}

export function Logo({ isHeader = false, title }: LogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Agenda Logo">
      <Image 
        src="/favcon.ico"
        alt="Agenda Logo"
        width={isHeader ? 28 : 40}
        height={isHeader ? 28 : 40}
        priority
      />
      {title && <span className={cn("font-semibold", isHeader ? "text-lg text-white" : "text-2xl")}>{title}</span>}
    </div>
  );
}
