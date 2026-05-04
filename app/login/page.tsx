"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = (e.currentTarget.elements.namedItem("code") as HTMLInputElement).value;
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="font-chinese text-7xl font-bold">学</div>
          <h1 className="text-2xl font-bold">Chinese Practice</h1>
          <p className="text-muted-foreground">Flashcards & writing practice for Chinese vocabulary</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{sent ? "Check your email" : "Sign in"}</CardTitle>
            <CardDescription>
              {sent
                ? `We sent a magic code to ${email}. Enter it below to sign in.`
                : "Enter your email to get a magic link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Send Magic Link
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Magic code sent to {email}
                </div>
                <Input
                  name="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  autoFocus
                  maxLength={8}
                  className="text-center text-lg tracking-widest"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setSent(false); setError(null); }}
                >
                  Use a different email
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
