import RevealOnScroll from "@/components/animations/RevealOnScroll";
import RevealWords from "@/components/animations/RevealWords";
import { cn } from "@/lib/utils";

/**
 * Intestazione standard di sezione: kicker mono + titolo display con reveal
 * a maschera + sottotitolo. Usata da tutte le sezioni della home.
 */
export default function SectionHeading({
  kicker,
  title,
  subtitle,
  className,
  titleClassName,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <RevealOnScroll variant="fade">
        <p className="kicker flex items-center gap-3">
          <span aria-hidden className="h-px w-8 bg-accent" />
          {kicker}
        </p>
      </RevealOnScroll>
      <RevealWords
        text={title}
        className={cn("mt-5 text-section-title", titleClassName)}
      />
      {subtitle && (
        <RevealOnScroll>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
            {subtitle}
          </p>
        </RevealOnScroll>
      )}
    </div>
  );
}
