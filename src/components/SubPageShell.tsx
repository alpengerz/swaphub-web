import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function SubPageShell({
  title,
  children,
  footer,
  backTo,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Prefer an explicit parent route over browser history. */
  backTo?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <header className="flex items-center gap-2 bg-white px-2 pb-3 pt-4">
        <button
          type="button"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="rounded-xl p-2 text-gray-700 transition active:bg-gray-100"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </header>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {children}
      </div>
      {footer}
    </div>
  );
}
