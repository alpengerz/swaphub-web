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
      <header className="flex items-center gap-2 bg-white px-2 pb-3 pt-4 md:border-b md:border-gray-100">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-2 md:px-0">
          <button
            type="button"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="rounded-xl p-2 text-gray-700 transition active:bg-gray-100 hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 md:text-xl">{title}</h1>
        </div>
      </header>
      <div className="no-scrollbar mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {children}
      </div>
      {footer ? (
        <div className="mx-auto w-full max-w-3xl">{footer}</div>
      ) : null}
    </div>
  );
}
