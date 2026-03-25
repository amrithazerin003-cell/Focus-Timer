import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ 
  progress, 
  size = 320, 
  strokeWidth = 4,
  className 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure progress stays between 0 and 100
  const safeProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className="transform -rotate-90 w-full h-full drop-shadow-sm"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress */}
        <circle
          className="text-primary transition-all duration-1000 ease-linear"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.3))'
          }}
        />
      </svg>
    </div>
  );
}
