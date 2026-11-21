"use client";

import { GlassEnhancer } from "@/components/ui/LiquidGlass";
import { useSimpleMode } from "@/lib/simpleMode";

/** Liquid glass su pulsanti, barre e pannelli di tutto il sito; spento nella "versione semplice". */
export default function GlassLayer() {
  const simple = useSimpleMode();
  return <GlassEnhancer selector='.btn:not(.btn-ghost), .glass-bar, .glass-panel, .card-lift, form, [class*="rounded-3xl"], [class*="rounded-2xl"]' disabled={simple} />;
}
