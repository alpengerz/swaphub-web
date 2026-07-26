import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * Centers the app in a phone-sized viewport. On large screens it renders a
 * device frame so the mobile layout looks intentional; on small screens the
 * app fills the whole viewport like a native app.
 *
 * Important: keep interactive header controls inset from the rounded corners —
 * overflow + border-radius otherwise eats top-right taps (settings, bell).
 */
export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-full w-full sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[880px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border-[10px] sm:border-gray-900 sm:shadow-phone">
        {/* Notch (desktop only) — never intercepts clicks */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-gray-900 sm:block" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)] sm:px-1 sm:pt-3">
          {children}
        </div>
      </div>
    </div>
  );
}
