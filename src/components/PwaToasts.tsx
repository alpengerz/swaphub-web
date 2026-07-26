import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaToasts() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() {
      /* registered */
    },
  });

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline && !needRefresh) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-6">
      {offline && (
        <div className="pointer-events-auto rounded-xl bg-gray-900 px-4 py-2.5 text-center text-xs font-medium text-white shadow-lg">
          You&apos;re offline. Some actions won&apos;t work until you reconnect.
        </div>
      )}
      {!offline && needRefresh && (
        <div className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg">
          <span className="flex-1">A new SwapHub version is ready.</span>
          <button
            type="button"
            className="rounded-lg bg-white/20 px-2 py-1 font-semibold"
            onClick={() => void updateServiceWorker(true)}
          >
            Update
          </button>
          <button
            type="button"
            className="rounded-lg px-1 font-semibold opacity-80"
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
