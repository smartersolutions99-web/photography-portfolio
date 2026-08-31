import { useEffect, useState } from "react";

/**
 * Koordinacija između intro overlay-a (CameraIntro) i sadržaja stranice.
 * Sadržaj (npr. ContactHero) čeka da intro „otkrije" stranicu (blic) pa tek onda
 * pušta svoje ulazne animacije — tako se elementi „pojavljuju" nakon škljoca.
 * Ako intro ne igra (već viđen u sesiji / reduced-motion), reveal se okine odmah.
 */
type Listener = () => void;

let revealed = false;
const listeners = new Set<Listener>();

export function revealIntro() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((l) => l());
  listeners.clear();
}

function subscribe(l: Listener): () => void {
  if (revealed) {
    l();
    return () => {};
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** True kada je stranica „otkrivena". Ima i sigurnosni tajmer da sadržaj nikad ne ostane skriven. */
export function useIntroReveal(fallbackMs = 5000): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    const unsub = subscribe(finish);
    const t = setTimeout(finish, fallbackMs);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [fallbackMs]);
  return ready;
}
