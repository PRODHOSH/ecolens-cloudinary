"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import type { ScanResult } from "@/lib/types";
import { formatBytes, formatPercent, formatMb } from "@/lib/format";

type WizardStep = "source" | "input" | "scanning" | "results" | "solutions";
type ScanType = "website" | "github";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth
  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Wizard State
  const [step, setStep] = useState<WizardStep>("source");
  const [scanType, setScanType] = useState<ScanType>("website");
  const [url, setUrl] = useState("");
  const [manualRepo, setManualRepo] = useState(""); // For website scans needing PR
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solutionType, setSolutionType] = useState<"sdk" | "pr" | "prompt" | null>(null);
  const [isPrCreating, setIsPrCreating] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  /* ── Auth gate ── */
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      setAuthed(Boolean(session));
      setAuthReady(true);
      if (session) {
        const meta = session.user.user_metadata ?? {};
        setUserName((meta.full_name ?? meta.name ?? meta.user_name ?? session.user.email?.split("@")[0] ?? "there") as string);
        setAvatarUrl((meta.avatar_url ?? meta.picture ?? null) as string | null);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(Boolean(session));
      if (session) {
        const meta = session.user.user_metadata ?? {};
        setUserName((meta.full_name ?? meta.name ?? meta.user_name ?? session.user.email?.split("@")[0] ?? "there") as string);
        setAvatarUrl((meta.avatar_url ?? meta.picture ?? null) as string | null);
      }
    });
    return () => { data.subscription.unsubscribe(); };
  }, []);

  /* ── Detect PR completion or pending PR ── */
  useEffect(() => {
    if (!authReady || !authed || !supabase) return;

    const checkPr = async () => {
      const isPrReady = searchParams.get("pr_ready") === "true";
      const savedResult = localStorage.getItem("ecolens_pending_scan");
      const savedRepo = localStorage.getItem("ecolens_target_repo");

      if (isPrReady && savedResult && supabase) {
        const parsedResult: ScanResult = JSON.parse(savedResult);
        setResult(parsedResult);
        setStep("solutions");
        setSolutionType("pr");
        setIsPrCreating(true);

        const { data: { session } } = await supabase.auth.getSession();
        const token = (session as any)?.provider_token;

        if (!token) {
          setError("GitHub token not found. Please try authorizing again.");
          setIsPrCreating(false);
          return;
        }

        // Parse owner/repo from scan result or manual repo
        let owner = (parsedResult as any).owner;
        let repo = (parsedResult as any).repo;

        if (!owner || !repo) {
          if (savedRepo) {
            const parts = savedRepo.split("/");
            if (parts.length === 2) {
              owner = parts[0];
              repo = parts[1];
            }
          }
        }

        if (!owner || !repo) {
          setError("Could not identify repository owner/repo. Please provide it in the input.");
          setIsPrCreating(false);
          return;
        }

        try {
          const res = await fetch("/api/github/create-pr", {
            // biome-ignore lint/style/useNamingConvention: github api
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, owner, repo, scanResult: parsedResult }),
          });
          const data = await res.json();
          if (data.success) {
            setPrUrl(data.prUrl);
            localStorage.removeItem("ecolens_pending_scan");
            localStorage.removeItem("ecolens_target_repo");
          } else {
            throw new Error(data.error || "PR creation failed");
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsPrCreating(false);
        }
      }
    };

    checkPr();
  }, [authReady, authed, searchParams, supabase]);

  /* ── Redirect to home if not authed ── */
  useEffect(() => {
    if (authReady && !authed) router.replace("/");
  }, [authReady, authed, router]);

  const runScan = useCallback(async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL or Repo.");
      return;
    }
    setError(null);
    setStep("scanning");

    const endpoint = scanType === "github" ? "/api/github-scan" : "/api/scan";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), mode: "performance" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Scan failed.");
      }
      const data: ScanResult = await res.json();
      setResult(data);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("input");
    }
  }, [url, scanType]);

  const handleGithubAuth = async () => {
    if (!supabase || !result) return;
    
    // Validate manual repo if needed
    const needsRepo = !(result as any).owner || !(result as any).repo;
    if (needsRepo && !manualRepo.trim()) {
      setError("Please provide a repository (owner/repo) to optimize.");
      return;
    }

    // Save state
    localStorage.setItem("ecolens_pending_scan", JSON.stringify(result));
    if (manualRepo) {
      localStorage.setItem("ecolens_target_repo", manualRepo.trim());
    }

    setIsPrCreating(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo",
        redirectTo: window.location.origin + "/dashboard?pr_ready=true",
      },
    });

    if (error) {
      setError("Authorization failed: " + error.message);
      setIsPrCreating(false);
    }
  };

  const aiPrompt = useMemo(() => {
    if (!result) return "";
    return `Optimize my website's images to reduce CO2 emissions and improve performance. 
Found ${result.totals.imageCount} images with a total size of ${formatMb(result.totals.originalBytes)} MB.
Suggested Cloudinary transformations: ${result.cloudinary.imageTransform}.
Top offenders to fix:
${result.topOffenders.map(o => `- ${o.originalUrl} (${formatBytes(o.originalBytes)})`).join("\n")}
Please write a React/Next.js component or a script to automate this using Cloudinary Fetch API.`;
  }, [result]);

  const sdkSnippet = `<script 
  src="https://ecolens.cloudinary.com/v1/sdk.js" 
  data-cloud="${result?.cloudinary.cloudName || "your-cloud"}"
  async
></script>`;

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ec-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ec-ink border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ec-canvas text-ec-ink selection:bg-ec-brand/10">
      <Header />

      <main className="relative flex flex-1 flex-col items-center justify-center p-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-ec-brand/5 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-ec-success/5 blur-[120px]" />
        </div>

        <div className="wiz-step relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-ec-hairline bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">

          <div className="h-1 w-full bg-ec-hairline-soft">
            <div
              className="h-full bg-ec-brand transition-all duration-500 ease-out"
              style={{
                width:
                  step === "source" ? "20%" :
                    step === "input" ? "40%" :
                      step === "scanning" ? "60%" :
                        step === "results" ? "80%" : "100%"
              }}
            />
          </div>

          <div className="p-8 md:p-12">

            {step === "source" && (
              <div className="wiz-step flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ec-brand/10 text-ec-brand">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                </div>
                <h1 className="ec-display text-4xl mb-4">Let's start scanning</h1>
                <p className="text-ec-muted mb-10 max-w-md">Select your preferred method to identify media optimization opportunities.</p>

                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    onClick={() => { setScanType("website"); setStep("input"); }}
                    className="group flex flex-col items-start rounded-2xl border border-ec-hairline p-6 text-left transition-all hover:border-ec-brand hover:bg-ec-brand/[0.02]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ec-surface-soft group-hover:bg-ec-brand/10 group-hover:text-ec-brand transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Website URL</h3>
                    <p className="text-sm text-ec-muted">Scan any live public website for images and videos.</p>
                  </button>

                  <button
                    onClick={() => { setScanType("github"); setStep("input"); }}
                    className="group flex flex-col items-start rounded-2xl border border-ec-hairline p-6 text-left transition-all hover:border-ec-brand hover:bg-ec-brand/[0.02]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ec-surface-soft group-hover:bg-ec-brand/10 group-hover:text-ec-brand transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1">GitHub Repository</h3>
                    <p className="text-sm text-ec-muted">Directly analyze images within your codebase.</p>
                  </button>
                </div>
              </div>
            )}

            {step === "input" && (
              <div className="wiz-step flex flex-col items-center">
                <button
                  onClick={() => setStep("source")}
                  className="mb-8 self-start text-xs font-bold uppercase tracking-widest text-ec-muted hover:text-ec-ink transition-colors flex items-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  Back
                </button>

                <h2 className="ec-display text-3xl mb-8 text-center">
                  {scanType === "website" ? "Enter Website URL" : "Enter GitHub Link"}
                </h2>

                <div className="w-full max-w-lg">
                  <div className="relative group">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runScan()}
                      placeholder={scanType === "website" ? "https://example.com" : "owner/repo or GitHub URL"}
                      className="w-full rounded-2xl border border-ec-hairline bg-ec-surface-soft p-6 pr-32 text-lg outline-none transition-all focus:border-ec-brand focus:ring-4 focus:ring-ec-brand/5 group-hover:border-ec-muted"
                      autoFocus
                    />
                    <button
                      onClick={runScan}
                      className="absolute right-3 top-3 bottom-3 rounded-xl bg-ec-brand px-6 font-bold text-white transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      Next
                    </button>
                  </div>
                  {error && <p className="mt-4 text-center text-sm text-ec-error font-medium">{error}</p>}
                </div>
              </div>
            )}

            {step === "scanning" && (
              <div className="wiz-step flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-10 h-32 w-32">
                  <div className="wiz-pulse-ring absolute inset-0 rounded-full bg-ec-brand/10" />
                  <div className="wiz-spin absolute inset-0 rounded-full border-4 border-ec-brand border-t-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-ec-brand">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
                  </div>
                </div>
                <h2 className="ec-display text-3xl mb-4 italic">Optimizing Your Perspective...</h2>
                <p className="text-ec-muted max-w-sm">We're extracting every image, calculating CO2 impact, and preparing your eco-report.</p>
                <div className="mt-12 flex gap-2">
                  <div className="wiz-dot h-3 w-3 rounded-full bg-ec-brand" />
                  <div className="wiz-dot h-3 w-3 rounded-full bg-ec-brand" />
                  <div className="wiz-dot h-3 w-3 rounded-full bg-ec-brand" />
                </div>
              </div>
            )}

            {step === "results" && result && (
              <div className="wiz-step flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                  <div>
                    <h2 className="ec-display text-3xl mb-2">Scan Complete</h2>
                    <p className="text-ec-muted truncate max-w-md italic">Analyzing {result.targetUrl}</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="rounded-xl border border-ec-hairline bg-ec-surface-soft px-4 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-ec-muted font-bold">Reduction</p>
                      <p className="text-xl font-black text-ec-success">{formatPercent(result.metrics.reductionPercent)}</p>
                    </div>
                    <div className="rounded-xl border border-ec-hairline bg-ec-surface-soft px-4 py-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-ec-muted font-bold">CO2 Saved</p>
                      <p className="text-xl font-black text-ec-brand">{result.metrics.co2SavedGrams.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10 rounded-2xl bg-ec-surface-dark p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ec-success/20 text-ec-success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                    </div>
                    <h4 className="font-bold text-lg italic text-ec-success">Cloudinary EcoLens Impact</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-ec-on-dark-soft">
                    Your website is currently burning <span className="text-white font-bold">{formatMb(result.totals.originalBytes)} MB</span> per load.
                    Cloudinary's <code className="bg-white/10 px-1.5 py-0.5 rounded text-ec-success">f_auto, q_auto</code> will
                    improve speed by <span className="text-white font-bold">{formatPercent(result.metrics.loadTimeImprovementPercent)}</span> and slash emissions.
                  </p>
                </div>

                <div className="mb-10 max-h-72 overflow-y-auto rounded-xl border border-ec-hairline">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-ec-surface-soft text-[10px] uppercase tracking-widest text-ec-muted">
                      <tr>
                        <th className="px-6 py-4">Image Asset</th>
                        <th className="px-6 py-4">Original</th>
                        <th className="px-6 py-4">Optimized</th>
                        <th className="px-6 py-4">Eco Gain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ec-hairline">
                      {result.topOffenders.map((item) => (
                        <tr key={item.id} className="hover:bg-ec-surface-soft/50 transition-colors">
                          <td className="px-6 py-4 max-w-[200px] truncate font-medium text-xs italic">{item.originalUrl.split('/').pop()}</td>
                          <td className="px-6 py-4 text-ec-muted">{formatBytes(item.originalBytes)}</td>
                          <td className="px-6 py-4 font-bold text-ec-success">{formatBytes(item.optimizedBytes)}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-ec-brand/10 px-2 py-1 text-[10px] font-bold text-ec-brand">
                              -{formatPercent(item.savingsBytes / item.originalBytes)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => setStep("solutions")}
                  className="w-full rounded-2xl bg-ec-ink p-5 text-lg font-bold text-white transition-all hover:bg-ec-primary-active hover:shadow-xl active:scale-[0.98]"
                >
                  See Optimization Strategies →
                </button>
              </div>
            )}

            {step === "solutions" && (
              <div className="wiz-step flex flex-col">
                <button
                  onClick={() => { setStep("results"); setPrUrl(null); }}
                  className="mb-8 self-start text-xs font-bold uppercase tracking-widest text-ec-muted hover:text-ec-ink transition-colors flex items-center gap-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  Back to Results
                </button>

                <h2 className="ec-display text-3xl mb-10 text-center">Implementation Strategies</h2>

                <div className="grid gap-6">
                  <div
                    onClick={() => setSolutionType("sdk")}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "sdk" ? "border-ec-brand bg-ec-brand/[0.02] ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold italic">2 Lines</div>
                      <div className="flex-1">
                        <h4 className="font-bold">Zero-Install Script Tag</h4>
                        <p className="text-sm text-ec-muted">Just drop this in your HTML or Next.js layout.</p>
                      </div>
                      {solutionType === "sdk" && <div className="h-4 w-4 rounded-full bg-ec-brand shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                    </div>

                    {solutionType === "sdk" && (
                      <div className="mt-6 flex flex-col gap-4">
                        <div className="wiz-code relative group">
                          <pre className="whitespace-pre-wrap">{sdkSnippet}</pre>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(sdkSnippet); alert("Snippet copied!"); }}
                            className="absolute top-2 right-2 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setSolutionType("pr")}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "pr" ? "border-ec-brand bg-ec-brand/[0.02] ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.7 1.5-1.7 1.5-2.7 0-1.5-1.5-3-3.5-3S11 7.5 11 9" /><path d="M9 14c-.2-1-.7-1.7-1.5-2.5-1-.7-1.5-1.7-1.5-2.7 0-1.5-1.5-3-3.5-3S13 7.5 13 9" /><path d="M12 22v-5" /><circle cx="12" cy="17" r="1" /></svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">Raise a GitHub PR</h4>
                        <p className="text-sm text-ec-muted">Generate optimized assets and merge into your repo.</p>
                      </div>
                      {solutionType === "pr" && <div className="h-4 w-4 rounded-full bg-ec-brand shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                    </div>

                    {solutionType === "pr" && (
                      <div className="mt-6 flex flex-col gap-4">
                        {prUrl ? (
                          <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-ec-success/10 border border-ec-success/20 animate-fade-up">
                            <div className="h-12 w-12 rounded-full bg-ec-success text-white flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-ec-ink">Pull Request Created!</h4>
                              <p className="text-xs text-ec-muted mt-1">Your code optimizations have been proposed.</p>
                            </div>
                            <a
                              href={prUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full rounded-xl bg-ec-brand p-4 text-sm font-bold text-white text-center hover:bg-blue-600 transition-all"
                            >
                              View on GitHub ↗
                            </a>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                             {/* ASK REPO IF MISSING */}
                             {(!(result as any).owner || !(result as any).repo) && (
                               <div className="flex flex-col gap-2">
                                 <label className="text-xs font-bold text-ec-ink uppercase tracking-wider">GitHub Repository</label>
                                 <input 
                                   type="text"
                                   value={manualRepo}
                                   onChange={(e) => setManualRepo(e.target.value)}
                                   placeholder="owner/repo (e.g. facebook/react)"
                                   className="w-full rounded-xl border border-ec-hairline bg-ec-surface-soft p-4 text-sm outline-none focus:border-ec-brand"
                                   onClick={(e) => e.stopPropagation()}
                                 />
                               </div>
                             )}

                            <button
                              onClick={(e) => { e.stopPropagation(); handleGithubAuth(); }}
                              disabled={isPrCreating}
                              className="w-full rounded-xl bg-ec-ink p-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:bg-ec-primary-active disabled:opacity-50"
                            >
                              {isPrCreating ? (
                                <>
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  Creating PR...
                                </>
                              ) : (
                                <>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                  Authorize & Create Pull Request
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        {error && <p className="text-xs text-ec-error text-center font-medium mt-2">{error}</p>}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setSolutionType("prompt")}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "prompt" ? "border-ec-brand bg-ec-brand/[0.02] ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18.5a6.5 6.5 0 1 0-13 0c0 3.5 6.5 10.5 6.5 10.5s6.5-7 6.5-10.5Z" /><path d="M12 12s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">AI Guided Optimization</h4>
                        <p className="text-sm text-ec-muted">Specialized prompt for ChatGPT or Claude.</p>
                      </div>
                      {solutionType === "prompt" && <div className="h-4 w-4 rounded-full bg-ec-brand shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                    </div>

                    {solutionType === "prompt" && (
                      <div className="mt-6 flex flex-col gap-4">
                        <div className="wiz-code relative group">
                          <pre className="whitespace-pre-wrap text-[11px]">{aiPrompt}</pre>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(aiPrompt); alert("Prompt copied!"); }}
                            className="absolute top-2 right-2 rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => { setStep("source"); setResult(null); setSolutionType(null); setUrl(""); setPrUrl(null); }}
                    className="text-sm font-bold text-ec-muted hover:text-ec-ink transition-colors"
                  >
                    Reset and Start New Scan
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ec-canvas"><div className="h-10 w-10 animate-spin rounded-full border-2 border-ec-ink border-t-transparent" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
