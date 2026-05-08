"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthModal from "@/components/AuthModal";

type UserMeta = {
  email: string;
  name: string;
  avatarUrl: string | null;
};

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserMeta | null>(null);
  const [dropOpen, setDropOpen] = useState(false);

  const extractUser = (session: { user: { email?: string | null; user_metadata?: Record<string, unknown>; identities?: Array<{ provider: string; identity_data?: Record<string, unknown> }> } } | null): UserMeta | null => {
    if (!session) return null;
    const u = session.user;
    const email = u.email ?? "";
    const meta = u.user_metadata ?? {};

    // Pull avatar from OAuth providers
    const avatarUrl =
      (meta.avatar_url as string | null) ??
      (meta.picture as string | null) ??
      null;

    // Pull display name
    const name =
      (meta.full_name as string | null) ??
      (meta.name as string | null) ??
      (meta.user_name as string | null) ??
      email.split("@")[0] ??
      "User";

    return { email, name, avatarUrl };
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(extractUser(data.session));
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const extracted = extractUser(session);
      setUser(extracted);
      // Redirect to dashboard after sign-in
      if (event === "SIGNED_IN" && extracted) {
        router.push("/dashboard");
      }
    });

    return () => { data.subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ec-auth-open", handler);
    return () => window.removeEventListener("ec-auth-open", handler);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  const headerClass = "border-ec-hairline bg-ec-canvas";
  const logoBoxClass = "bg-ec-ink text-white";
  const brandTextClass = "text-ec-ink";
  const navLinkClass = "text-ec-body hover:text-ec-ink";
  const avatarButtonClass = "border-ec-hairline bg-ec-canvas hover:bg-ec-surface-soft";
  const dropdownClass = "border-ec-hairline bg-ec-canvas";
  const dropdownItemClass = "text-ec-body hover:bg-ec-surface-soft hover:text-ec-ink";
  const dividerClass = "bg-ec-hairline";
  const signInClass = "ec-button-secondary";
  const getStartedClass = "ec-button-primary";

  return (
    <header className={`relative z-20 w-full border-b ${headerClass}`}>
      <div className="ec-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="EcoLens Logo" 
            className="h-8 w-8 rounded-lg object-contain" 
          />
          <span className={`ec-display text-xl font-bold ${brandTextClass}`}>EcoLens</span>
        </Link>




        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/docs" className={`text-sm font-medium transition ${navLinkClass}`}>Docs</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={`text-sm font-medium transition ${navLinkClass}`}>Dashboard</Link>
            </>
          ) : (
            <>
              <a href="#product" className={`text-sm font-medium transition ${navLinkClass}`}>Product</a>
              <a href="#features" className={`text-sm font-medium transition ${navLinkClass}`}>Features</a>
              <a href="#sdk" className={`text-sm font-medium transition ${navLinkClass}`}>SDK</a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            /* Avatar + dropdown */
            <div className="relative">
              <button
                id="header-avatar-btn"
                onClick={() => setDropOpen((v) => !v)}
                className={`flex items-center gap-2.5 rounded-full border px-2 py-1.5 transition ${avatarButtonClass}`}
                aria-expanded={dropOpen}
                aria-haspopup="true"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold bg-ec-ink text-white">
                    {initial}
                  </div>
                )}
                <span className="hidden max-w-30 truncate text-sm font-medium text-ec-ink md:block">
                  {user.name}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-muted" aria-hidden="true">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {dropOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} aria-hidden="true"/>
                  {/* Menu */}
                    <div className={`absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border p-1.5 shadow-lg ${dropdownClass}`}>
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold truncate text-ec-ink">{user.name}</p>
                      <p className="text-[11px] truncate text-ec-muted">{user.email}</p>
                    </div>
                    <div className={`my-1 h-px ${dividerClass}`}/>
                    <Link href="/dashboard" onClick={() => setDropOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${dropdownItemClass}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>
                    <Link href="/docs" onClick={() => setDropOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${dropdownItemClass}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      Documentation
                    </Link>
                    <div className={`my-1 h-px ${dividerClass}`}/>
                    <button
                      id="header-signout-btn"
                      onClick={() => { setDropOpen(false); handleSignOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ec-error transition hover:bg-red-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setOpen(true)} className={signInClass}>Sign In</button>
              <button onClick={() => setOpen(true)} className={getStartedClass}>Get Started</button>
            </>
          )}
        </div>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
