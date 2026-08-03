import { cn } from "@/lib/utils";

interface ClientScreenshotProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Screenshot reale di un progetto cliente, in frame minimale premium.
 * Usa <img> nativo (niente next/image optimizer) per la massima affidabilità:
 * nessun `fill`/lazy che possano nascondere o sovrapporre l'immagine.
 * Le immagini sono ~2:1: w-full h-auto mostra il progetto completo, senza crop.
 */
export default function ClientScreenshot({
  src,
  alt,
  width,
  height,
  className,
}: ClientScreenshotProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-surface",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full object-cover object-top transition-transform duration-700 hover:scale-[1.02]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10"
      />
    </div>
  );
}