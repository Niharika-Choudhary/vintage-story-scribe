import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center vintage-card p-10">
        <h1 className="text-4xl font-display mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-5">Oops! Page not found</p>
        <a href="/" className="text-primary underline underline-offset-4 hover:no-underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
