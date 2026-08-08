"use client";

import { useVisualViewport } from "@/lib/useVisualViewport";

/**
 * Mantiene aggiornate le custom properties --vvh/--vvw/--vvt/--vvl su <html>
 * con le dimensioni reali del Visual Viewport (barra browser mobile inclusa).
 */
export default function VisualViewportProvider() {
  useVisualViewport();
  return null;
}
