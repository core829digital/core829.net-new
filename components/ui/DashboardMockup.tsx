/**
 * Mockup astratto di una dashboard webapp (stile IWHome).
 * Decorativo: nessun dato inventato, solo forme geometriche.
 */
export default function DashboardMockup() {
  return (
    <div className="relative border border-border bg-background shadow-2xl">
      {/* Barra finestra */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="ml-4 flex-1 rounded-full bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
          app.iwhome.app
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-36 shrink-0 space-y-2 border-r border-border p-4 sm:block">
          <div className="mb-5 h-3 w-16 bg-foreground/80" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={`h-2 w-2 ${i === 0 ? "bg-accent" : "bg-border"}`}
              />
              <span className="h-2 flex-1 rounded bg-surface" />
            </div>
          ))}
        </div>

        {/* Contenuto */}
        <div className="flex-1 space-y-6 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-28 bg-foreground/80" />
              <div className="mt-2 h-2 w-40 rounded bg-border" />
            </div>
            <div className="h-8 w-24 bg-foreground" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border border-border p-3">
                <div className="h-2 w-12 rounded bg-border" />
                <div
                  className="mt-3 h-4 w-16"
                  style={{ backgroundColor: i === 1 ? "var(--color-accent)" : "var(--color-foreground)" }}
                />
                <div className="mt-3 space-y-1.5">
                  <div className="h-1.5 w-full rounded bg-surface" />
                  <div className="h-1.5 w-3/4 rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border">
            <div className="grid grid-cols-4 gap-3 border-b border-border bg-surface px-4 py-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-10 rounded bg-border" />
              ))}
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="grid grid-cols-4 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="h-2 w-16 rounded bg-surface" />
                <div className="h-2 w-10 rounded bg-surface" />
                <div className="h-2 w-12 rounded bg-surface" />
                <div className="h-5 w-16 bg-accent/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
