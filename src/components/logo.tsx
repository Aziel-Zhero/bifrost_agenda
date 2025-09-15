import { cn } from "@/lib/utils";

interface LogoProps {
  isHeader?: boolean;
}

export function Logo({ isHeader = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Agenda Logo">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(isHeader ? "text-white" : "text-primary")}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(198, 93%, 60%)' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(217, 91%, 60%)' }} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(217, 91%, 60%)' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(258, 90%, 66%)' }} />
          </linearGradient>
           <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
        <rect x="3" y="5" width="26" height="24" rx="5" fill="url(#grad1)" />
        <path d="M9 3C9 2.44772 9.44772 2 10 2H12C12.5523 2 13 2.44772 13 3V7C13 7.55228 12.5523 8 12 8H10C9.44772 8 9 7.55228 9 7V3Z" fill="url(#grad1)"/>
        <path d="M19 3C19 2.44772 19.4477 2 20 2H22C22.5523 2 23 2.44772 23 3V7C23 7.55228 22.5523 8 22 8H20C19.4477 8 19 7.55228 19 7V3Z" fill="url(#grad1)"/>
        
        <circle cx="16" cy="14" r="3" fill="url(#grad2)"/>
        <circle cx="9" cy="17" r="2.5" fill="url(#grad2)"/>
        <circle cx="23" cy="17" r="2.5" fill="url(#grad2)"/>

        <path d="M8 24C8 21.7909 9.79086 20 12 20H20C22.2091 20 24 21.7909 24 24V25H8V24Z" fill="url(#grad2)"/>
        <path d="M11 26C11 24.3431 12.3431 23 14 23H18C19.6569 23 21 24.3431 21 26V27H11V26Z" fill="url(#grad2)"/>
        </g>
      </svg>
    </div>
  );
}
