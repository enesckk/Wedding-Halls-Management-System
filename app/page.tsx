"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Lock, Mail } from "lucide-react";
import { login } from "@/lib/api/auth";
import { TOKEN_KEY } from "@/lib/api/client";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success || !res.token) {
        setError(res.message ?? "Giriş başarısız.");
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, res.token);
      }
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Giriş başarısız.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-secondary to-secondary" />

      <Card className="relative z-10 w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-4 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Nikah Salonları Yönetim Sistemi
            </h1>
            <p className="text-sm text-muted-foreground">
              Devam etmek için giriş yapın
            </p>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@belediye.gov.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo: viewer@nikahsalon.local / Viewer1! — editor@nikahsalon.local / Editor1!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
