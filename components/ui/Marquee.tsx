import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}

/**
 * Marquee infinito (loop CSS translateX -50%), pausa su hover.
 * Contenuto duplicato automaticamente per il loop seamless.
 */
export default function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
}: MarqueeProps) {
  return (
    <div className={cn("group/marquee overflow-hidden", className)}>
      <div
        className={cn(
          "marquee-track",
          reverse && "marquee-track-reverse"
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((dup) => (
          <div key={dup} aria-hidden={dup === 1} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
