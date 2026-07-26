import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import DesktopTopNav from "./DesktopTopNav";
import { useIsDesktop } from "../hooks/useMediaQuery";

interface AppShellProps {
  children: ReactNode;
}

const NO_DESKTOP_NAV = new Set([
  "/",
  "/login",
  "/register",
  "/setup",
  "/verify-email",
  "/forgot-password",
  "/auth/callback",
  "/complete-profile",
  "/privacy",
  "/terms",
]);

/**
 * Full-viewport shell.
 * - Mobile / PWA: edge-to-edge app
 * - Desktop browser: full-width marketplace (Carousell-style), not a phone frame
 */
export default function AppShell({ children }: AppShellProps) {
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();
  const showDesktopNav = isDesktop && !NO_DESKTOP_NAV.has(pathname);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50">
      {showDesktopNav && <DesktopTopNav />}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:bg-gray-50">
        {children}
      </div>
    </div>
  );
}
