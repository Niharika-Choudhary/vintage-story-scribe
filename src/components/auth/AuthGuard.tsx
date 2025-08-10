import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    const authed = !!token;
    setIsAuthed(authed);
    setLoading(false);
    if (!authed) navigate("/login", { replace: true });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "sf_token") {
        const nowAuthed = !!e.newValue;
        setIsAuthed(nowAuthed);
        if (!nowAuthed) navigate("/login", { replace: true });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="vintage-card p-8 animate-fade-in">
          <p className="font-serif text-lg">Preparing your writing desk…</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) return null;

  return <>{children}</>;
};
