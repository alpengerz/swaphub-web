import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Full-screen photo viewer for listing images (PWA-friendly).
 */
export default function PhotoLightbox({
  images,
  index,
  alt,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number;
  alt?: string;
  onClose: () => void;
  onIndexChange?: (i: number) => void;
}) {
  const [i, setI] = useState(index);
  const touchX = useRef<number | null>(null);

  useEffect(() => setI(index), [index]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // go closes over images.length / onIndexChange; rebind when those change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, onClose, onIndexChange]);

  function go(delta: number) {
    if (images.length < 2) return;
    setI((cur) => {
      const next = (cur + delta + images.length) % images.length;
      onIndexChange?.(next);
      return next;
    });
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <span className="text-sm font-medium text-white/90">
          {images.length > 0 ? `${i + 1} / ${images.length}` : ""}
        </span>
        <span className="w-11" aria-hidden />
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onClick={onClose}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const x = e.changedTouches[0]?.clientX ?? touchX.current;
          const dx = x - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 48) return;
          go(dx < 0 ? 1 : -1);
        }}
      >
        <img
          src={images[i]}
          alt={alt ?? "Listing photo"}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => {
                setI(idx);
                onIndexChange?.(idx);
              }}
              className={`h-12 w-12 overflow-hidden rounded-lg ring-2 transition ${
                idx === i ? "ring-white" : "ring-transparent opacity-60"
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
