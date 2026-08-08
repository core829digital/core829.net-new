"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface PdfViewerProps {
  src: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Lettore PDF integrato (modal a schermo intero).
 *
 * Il PDF viene scaricato via fetch e mostrato come blob URL: la risposta
 * blob non eredita gli header di sicurezza (X-Frame-Options / CSP
 * frame-ancestors) del server, quindi il lettore PDF nativo del browser
 * può renderizzarlo dentro l'iframe senza essere bloccato.
 */
export default function PdfViewer({ src, title, open, onClose }: PdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    setBlobUrl(null);
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(src);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] flex flex-col bg-background/95 p-4 backdrop-blur-sm sm:p-6 lg:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex w-full max-w-6xl flex-1 flex-col"
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  PDF
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Chiudi"
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-border text-foreground transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 border border-border bg-surface">
              {blobUrl ? (
                <iframe
                  src={blobUrl}
                  title={title}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex flex-1 items-center justify-center text-sm text-foreground-muted">
                  Loading PDF…
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
