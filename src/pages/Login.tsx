import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Login | StoryForge";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock auth token
      const token = btoa(JSON.stringify({ email, t: Date.now() }));
      localStorage.setItem("sf_token", token);
      toast({ title: "Welcome back", description: "You are now signed in." });
      navigate("/", { replace: true });
    } catch (err) {
      toast({ title: "Login failed", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="vintage-card w-full max-w-md p-8 relative paper-texture">
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl mb-2">StoryForge</h1>
          <p className="text-muted-foreground">Sign in to craft your next book</p>
        </header>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here? <Link to="/signup" className="text-primary underline-offset-2 hover:underline">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
