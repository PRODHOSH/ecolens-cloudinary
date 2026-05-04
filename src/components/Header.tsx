"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ec-auth-open", handler);
    return () => window.removeEventListener("ec-auth-open", handler);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const handlePrimary = () => {
    if (userEmail) {
      router.push("/scan");
      return;
    }
    setOpen(true);
  };

  return (
    <header className="relative z-20 w-full border-b border-ec-hairline bg-ec-canvas">
      <div className="ec-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ec-surface-card text-ec-ink">
            <span className="text-sm font-semibold">E</span>
          </div>
          <span className="ec-display text-lg font-semibold text-ec-ink">
            EcoLens
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {[
            { label: "Product", href: "#product" },
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "Docs", href: "#docs" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-ec-body transition hover:text-ec-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {userEmail ? (
            <button
              onClick={handleSignOut}
              className="ec-button-secondary"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="ec-button-secondary"
            >
              Sign In
            </button>
          )}
          <button
            onClick={handlePrimary}
            className="ec-button-primary"
          >
            Get Started
          </button>
        </div>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
