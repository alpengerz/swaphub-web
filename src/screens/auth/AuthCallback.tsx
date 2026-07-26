import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

/** Handles Google OAuth redirect back into the SPA. */
export default function AuthCallback() {
  const { user, profileComplete, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!configured) {
      navigate("/setup", { replace: true });
      return;
    }
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    navigate(profileComplete ? "/home" : "/complete-profile", { replace: true });
  }, [configured, loading, user, profileComplete, navigate]);

  return (
    <div className="flex h-full items-center justify-center bg-white text-sm text-gray-500">
      Finishing sign-in…
    </div>
  );
}
