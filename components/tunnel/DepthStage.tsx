"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import NeuralNoise from "@/components/ui/neural-noise";
import { scrollToSlide } from "@/lib/scrollTo";
import { useSimpleMode } from "@/lib/simpleMode";
import { cn } from "@/lib/utils";

/**
 * DepthStage — esperienza "tunnel" a profondità guidata dallo scroll nativo.
 *
 * Una sezione alta (count × SEG svh) contiene uno stage sticky a tutto schermo
 * con prospettiva 3D. Lo scroll della pagina muove una "camera" lungo l'asse Z;
 * ogni slide è un piano a profondità diversa. La camera si ferma (plateau) su
 * ogni slide per dare il tempo di leggere, poi vola alla successiva. Gli
 * elementi interni (DepthItem) arrivano dai bordi come le card del tunnel.
 *
 * Perché scroll nativo e non wheel-hijack: funziona con touch, tastiera,
 * barra di scorrimento, Lenis e ancore, senza intrappolare l'utente.
 *
 * Modalità "flat": con prefers-reduced-motion o schermi troppo bassi (es.
 * telefono in orizzontale) le slide si impilano in una pagina normale.
 */

export type StageMode = "tunnel" | "flat";

/** Altezza di scroll (in svh) tra una slide e la successiva. */
export const SEG = 115;
/** Distanza Z (px) tra due slide consecutive. */
const GAP = 900;
const PERSPECTIVE = 1200;
/** Sotto questa altezza di viewport le slide non entrano: modalità flat. */
const MIN_HEIGHT = 560;

interface Dims {
  w: number;
  h: number;
}

interface StageValue {
  mode: StageMode;
  camera: MotionValue<number>;
  dimsRef: { current: Dims };
  count: number;
}

const StageContext = createContext<StageValue | null>(null);
const SlideContext = createContext<{ index: number; d: MotionValue<number> } | null>(null);

/** Distanza della slide corrente dalla camera (0 = in primo piano). Solo nel tunnel. */
export function useSlideDistance(): MotionValue<number> | null {
  return useContext(SlideContext)?.d ?? null;
}

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage va usato dentro <DepthStage>");
  return ctx;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

/** Camera con plateau: ferma per il 30% del segmento, si muove nel 40% centrale. */
function stepCamera(p: number, count: number) {
  if (count < 2) return 0;
  const t = clamp01(p) * (count - 1);
  const i = Math.min(Math.floor(t), count - 2);
  const f = t - i;
  return i + smoother(clamp01((f - 0.3) / 0.4));
}

/** Direzione radiale (x,y ∈ [-1,1]) di un elemento in una griglia a `cols` colonne. */
export function radial(i: number, n: number, cols: number): [number, number] {
  const c = Math.max(1, Math.min(cols, n));
  const col = i % c;
  const row = Math.floor(i / c);
  const rows = Math.ceil(n / c);
  const x = c > 1 ? (col / (c - 1)) * 2 - 1 : 0;
  const y = rows > 1 ? (row / (rows - 1)) * 2 - 1 : 0;
  if (x === 0 && y === 0) return [0, -1];
  return [x, y];
}

function useStageMode() {
  const simple = useSimpleMode();
  const [auto, setAuto] = useState<StageMode>("tunnel");
  const dimsRef = useRef<Dims>({ w: 1440, h: 900 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      dimsRef.current = { w: window.innerWidth, h: window.innerHeight };
      const flat = mq.matches || window.innerHeight < MIN_HEIGHT;
      setAuto(flat ? "flat" : "tunnel");
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  // La scelta esplicita dell'utente (versione semplice) vince sul rilevamento automatico.
  const mode: StageMode = simple ? "flat" : auto;
  return { mode, dimsRef };
}

/* ───────────────────────────── Slide ───────────────────────────── */

export interface DepthSlideProps {
  /** Iniettato da DepthStage. */
  index?: number;
  id?: string;
  className?: string;
  children: ReactNode;
  /** Slide su sfondo scuro (testo chiaro): usata dall'intro. */
  dark?: boolean;
  /** Sfondo mostrato solo in modalità flat (nel tunnel c'è quello dello stage). */
  flatBackground?: ReactNode;
}

export function DepthSlide({
  index = 0,
  id,
  className,
  children,
  dark = false,
  flatBackground,
}: DepthSlideProps) {
  const stage = useStage();

  if (stage.mode === "flat") {
    return (
      <section
        id={id}
        className={cn(
          "relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden",
          dark ? "bg-ink text-on-ink" : "bg-background",
          index % 2 === 1 && !dark && "bg-surface"
        )}
      >
        {flatBackground}
        <div
          className={cn(
            "container-core829 relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-[clamp(1rem,3.8svh,3.5rem)] py-24",
            className
          )}
        >
          {children}
        </div>
      </section>
    );
  }

  return <TunnelSlide index={index} id={id} className={className} dark={dark}>{children}</TunnelSlide>;
}

function TunnelSlide({
  index = 0,
  id,
  className,
  children,
  dark,
}: Omit<DepthSlideProps, "flatBackground">) {
  const { camera } = useStage();
  const d = useTransform(camera, (c) => index - c);
  const opacity = useTransform(d, (v) =>
    v >= 0 ? clamp01((1 - v) / 0.55) : clamp01(1 + v / 0.4)
  );
  const transform = useTransform(d, (v) => `translate3d(0px, 0px, ${-v * GAP}px)`);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const pointerEvents = useTransform(d, (v) => (Math.abs(v) < 0.2 ? "auto" : "none"));
  const value = useMemo(() => ({ index, d }), [index, d]);

  return (
    <SlideContext.Provider value={value}>
      <motion.div
        id={id}
        data-depth-slide={index}
        style={{ transform, opacity, visibility, pointerEvents }}
        className={cn(
          "absolute inset-0 will-change-transform",
          dark ? "text-on-ink" : "text-foreground"
        )}
      >
        <div
          className={cn(
            "container-core829 flex h-full w-full flex-col items-center justify-center gap-[clamp(1rem,3.8svh,3.5rem)] pb-[clamp(1.5rem,4svh,2.5rem)] pt-[clamp(4.75rem,10.5svh,5.75rem)]",
            className
          )}
        >
          {children}
        </div>
      </motion.div>
    </SlideContext.Provider>
  );
}

/* ───────────────────────────── Item ───────────────────────────── */

interface DepthItemProps {
  children: ReactNode;
  className?: string;
  /** Direzione di provenienza/uscita (x,y ∈ [-1,1]); vedi radial(). */
  dir?: [number, number];
  /** Quanto "in fondo" parte l'elemento (moltiplicatore). */
  depth?: number;
  /** Ritardo relativo (0-3): sfalsa l'ingresso dei vari elementi. */
  delay?: number;
  /** Rotazione massima (gradi) durante il volo. */
  rotate?: number;
  as?: "div" | "li" | "article" | "a";
  href?: string;
  [key: string]: unknown;
}

/**
 * Elemento di una slide che vola dai bordi verso la sua posizione (e fuori
 * dai lati quando la camera lo supera). La profondità è simulata con scala e
 * traslazione 2D: robusto anche dentro piani con opacity (che appiattiscono il 3D).
 */
export function DepthItem({
  children,
  className,
  dir = [0, 0],
  depth = 1,
  delay = 0,
  rotate = 0,
  as = "div",
  ...rest
}: DepthItemProps) {
  const stage = useStage();
  const slide = useContext(SlideContext);
  const d = slide?.d;
  const fallback = useMotionValue(0);

  const transform = useTransform(d ?? fallback, (v) => {
    const a = Math.abs(v);
    const s = smooth(clamp01((a - 0.1 - delay * 0.07) / 0.8));
    if (s === 0) return "translate(0px, 0px) scale(1) rotate(0deg)";
    const approaching = v > 0;
    const { w, h } = stage.dimsRef.current;
    const k = approaching ? 1 : 1.35;
    const x = dir[0] * w * 0.42 * s * k;
    const y = dir[1] * h * 0.36 * s * k;
    const z = approaching ? -420 * depth * s : 260 * depth * s;
    const sc = PERSPECTIVE / (PERSPECTIVE - z);
    return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(
      3
    )}) rotate(${(rotate * s).toFixed(2)}deg)`;
  });

  const Comp = motion[as] as typeof motion.div;
  if (stage.mode === "flat" || !slide) {
    const Plain = as as "div";
    return (
      <Plain className={className} {...(rest as object)}>
        {children}
      </Plain>
    );
  }
  return (
    <Comp style={{ transform }} className={cn("will-change-transform", className)} {...(rest as object)}>
      {children}
    </Comp>
  );
}

/* ───────────────────────────── Stage ───────────────────────────── */

interface DepthStageProps {
  children: ReactNode;
  /** Etichette (una per slide) per i punti di navigazione. */
  labels: string[];
  className?: string;
}

export default function DepthStage({ children, labels, className }: DepthStageProps) {
  const slides = Children.toArray(children).filter(isValidElement) as ReactElement<DepthSlideProps>[];
  const count = slides.length;
  const { mode, dimsRef } = useStageMode();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const rawCamera = useTransform(scrollYProgress, (p) => stepCamera(p, count));
  const springCamera = useSpring(rawCamera, { stiffness: 140, damping: 28, mass: 0.35, restDelta: 0.0005 });
  const flatCamera = useMotionValue(0);
  const camera = mode === "tunnel" ? springCamera : flatCamera;

  const value = useMemo<StageValue>(
    () => ({ mode, camera, dimsRef, count }),
    [mode, camera, dimsRef, count]
  );

  return (
    <StageContext.Provider value={value}>
      {mode === "flat" ? (
        <div id="tunnel-flat" className={className}>
          {slides.map((s, i) => cloneElement(s, { index: i, key: i }))}
        </div>
      ) : (
        <section
          ref={sectionRef}
          data-depth-stage
          data-depth-count={count}
          className={cn("relative", className)}
          style={{ height: `calc(100svh + ${(count - 1) * SEG}svh)` }}
        >
          <Stage camera={camera} count={count} labels={labels} sectionRef={sectionRef}>
            {slides.map((s, i) => cloneElement(s, { index: i, key: i }))}
          </Stage>
        </section>
      )}
    </StageContext.Provider>
  );
}

function Stage({
  camera,
  count,
  labels,
  sectionRef,
  children,
}: {
  camera: MotionValue<number>;
  count: number;
  labels: string[];
  sectionRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const bg = useTransform(camera, [0, 0.55], ["#0b0b0c", "#ffffff"]);
  const noiseOpacity = useTransform(camera, [0, 0.5], [1, 0]);
  const dotsOpacity = useTransform(camera, [0.3, 0.9], [0, 0.55]);
  const [noisePaused, setNoisePaused] = useState(false);
  const [active, setActive] = useState(0);
  useMotionValueEvent(camera, "change", (c) => {
    setNoisePaused(c > 0.75);
    setActive(Math.round(c));
  });

  // Look-around con il puntatore (solo dispositivi con mouse)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-1, 1], [-1.6, 1.6]), { stiffness: 50, damping: 20 });
  const rotX = useSpring(useTransform(py, [-1, 1], [1.2, -1.2]), { stiffness: 50, damping: 20 });
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2);
      py.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  return (
    <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
      <motion.div aria-hidden className="absolute inset-0" style={{ backgroundColor: bg }} />
      <motion.div style={{ opacity: noiseOpacity }} className="absolute inset-0">
        <NeuralNoise paused={noisePaused} />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ opacity: dotsOpacity }}
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_55%,transparent_100%)]"
      />

      <div
        className="absolute inset-0"
        style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", rotateX: rotX, rotateY: rotY }}
        >
          <TunnelRings camera={camera} />
          {children}
        </motion.div>
      </div>

      <StageNav labels={labels} active={active} count={count} sectionRef={sectionRef} />
    </div>
  );
}

/** Anelli decorativi che scorrono verso la camera: danno la sensazione di corridoio. */
function TunnelRings({ camera }: { camera: MotionValue<number> }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Ring key={k} k={k} camera={camera} />
      ))}
    </>
  );
}

const RING_SPAN = 4200;
function Ring({ k, camera }: { k: number; camera: MotionValue<number> }) {
  const z = useTransform(camera, (c) => {
    const raw = (k * 700 - c * GAP * 0.85) % RING_SPAN;
    return ((raw + RING_SPAN) % RING_SPAN) - 3200; // −3200 … +1000
  });
  const transform = useTransform(z, (v) => `translate3d(-50%, -50%, ${v}px)`);
  const opacity = useTransform(z, (v) => {
    if (v < -2600) return clamp01((v + 3200) / 600) * 0.7;
    if (v > 500) return clamp01((1000 - v) / 500) * 0.7;
    return 0.7;
  });
  return (
    <motion.div
      aria-hidden
      style={{ transform, opacity }}
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] rounded-full border",
        k % 2 === 0 ? "border-accent/20" : "border-dashed border-foreground/10"
      )}
    />
  );
}

function StageNav({
  labels,
  active,
  count,
  sectionRef,
}: {
  labels: string[];
  active: number;
  count: number;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <nav
      aria-label="Sezioni"
      className="absolute right-1 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end lg:flex xl:right-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={labels[i] ?? `${i + 1}`}
          aria-current={i === active}
          title={labels[i]}
          onClick={() => sectionRef.current && scrollToSlide(sectionRef.current, i)}
          className="group flex h-11 w-11 items-center justify-end pr-1.5"
        >
          <span
            className={cn(
              "block h-[3px] rounded-full bg-white mix-blend-difference transition-all duration-500",
              i === active ? "w-6 opacity-100" : "w-2.5 opacity-50 group-hover:w-4 group-hover:opacity-90"
            )}
          />
        </button>
      ))}
    </nav>
  );
}
