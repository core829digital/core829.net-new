"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfViewerProps {
  src: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

type RenderStatus = "loading" | "ready" | "error";

/**
 * Lettore PDF integrato (modal a schermo intero).
 *
 * A differenza di un <iframe> (che su molti browser mobile non renderizza
 * i PDF e mostra una schermata bianca), questo lettore scarica il file e
 * lo rasterizza su <canvas> con PDF.js. Funziona su desktop e mobile.
 */
export default function PdfViewer({ src, title, open, onClose }: PdfViewerProps) {
  const [status, setStatus] = useState<RenderStatus>("loading");
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const docRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setStatus("loading");
    setPageCount(0);
    setCurrentPage(1);

    (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        const doc = await loadingTask.promise;
        if (cancelled) {
          void loadingTask.destroy();
          return;
        }
        docRef.current = doc;
        setPageCount(doc.numPages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      if (docRef.current?.loadingTask) void docRef.current.loadingTask.destroy();
      docRef.current = null;
    };
  }, [src, open]);

  const renderPage = useCallback(async (pageNumber: number) => {
    const doc = docRef.current;
    const canvas = pageRefs.current[pageNumber - 1];
    if (!doc || !canvas || !scrollRef.current) return;

    const containerWidth = scrollRef.current.clientWidth;
    const page = await doc.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const scale = containerWidth / base.width;
    const viewport = page.getViewport({ scale });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
      transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
    }).promise;
  }, []);

  useEffect(() => {
    if (status !== "ready" || pageCount === 0) return;
    let cancelled = false;

    (async () => {
      for (let n = 1; n <= pageCount; n++) {
        if (cancelled) return;
        await renderPage(n);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, pageCount, renderPage]);

  useEffect(() => {
    if (status !== "ready") return;
    const el = scrollRef.current;
    if (!el) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        for (let n = 1; n <= pageCount; n++) void renderPage(n);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [status, pageCount, renderPage]);

  const goToPage = useCallback(
    (n: number) => {
      const target = Math.min(Math.max(1, n), pageCount);
      setCurrentPage(target);
      pageRefs.current[target - 1]?.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [pageCount]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && status === "ready") goToPage(currentPage + 1);
      if (e.key === "ArrowLeft" && status === "ready") goToPage(currentPage - 1);
    },
    [onClose, status, currentPage, goToPage]
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

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < pageCount;

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

            <div className="mt-4 flex min-h-0 flex-1 flex-col border border-border bg-surface">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrev}
                  className="inline-flex items-center gap-1 border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Pagina precedente"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <p className="font-mono text-xs tabular-nums text-foreground-muted">
                  {status === "ready" ? `${currentPage} / ${pageCount}` : "…"}
                </p>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNext}
                  className="inline-flex items-center gap-1 border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Pagina successiva"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>

              {status === "loading" && (
                <div className="flex flex-1 items-center justify-center text-sm text-foreground-muted">
                  Loading PDF…
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-1 items-center justify-center text-sm text-foreground-muted">
                  Unable to load this PDF.
                </div>
              )}

              {status === "ready" && (
                <div
                  ref={scrollRef}
                  className="min-h-0 flex-1 overflow-auto overscroll-contain"
                >
                  <div className="flex flex-col items-center gap-6 px-2 py-6">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                      <canvas
                        key={n}
                        ref={(el) => {
                          pageRefs.current[n - 1] = el;
                        }}
                        className="max-w-full border border-border bg-white shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
