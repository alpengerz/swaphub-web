import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Button from "../components/Button";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { configured, loading, user, profileComplete, profileError, refreshProfile, signOut } =
    useAuth();
  const location = useLocation();

  if (!configured) {
    return <Navigate to="/setup" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Require confirmed email when Auth has confirmation enabled
  if (
    !user.email_confirmed_at &&
    location.pathname !== "/verify-email" &&
    location.pathname !== "/auth/callback"
  ) {
    return (
      <Navigate
        to="/verify-email"
        replace
        state={{ email: user.email ?? "" }}
      />
    );
  }

  if (profileError && !profileComplete) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-lg font-bold text-gray-900">Couldn’t load profile</h1>
        <p className="mt-2 text-sm text-gray-500">{profileError}</p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Button fullWidth type="button" onClick={() => void refreshProfile()}>
            Retry
          </Button>
          <Button
            fullWidth
            type="button"
            variant="outline"
            onClick={() => void signOut().then(() => (window.location.href = "/login"))}
          >
            Log out
          </Button>
        </div>
      </div>
    );
  }

  if (!profileComplete && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { configured, loading, user, profileComplete } = useAuth();

  if (!configured) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (user && !user.email_confirmed_at) {
    return (
      <Navigate
        to="/verify-email"
        replace
        state={{ email: user.email ?? "" }}
      />
    );
  }
  if (user && profileComplete) {
    return <Navigate to="/home" replace />;
  }
  if (user && !profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
