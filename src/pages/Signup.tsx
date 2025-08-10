import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Create Account | StoryForge";
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock create account
      const token = btoa(JSON.stringify({ email, t: Date.now() }));
      localStorage.setItem("sf_token", token);
      toast({ title: "Account created", description: "Welcome to StoryForge!" });
      navigate("/", { replace: true });
    } catch (err) {
      toast({ title: "Signup failed", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="vintage-card w-full max-w-md p-8 relative paper-texture">
        <header className="mb-6 text-center">
          <h1 className="font-display text-3xl mb-2">Join StoryForge</h1>
          <p className="text-muted-foreground">Create your account to begin writing</p>
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
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary underline-offset-2 hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
