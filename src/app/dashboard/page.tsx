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
  const [sdkCopied, setSdkCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<string[]>([]);

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

    const assetList = result.media
      .map((item) => {
        const label = item.filePath ? item.filePath : item.originalUrl;
        return `- ${label} (${formatBytes(item.originalBytes)})`;
      })
      .join("\n");

    return `You are an expert code refactoring assistant. Your job is to replace every image reference in this repository with Cloudinary-optimized delivery URLs and generate a clean, human-readable report.

Strict rules:
1) Use ONLY the user's Cloudinary cloud name. If it is missing, ask for it. Do not invent or guess.
2) Use Cloudinary Fetch for remote URLs and Cloudinary delivery for local assets that should be uploaded or already exist in Cloudinary.
3) Update all references across HTML, CSS, JS/TS, JSX/TSX, and markdown.
4) Produce a full report that lists every file changed and the exact transformation pattern applied.
5) Generate .env.example and document how to set up .env locally.
6) No emojis in outputs or file names.

Required outputs:
- Code changes for all images (no partial updates).
- ECOLENS_REPORT.md with:
  - Summary (counts, savings, approach)
  - Files changed (file path + reason)
  - Cloudinary setup (how to get cloud name from console.cloudinary.com -> Dashboard)
  - Environment setup (create .env and .env.example; use CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
  - How to validate the changes locally

Use this transformation pattern:
- Images: ${result.cloudinary.imageTransform}

Detected assets:
${assetList}

After completing changes, respond with "Done" and nothing else.`;
  }, [result]);

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const sdkBaseUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://ecolens-cloudinary.vercel.app";
  const sdkSnippet = `<script 
  src="${sdkBaseUrl}/sdk.js" 
  data-cloud="${result?.cloudinary.cloudName || "your-cloud"}"
  async
></script>`;

  const handleCopy = async (text: string, setCopied: (value: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const steps: Array<{ key: WizardStep; label: string; helper: string }> = [
    { key: "source", label: "Choose source", helper: "Website or GitHub" },
    { key: "input", label: "Provide input", helper: "URL or repo" },
    { key: "scanning", label: "Scan media", helper: "Analyze assets" },
    { key: "results", label: "Review results", helper: "Impact summary" },
    { key: "solutions", label: "Apply fixes", helper: "SDK, PR, or AI" },
  ];
  const stepIndex = Math.max(
    steps.findIndex((item) => item.key === step),
    0
  );
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);
  const hasMedia =
    (result?.totals.imageCount ?? 0) + (result?.totals.videoCount ?? 0) > 0;

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

      <main className="flex-1 py-12">
        <div className="ec-container">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-2xl border border-ec-hairline bg-ec-surface-soft p-6 lg:sticky lg:top-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ec-muted">Scan steps</p>
              <div className="mt-6 space-y-3">
                {steps.map((item, index) => {
                  const isCurrent = index === stepIndex;
                  const isDone = index < stepIndex;
                  const badgeClass = isDone
                    ? "bg-ec-ink text-white"
                    : isCurrent
                      ? "border-ec-ink text-ec-ink"
                      : "border-ec-hairline text-ec-muted";

                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${badgeClass}`}>
                        {isDone ? "✓" : index + 1}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isCurrent ? "text-ec-ink" : "text-ec-body"}`}>{item.label}</p>
                        <p className="text-xs text-ec-muted">{item.helper}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 rounded-xl border border-ec-hairline bg-white p-4 text-xs text-ec-muted">
                {result ? (
                  <>
                    <p className="font-semibold text-ec-ink">Current scan</p>
                    <p className="mt-1 truncate">{result.targetUrl}</p>
                    <p className="mt-2">{result.totals.imageCount} images, {result.totals.videoCount} videos</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-ec-ink">Tip</p>
                    <p className="mt-1">Use public URLs for the most accurate scan results.</p>
                  </>
                )}
              </div>
            </aside>

            <div className="wiz-step w-full overflow-hidden rounded-3xl border border-ec-hairline bg-white shadow-[0_24px_48px_-16px_rgba(0,0,0,0.12)]">

          <div className="h-1 w-full bg-ec-hairline-soft">
            <div
              className="h-full bg-ec-brand transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`
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
                    className="group flex flex-col items-start rounded-2xl border border-ec-hairline p-6 text-left transition-all hover:border-ec-brand hover:bg-ec-brand/2"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ec-surface-soft group-hover:bg-ec-brand/10 group-hover:text-ec-brand transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Website URL</h3>
                    <p className="text-sm text-ec-muted">Scan any live public website for images and videos.</p>
                  </button>

                  <button
                    onClick={() => { setScanType("github"); setStep("input"); }}
                    className="group flex flex-col items-start rounded-2xl border border-ec-hairline p-6 text-left transition-all hover:border-ec-brand hover:bg-ec-brand/2"
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

                <div className="mb-10 rounded-2xl border border-ec-hairline bg-ec-surface-soft p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ec-success/10 text-ec-success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                    </div>
                    <h4 className="font-bold text-lg text-ec-ink">Cloudinary EcoLens Impact</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-ec-body">
                    Your website currently transfers <span className="font-bold text-ec-ink">{formatMb(result.totals.originalBytes)} MB</span> per load.
                    Cloudinary's <code className="bg-ec-canvas px-1.5 py-0.5 rounded text-ec-success">f_auto, q_auto</code> can
                    improve speed by <span className="font-bold text-ec-ink">{formatPercent(result.metrics.loadTimeImprovementPercent)}</span> and reduce emissions.
                  </p>
                </div>

                {!hasMedia && (
                  <div className="mb-6 rounded-xl border border-ec-warning/30 bg-ec-warning/10 p-4 text-sm text-ec-ink">
                    No media assets were detected. Some sites render media client-side or block crawlers. Try another URL or use the GitHub scan.
                  </div>
                )}

                <div className="mb-10 rounded-xl border border-ec-hairline">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-ec-surface-soft text-[10px] uppercase tracking-widest text-ec-muted">
                      <tr>
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4">Original</th>
                        <th className="px-6 py-4">Optimized</th>
                        <th className="px-6 py-4">Eco Gain</th>
                      </tr>
                    </thead>
                      <tbody className="divide-y divide-ec-hairline">
                        {result.media.map((item) => {
                          const isOpen = expandedAssets.includes(item.id);
                          return (
                            <>
                              <tr
                                key={item.id}
                                onClick={() =>
                                  setExpandedAssets((prev) => (prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]))
                                }
                                className="hover:bg-ec-surface-soft/50 transition-colors cursor-pointer"
                              >
                                <td className="px-6 py-4 max-w-50 truncate font-medium text-xs italic">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-ec-surface-soft px-2 py-0.5 text-[9px] font-semibold uppercase text-ec-muted">
                                      {item.type}
                                    </span>
                                    <span className="truncate">{item.originalUrl.split("/").pop()}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-ec-muted">{formatBytes(item.originalBytes)}</td>
                                <td className="px-6 py-4 font-bold text-ec-success">{formatBytes(item.optimizedBytes)}</td>
                                <td className="px-6 py-4">
                                  <span className="rounded-full bg-ec-brand/10 px-2 py-1 text-[10px] font-bold text-ec-brand">
                                    -{formatPercent(item.savingsBytes / item.originalBytes)}
                                  </span>
                                </td>
                              </tr>

                              {isOpen && (
                                <tr key={`${item.id}-detail`} className="bg-ec-canvas">
                                  <td colSpan={4} className="px-6 py-4 text-sm text-ec-body">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs text-ec-muted">Original URL</p>
                                        <a href={item.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-ec-ink break-words">
                                          {item.originalUrl}
                                        </a>

                                        <p className="mt-2 text-xs text-ec-muted">Optimized URL</p>
                                        <a href={item.optimizedUrl} target="_blank" rel="noreferrer" className="text-xs text-ec-ink break-words">
                                          {item.optimizedUrl}
                                        </a>
                                      </div>

                                      <div className="w-full max-w-xs shrink-0">
                                        {item.type === "image" ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={item.optimizedUrl} alt={item.originalUrl.split("/").pop()} className="w-full rounded-md border border-ec-hairline object-contain" />
                                        ) : item.type === "video" ? (
                                          <video src={item.optimizedUrl} controls className="w-full rounded-md border border-ec-hairline" />
                                        ) : (
                                          <div className="rounded-md border border-ec-hairline p-3 text-xs text-ec-muted">No preview available</div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                  </table>
                </div>

                <button
                  onClick={() => setStep("solutions")}
                  className="w-full rounded-xl bg-ec-ink px-6 py-4 text-sm font-semibold text-white transition hover:bg-ec-primary-active"
                >
                  See Optimization Strategies
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
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "sdk" ? "border-ec-brand bg-ec-brand/2 ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 9l-4 3 4 3" />
                          <path d="M16 9l4 3-4 3" />
                          <path d="M14 5l-4 14" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">Zero-Install Script Tag</h4>
                        <p className="text-sm text-ec-muted">Just drop this in your HTML or Next.js layout.</p>
                      </div>
                      {solutionType === "sdk" && <div className="h-4 w-4 rounded-full bg-ec-brand shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                    </div>

                    {solutionType === "sdk" && (
                      <div className="mt-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 rounded-xl border border-ec-hairline bg-ec-surface-soft p-4 shadow-[0_16px_30px_-22px_rgba(15,23,42,0.4)]">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-ec-ink">Script tag is ready to copy</p>
                              <p className="text-xs text-ec-muted">Paste into your &lt;head&gt; or Next.js layout file.</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(sdkSnippet, setSdkCopied); }}
                              className="rounded-lg border border-ec-hairline bg-white px-4 py-2 text-xs font-semibold text-ec-ink transition hover:bg-ec-surface-soft"
                            >
                              {sdkCopied ? "Copied" : "Copy script"}
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap rounded-lg border border-ec-hairline bg-white px-4 py-3 text-[11px] text-ec-ink">
{sdkSnippet}
                          </pre>
                          <p className="text-xs text-ec-muted">Do not share your Cloudinary cloud name publicly if your account is private.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setSolutionType("pr")}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "pr" ? "border-ec-brand bg-ec-brand/2 ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="5" cy="5" r="3" />
                          <circle cx="19" cy="19" r="3" />
                          <circle cx="19" cy="5" r="3" />
                          <path d="M8 6l8 0" />
                          <path d="M6 8l0 8" />
                          <path d="M8 16l8 0" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">Raise a GitHub PR</h4>
                          <span className="rounded-full bg-ec-surface-soft px-2 py-0.5 text-[10px] font-semibold text-ec-body">Recommended for beginners →</span>
                        </div>
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
                                  Authorize GitHub and Create PR
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-ec-muted">We request repo scope to open a PR on your behalf.</p>
                          </div>
                        )}
                        {error && <p className="text-xs text-ec-error text-center font-medium mt-2">{error}</p>}
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setSolutionType("prompt")}
                    className={`cursor-pointer rounded-2xl border p-6 transition-all ${solutionType === "prompt" ? "border-ec-brand bg-ec-brand/2 ring-2 ring-ec-brand/10" : "border-ec-hairline hover:border-ec-muted"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 3l1.8 3.8L18 8l-3 2.9.7 4.1-3.7-2-3.7 2 .7-4.1L6 8l4.2-1.2L12 3z" />
                          <path d="M5 21l2-4" />
                          <path d="M19 21l-2-4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">AI Guided Optimization</h4>
                        <p className="text-sm text-ec-muted">Specialized prompt for ChatGPT or Claude.</p>
                      </div>
                      {solutionType === "prompt" && <div className="h-4 w-4 rounded-full bg-ec-brand shadow-[0_0_12px_rgba(59,130,246,0.5)]" />}
                    </div>

                    {solutionType === "prompt" && (
                      <div className="mt-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 rounded-xl border border-ec-hairline bg-ec-surface-soft p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-ec-ink">Prompt is hidden for safety</p>
                              <p className="text-xs text-ec-muted">Copy it directly into Claude Code or Cursor.</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopy(aiPrompt, setPromptCopied); }}
                              className="rounded-lg border border-ec-hairline bg-white px-4 py-2 text-xs font-semibold text-ec-ink transition hover:bg-ec-surface-soft"
                            >
                              {promptCopied ? "Copied" : "Copy prompt"}
                            </button>
                          </div>
                          <p className="text-xs text-ec-muted">The prompt includes repo-wide steps, report structure, and Cloudinary setup guidance.</p>
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
