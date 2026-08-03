"use client";

import PinnedSteps from "@/components/animations/PinnedSteps";

/**
 * "Come lavoriamo" — sezione con process sticky/scrub (desktop) e lista verticale (mobile).
 */
export default function HowWeWork() {
  return (
    <section id="metodo" className="bg-background">
      <PinnedSteps />
    </section>
  );
}
