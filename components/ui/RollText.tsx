import { cn } from "@/lib/utils";

/**
 * Etichetta che "rotola" all'hover del genitore (`group/btn`): le lettere
 * salgono e escono a scaglioni mentre la copia entra dal basso. Dimensione
 * invariata (la riga sotto è assoluta). Porta dell'effetto CallButton di
 * Andromedia Web. Solo per testi brevi: sopra la soglia resta testo normale
 * per non forzare overflow nelle lingue con parole lunghe.
 */
const MAX_LEN = 26;

export default function RollText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (text.length > MAX_LEN) return <span className={className}>{text}</span>;

  const letters = Array.from(text);
  const row = (hover: boolean) =>
    letters.map((l, i) => (
      <span
        key={i}
        aria-hidden="true"
        className={cn(
          "inline-block transition-transform duration-500 ease-out-expo motion-reduce:transition-none",
          hover
            ? "translate-y-[110%] group-hover/btn:translate-y-0"
            : "group-hover/btn:-translate-y-[110%]"
        )}
        style={{ transitionDelay: `${Math.min(i, 18) * 18}ms` }}
      >
        {l === " " ? " " : l}
      </span>
    ));

  return (
    <span className={cn("relative inline-flex overflow-hidden whitespace-nowrap align-middle", className)}>
      <span className="sr-only">{text}</span>
      <span className="inline-flex">{row(false)}</span>
      <span className="absolute inset-0 inline-flex" aria-hidden="true">
        {row(true)}
      </span>
    </span>
  );
}
