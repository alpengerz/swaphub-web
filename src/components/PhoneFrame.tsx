import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * Centers the app in a phone-sized viewport. On large screens it renders a
 * device frame so the mobile layout looks intentional; on small screens the
 * app fills the whole viewport like a native app.
 */
export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="min-h-full w-full sm:flex sm:items-center sm:justify-center sm:py-8">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[880px] sm:max-h-[92vh] sm:rounded-[2.5rem] sm:border-[10px] sm:border-gray-900 sm:shadow-phone">
        {/* Notch (desktop only) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-gray-900 sm:block" />
        {children}
      </div>
    </div>
  );
}
