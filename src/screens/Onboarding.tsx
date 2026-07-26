import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { signInWithGoogle, configured } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white px-6 pb-8 pt-14">
      <div className="flex justify-center">
        <Logo size={34} />
      </div>

      <div className="mt-10 text-center">
        <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
          Trade what you have
          <br />
          for what you need.
        </h1>
        <p className="mt-3 font-medium text-brand-600">
          No money. Just exchange.
        </p>
      </div>

      <div className="my-8 flex flex-1 items-center justify-center">
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
      </div>

      <div className="flex justify-center gap-1.5 pb-6">
        <span className="h-1.5 w-5 rounded-full bg-brand-500" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      </div>

      <div className="space-y-3">
        <Button fullWidth onClick={() => navigate(configured ? "/register" : "/setup")}>
          Get Started
        </Button>
        <Button
          fullWidth
          variant="outline"
          onClick={() => {
            if (!configured) {
              navigate("/setup");
              return;
            }
            void signInWithGoogle();
          }}
          leftIcon={<GoogleIcon />}
        >
          Continue with Google
        </Button>
        <p className="pt-2 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
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

function FloatingItem({ className, emoji }: { className: string; emoji: string }) {
  return (
    <div
      className={`absolute flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-card ring-1 ring-black/5 ${className}`}
    >
      {emoji}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
