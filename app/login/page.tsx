"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Zap, Mail } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    await signIn("email", { email, callbackUrl });
    setEmailSent(true);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 mx-auto">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to TechPulse</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to save articles and generate blog posts.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          {emailSent ? (
            <div className="text-center py-4 space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <Mail className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-foreground">Check your email!</p>
              <p className="text-xs text-muted-foreground">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-sm font-semibold transition-colors"
              >
                <Mail className="h-4 w-4" />
                Continue with Email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll email you a magic link — no password needed.
        </p>
      </div>
    </div>
  );
}
