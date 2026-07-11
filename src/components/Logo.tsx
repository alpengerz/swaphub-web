interface LogoProps {
  size?: number;
  showText?: boolean;
  light?: boolean;
}

export default function Logo({ size = 28, showText = true, light = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#1b9a57" />
        <path
          d="M11 12.5a5 5 0 0 1 8.5-2.2l1.2 1.2M21 12.5V8.8m0 3.7h-3.7"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 19.5a5 5 0 0 1-8.5 2.2L11.3 20.5M11 19.5v3.7m0-3.7h3.7"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          className={`text-xl font-extrabold tracking-tight ${
            light ? "text-white" : "text-gray-900"
          }`}
        >
          Swap<span className="text-brand-500">Hub</span>
        </span>
      )}
    </div>
  );
}
