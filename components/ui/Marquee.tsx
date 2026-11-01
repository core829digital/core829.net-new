import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Durata di un giro completo (una metà) in secondi. */
  duration?: number;
  reverse?: boolean;
  /**
   * Quante copie del contenuto compongono ciascuna metà. Ogni metà deve essere
   * più larga della viewport: con pochi elementi serve più di una copia.
   */
  repeat?: number;
}

/**
 * Marquee infinito senza salti. La traccia contiene due metà identiche e
 * trasla di esattamente -50%: quando il giro finisce, la seconda metà occupa
 * la posizione della prima e il ciclo ricomincia in modo invisibile. Gli
 * elementi devono avere dimensioni stabili (niente immagini senza width/height)
 * e spaziatura interna (padding) uguale per tutti, così le due metà misurano
 * identiche. Pausa su hover; ferma con prefers-reduced-motion.
 */
export default function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
  repeat = 3,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group/marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]",
        className
      )}
    >
      <div
        className={cn("marquee-track", reverse && "marquee-track-reverse")}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((half) => (
          <div
            key={half}
            aria-hidden={half === 1}
            className="flex shrink-0 items-center"
          >
            {Array.from({ length: repeat }, (_, r) => (
              <div
                key={r}
                aria-hidden={half === 1 || r > 0}
                className="flex shrink-0 items-center"
              >
                {children}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
