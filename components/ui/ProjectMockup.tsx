import { cn } from "@/lib/utils";

type MockupVariant = "dashboard" | "3d" | "crm" | "fashion" | "auction";

/**
 * Mockup grafico astratto per i case study.
 * Coerente con la palette (bianco/nero/rosso): nessuno screenshot finto.
 */
export default function ProjectMockup({
  variant,
  className,
}: {
  variant: MockupVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden border border-border bg-surface",
        className
      )}
    >
      {variant === "dashboard" && <DashboardMock />}
      {variant === "3d" && <ThreeDMock />}
      {variant === "crm" && <CrmMock />}
      {variant === "fashion" && <FashionMock />}
      {variant === "auction" && <AuctionMock />}
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="flex h-full">
      <div className="hidden w-1/4 flex-col gap-3 border-r border-border bg-background p-4 sm:flex">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-2 rounded bg-border", i === 0 && "bg-accent")} />
        ))}
      </div>
      <div className="flex-1 space-y-4 p-5">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 border border-border bg-background p-3">
              <div className="h-2 w-8 rounded bg-border" />
              <div className="mt-3 h-3 w-12 bg-foreground" />
            </div>
          ))}
        </div>
        <div className="grid h-1/2 grid-cols-2 gap-3">
          <div className="border border-border bg-background p-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-accent" />
                <div className="h-1.5 flex-1 rounded bg-border" />
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-end border border-border bg-foreground p-3">
            <div className="h-2 w-16 bg-white/60" />
            <div className="mt-2 h-2 w-24 bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreeDMock() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-foreground">
      <div className="absolute h-40 w-40 rotate-12 bg-white/10" />
      <div className="absolute h-40 w-40 -rotate-12 bg-white/15" />
      <div className="absolute h-32 w-32 bg-accent/80" />
      <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-white">
        3D / Motion
      </span>
    </div>
  );
}

function CrmMock() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between border border-border bg-background px-4 py-3">
        <div className="h-2 w-24 rounded bg-border" />
        <div className="h-2 w-10 rounded bg-accent" />
      </div>
      <div className="flex flex-1 gap-3">
        <div className="flex w-1/3 flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border border-border bg-background p-2">
              <div className="h-2 w-14 rounded bg-border" />
              <div className="mt-2 h-1.5 w-10 rounded bg-surface" />
            </div>
          ))}
        </div>
        <div className="flex-1 border border-border bg-background p-3">
          <div className="h-2 w-20 rounded bg-foreground/70" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mt-3 flex gap-2">
              <div className="h-1.5 w-1/3 rounded bg-border" />
              <div className="h-1.5 w-1/4 rounded bg-border" />
              <div className="h-1.5 w-1/6 rounded bg-accent/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FashionMock() {
  return (
    <div className="grid h-full grid-cols-3 gap-4 p-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col justify-between border border-border bg-background p-3">
          <div className="aspect-[3/4] bg-surface" />
          <div className="mt-3">
            <div className="h-2 w-12 rounded bg-border" />
            <div className="mt-2 h-2 w-16 bg-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuctionMock() {
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="h-2 w-20 rounded bg-foreground/70" />
        <div className="flex gap-2">
          <div className="h-6 w-10 bg-accent/15" />
          <div className="h-6 w-10 bg-foreground" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border border-border bg-background p-3">
            <div className="h-10 bg-surface" />
            <div className="mt-2 h-2 w-16 rounded bg-border" />
            <div className="mt-3 h-2 w-20 rounded bg-accent" />
          </div>
        ))}
      </div>
    </div>
  );
}
