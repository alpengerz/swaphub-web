import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

const THRESHOLD = 72;
const MAX_PULL = 110;

/**
 * Pull-down-to-refresh for PWA / mobile.
 * - Swipe down at scroll top → refresh
 * - Swipe up → normal scroll only (no refresh)
 */
export default function PullToRefresh({
  onRefresh,
  children,
  className = "",
  disabled = false,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullRef = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const setPullBoth = useCallback((n: number) => {
    pullRef.current = n;
    setPull(n);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || disabled) return;

    const onStart = (e: TouchEvent) => {
      if (refreshing) return;
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0]?.clientY ?? 0;
        pulling.current = true;
      } else {
        pulling.current = false;
        setPullBoth(0);
      }
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current || refreshing) return;
      const y = e.touches[0]?.clientY ?? 0;
      const dy = y - startY.current;

      // Swipe up → cancel pull, let the list scroll normally
      if (dy <= 0) {
        pulling.current = false;
        setPullBoth(0);
        return;
      }

      // User scrolled away from top while gesturing
      if (el.scrollTop > 0) {
        pulling.current = false;
        setPullBoth(0);
        return;
      }

      const distance = Math.min(MAX_PULL, dy * 0.42);
      setPullBoth(distance);
      // Stop the browser/PWA from taking over the pull-down gesture
      if (distance > 8) e.preventDefault();
    };

    const onEnd = () => {
      if (!pulling.current) return;
      pulling.current = false;
      const distance = pullRef.current;

      if (distance >= THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPullBoth(52);
        void Promise.resolve(onRefresh())
          .catch(console.error)
          .finally(() => {
            setRefreshing(false);
            setPullBoth(0);
          });
      } else {
        setPullBoth(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [disabled, onRefresh, refreshing, setPullBoth]);

  const showIndicator = pull > 0 || refreshing;

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className}`}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-end justify-center overflow-hidden"
        style={{ height: Math.max(pull, refreshing ? 52 : 0) }}
        aria-hidden
      >
        {showIndicator && (
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-600 shadow ring-1 ring-black/5">
            <Loader2
              size={18}
              className={
                refreshing || pull >= THRESHOLD ? "animate-spin" : ""
              }
              style={
                !refreshing && pull < THRESHOLD
                  ? { transform: `rotate(${pull * 2.5}deg)` }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        style={{
          transform: pull > 0 ? `translateY(${pull}px)` : undefined,
          transition: pulling.current || refreshing ? undefined : "transform 160ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
