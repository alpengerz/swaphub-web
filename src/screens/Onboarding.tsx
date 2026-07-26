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
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-14">
      <div className="flex items-center justify-between">
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

      <div
        className="flex flex-1 flex-col"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
            {slide.title}
          </h1>
          <p className="mt-3 font-medium text-brand-600">{slide.subtitle}</p>
        </div>

        <div className="my-6 flex flex-1 items-center justify-center">
          <SlideVisual kind={slide.visual} />
        </div>

        <div className="flex items-center justify-center gap-2 pb-5">
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
        <p className="pt-1 text-center text-sm text-gray-500">
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
