"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  index: number;
}

/**
 * Voce accordion FAQ con animazione di apertura tramite grid-template-rows.
 * Touch target ≥44px.
 */
export default function AccordionItem({
  question,
  answer,
  open,
  onToggle,
  index,
}: AccordionItemProps) {
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${index}`}
        id={`faq-button-${index}`}
        className="flex min-h-11 w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="flex items-baseline gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            0{index + 1}
          </span>
          <span className="text-lg font-medium tracking-tight text-foreground">
            {question}
          </span>
        </span>
        <Plus
          className={cn(
            "h-5 w-5 shrink-0 text-foreground transition-transform duration-300",
            open && "rotate-45 text-accent"
          )}
          aria-hidden
        />
      </button>
      <div
        id={`faq-panel-${index}`}
        role="region"
        aria-labelledby={`faq-button-${index}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 pl-9 text-foreground-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}
