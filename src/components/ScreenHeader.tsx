import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScreenHeaderProps {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

export default function ScreenHeader({
  title,
  right,
  onBack,
  transparent,
}: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <header
      className={`flex items-center gap-3 px-4 py-3 ${
        transparent ? "" : "border-b border-gray-100 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm ring-1 ring-black/5 transition active:scale-95"
        aria-label="Go back"
      >
        <ChevronLeft size={22} />
      </button>
      {title && (
        <h1 className="flex-1 text-center text-base font-semibold text-gray-900">
          {title}
        </h1>
      )}
      {title && <div className="flex items-center gap-2">{right}</div>}
      {!title && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </header>
  );
}
