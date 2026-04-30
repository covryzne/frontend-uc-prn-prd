import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);

    if (ok) navigate("/dashboard");
    else setError("Email atau password tidak valid.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm animate-fade-in shadow-lg">
        <CardHeader className="text-center space-y-3 pb-2">
          <img src="/favicon.ico" alt="Logo" className="mx-auto h-14 w-14" />
          <div>
            <h1 className="text-xl font-bold">Pengawasan Ruang Digital</h1>
            <p className="text-sm text-muted-foreground">Use Case Pornografi</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="email"
                placeholder="Username"
                value={email}
                disabled={submitting}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                disabled={submitting}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Masuk..." : "Masuk"}
            </Button>
            {/* <p className="text-xs text-center text-muted-foreground">
              Login menggunakan akun user yang terdaftar di database backend
            </p> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
