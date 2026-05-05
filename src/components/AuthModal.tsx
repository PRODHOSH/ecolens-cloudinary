"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  const supabaseReady = Boolean(supabase);

  const handleOAuth = async (provider: "google" | "github") => {
    if (!supabase) return;
    setLoading(true);
    setMessage(null);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  const handleEmailAuth = async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage(null);
    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });
    const { error } = await action;
    if (error) {
      setMessage(error.message);
    } else if (mode === "signin") {
      onClose();
      window.location.href = "/dashboard";
    } else {
      setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-ec-hairline bg-ec-canvas p-6 text-ec-ink">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ec-muted">
              Welcome to EcoLens
            </p>
            <h2 className="ec-display mt-2 text-2xl font-semibold">
              Optimize your media. Reduce your carbon footprint.
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-ec-hairline px-3 py-1 text-xs text-ec-muted transition hover:text-ec-ink"
          >
            Close
          </button>
        </div>

        {!supabaseReady ? (
          <div className="mt-6 rounded-xl border border-ec-error bg-ec-surface-soft p-4 text-sm text-ec-ink">
            Supabase environment variables are not configured. Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
            enable authentication.
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!supabaseReady || loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-ec-hairline bg-ec-canvas px-4 py-3 text-sm font-semibold text-ec-ink transition hover:border-ec-ink/30"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.8 2.1-2.7 3.5-5.5 3.5a6.1 6.1 0 0 1 0-12.2c1.6 0 3 .6 4 1.6l2.7-2.7A9.7 9.7 0 0 0 12 2.5C6.9 2.5 2.8 6.6 2.8 11.7S6.9 20.9 12 20.9c4.6 0 8.9-3.3 8.9-9.2 0-.6-.1-1.1-.2-1.5H12z"
              />
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth("github")}
            disabled={!supabaseReady || loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-ec-hairline bg-ec-canvas px-4 py-3 text-sm font-semibold text-ec-ink transition hover:border-ec-ink/30"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path
                fill="#111111"
                d="M12 2.5a9.5 9.5 0 0 0-3 18.6c.5.1.7-.2.7-.5v-2c-3 .6-3.7-1.3-3.7-1.3-.5-1.2-1.1-1.6-1.1-1.6-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.3-2.4-.3-4.9-1.2-4.9-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 .9a10 10 0 0 1 5.5 0c2.1-1.2 3-.9 3-.9.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.5 5.1-4.9 5.4.4.3.8.9.8 2v3c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5z"
              />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-ec-muted">
          <span className="h-px flex-1 bg-ec-hairline" />
          or
          <span className="h-px flex-1 bg-ec-hairline" />
        </div>

        <div className="mt-6 grid gap-4">
          <label className="text-xs uppercase tracking-[0.2em] text-ec-muted">
            Email
          </label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className="ec-input"
            placeholder="you@company.com"
          />
          <label className="text-xs uppercase tracking-[0.2em] text-ec-muted">
            Password
          </label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            className="ec-input"
            placeholder="Minimum 8 characters"
          />
          <button
            onClick={handleEmailAuth}
            disabled={!supabaseReady || loading}
            className="ec-button-primary"
          >
            {mode === "signin" ? "Sign in with email" : "Create account"}
          </button>
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted"
          >
            {mode === "signin" ? "Create account" : "Sign in instead"}
          </button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-ec-success">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
