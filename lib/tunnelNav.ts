/**
 * Dove sta la barra di navigazione. Nella home a tunnel la barra è un elemento `glass` dentro la scena del tunnel
 * (così rifrange lo stesso sfondo animato che si vede dietro, come le card); fuori dal tunnel (altre pagine e fine
 * della home) ha una scena propria. Questo piccolo store collega DepthStage (che offre lo "slot") e Navbar.
 */
type Listener = () => void;

let slot: HTMLElement | null = null;
let active = false;
let past = false;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

export const tunnelNav = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Lo slot (dentro la scena del tunnel) se la scena sta sotto la barra, altrimenti null. */
  getSnapshot(): HTMLElement | null {
    return active ? slot : null;
  },
  getServerSnapshot(): HTMLElement | null {
    return null;
  },
  setSlot(el: HTMLElement | null) {
    if (slot === el) return;
    slot = el;
    emit();
  },
  /** true quando il tunnel è già scorso sopra la barra (sotto c'è la parte chiara della home). */
  getPast(): boolean {
    return past;
  },
  getServerPast(): boolean {
    return false;
  },
  setPast(next: boolean) {
    if (past === next) return;
    past = next;
    emit();
  },
  setActive(next: boolean) {
    if (active === next) return;
    active = next;
    emit();
  },
};
