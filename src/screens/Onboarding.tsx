import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Handshake, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";

const SLIDES = [
  {
    title: (
      <>
        Trade what you have
        <br />
        for what you need.
      </>
    ),
    subtitle: "No money. Just exchange.",
    visual: "hero" as const,
  },
  {
    title: (
      <>
        Browse nearby
        <br />
        listings to swap.
      </>
    ),
    subtitle: "Find items people in your city want to trade.",
    visual: "browse" as const,
  },
  {
    title: (
      <>
        Chat, agree,
        <br />
        and meet up safely.
      </>
    ),
    subtitle: "Make an offer, negotiate in chat, then swap in person.",
    visual: "trade" as const,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const last = index >= SLIDES.length - 1;
  const slide = SLIDES[index];

  function goNext() {
    if (last) {
      navigate(configured ? "/register" : "/setup");
      return;
    }
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (dx < -40) setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
    if (dx > 40) setIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="flex h-full flex-col bg-white md:flex-row">
      {/* Desktop brand panel */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-12 text-white md:flex">
        <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-black/10" />
        <div className="relative max-w-md">
          <Logo size={36} light />
          <h2 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight">
            The marketplace for fair swaps
          </h2>
          <p className="mt-4 text-lg text-white/90">
            List what you have. Find what you need. Trade without cash — like
            Carousell, built for barter.
          </p>
        </div>
      </div>

      {/* Mobile + desktop content column */}
      <div className="flex h-full w-full flex-col px-6 pb-8 pt-14 md:max-w-xl md:justify-center md:px-12 md:pt-10">
        <div className="flex items-center justify-between md:hidden">
          <Logo size={28} />
          {!last && (
            <button
              type="button"
              onClick={() => navigate(configured ? "/register" : "/setup")}
              className="text-sm font-semibold text-gray-500"
            >
              Skip
            </button>
          )}
        </div>

        <div className="mb-6 hidden items-center justify-between md:flex">
          <p className="text-sm font-semibold text-gray-500">Welcome</p>
          {!last && (
            <button
              type="button"
              onClick={() => navigate(configured ? "/register" : "/setup")}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800"
            >
              Skip
            </button>
          )}
        </div>

        <div
          className="flex flex-1 flex-col md:flex-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="mt-8 text-center md:mt-0 md:text-left">
            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
              {slide.title}
            </h1>
            <p className="mt-3 font-medium text-brand-600">{slide.subtitle}</p>
          </div>

          <div className="my-6 flex flex-1 items-center justify-center md:my-10 md:flex-none">
            <SlideVisual kind={slide.visual} />
          </div>

          <div className="flex items-center justify-center gap-2 pb-5 md:justify-start">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-brand-500" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {!last ? (
            <Button
              fullWidth
              type="button"
              onClick={goNext}
              leftIcon={<ChevronRight size={18} />}
            >
              Next
            </Button>
          ) : (
            <Button
              fullWidth
              type="button"
              onClick={() => navigate(configured ? "/register" : "/setup")}
            >
              Get Started
            </Button>
          )}
          <p className="pt-1 text-center text-sm text-gray-500 md:text-left">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate(configured ? "/login" : "/setup")}
              className="font-semibold text-brand-600"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SlideVisual({ kind }: { kind: "hero" | "browse" | "trade" }) {
  if (kind === "browse") {
    return (
      <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-brand-50">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <Search size={48} className="text-white" strokeWidth={2} />
        </div>
      </div>
    );
  }
  if (kind === "trade") {
    return (
      <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-brand-50">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <Handshake size={48} className="text-white" strokeWidth={2} />
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-brand-50">
      <div className="absolute h-40 w-40 rounded-full bg-brand-100" />
      <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-500 shadow-lg shadow-brand-500/30">
        <RefreshCw size={54} className="text-white" strokeWidth={2} />
      </div>
      <FloatingItem className="left-2 top-6" emoji="🚲" />
      <FloatingItem className="right-1 top-10" emoji="🎸" />
      <FloatingItem className="bottom-6 left-8" emoji="🎧" />
      <FloatingItem className="bottom-10 right-3" emoji="📷" />
    </div>
  );
}

function FloatingItem({ className, emoji }: { className: string; emoji: string }) {
  return (
    <div
      className={`absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-card ring-1 ring-black/5 ${className}`}
    >
      {emoji}
    </div>
  );
}
