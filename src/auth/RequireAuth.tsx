import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { configured, loading, user, profileComplete } = useAuth();
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

  if (user && profileComplete) {
    return <Navigate to="/home" replace />;
  }
  if (user && !profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}
