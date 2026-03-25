import { cn } from "@/lib/utils";

interface SteamProps {
  active: boolean;
  className?: string;
}

export function Steam({ active, className }: SteamProps) {
  if (!active) return null;

  return (
    <div className={cn("absolute pointer-events-none flex justify-center gap-4 w-32 h-40", className)}>
      <svg className="w-full h-full text-foreground/40" viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path className="steam-path" d="M 30,150 Q 10,100 30,50 T 30,0" />
        <path className="steam-path" d="M 50,150 Q 70,100 50,50 T 50,0" />
        <path className="steam-path" d="M 70,150 Q 50,100 70,50 T 70,0" />
      </svg>
    </div>
  );
}
