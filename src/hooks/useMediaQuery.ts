import { useEffect, useState } from "react";

/** Subscribe to a CSS media query (e.g. `(min-width: 768px)`). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** Tailwind `md` breakpoint — desktop / laptop browser layout. */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)");
}
