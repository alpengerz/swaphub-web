import { useEffect, useState, type ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

function useStandaloneDisplay() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const iosStandalone =
      "standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

    const sync = () => setStandalone(mq.matches || iosStandalone);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return standalone;
}

/**
 * Responsive shell:
 * - Phone / tablet / installed PWA → full viewport (native-app feel)
 * - Desktop browser → centered app column (no fake phone bezel)
 */
export default function AppShell({ children }: AppShellProps) {
  const standalone = useStandaloneDisplay();

  return (
    <div
      className={`min-h-full w-full ${
        standalone ? "bg-white" : "bg-[#eef1f4] md:flex md:justify-center"
      }`}
    >
      <div
        className={[
          "relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-white",
          // Desktop browser only: readable column, website-style (not a phone mock)
          !standalone
            ? "md:max-w-[480px] md:shadow-[0_0_0_1px_rgba(16,24,40,0.06),0_20px_50px_-20px_rgba(16,24,40,0.25)]"
            : "",
        ].join(" ")}
      >
        <div className="relative z-10 flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
          {children}
        </div>
      </div>
    </div>
  );
}
