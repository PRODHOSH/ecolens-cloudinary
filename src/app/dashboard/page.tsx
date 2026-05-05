"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import type { ScanResult, OptimizationMode } from "@/lib/types";
import { formatBytes, formatPercent, formatMb } from "@/lib/format";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const MODES: { value: OptimizationMode; label: string; icon: string; desc: string }[] = [
  { value: "performance", label: "⚡ Performance", icon: "⚡", desc: "q_auto:eco — max speed" },
  { value: "quality",     label: "🎨 Quality",     icon: "🎨", desc: "q_auto:best — crisp output" },
  { value: "eco",         label: "🌱 Eco",          icon: "🌱", desc: "Aggressive compression" },
];

const COLORS = ["#111111", "#6b7280", "#d1d5db"];

export default function DashboardPage() {
  const router = useRouter();

  // Auth
  const [authed,    setAuthed]    = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [userName,  setUserName]  = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Scan flow  — 3 steps: "input" | "scanning" | "report"
  const [step,            setStep]            = useState<"input" | "scanning" | "report">("input");
  const [url,             setUrl]             = useState("");
  const [mode,            setMode]            = useState<OptimizationMode>("performance");
  const [result,          setResult]          = useState<ScanResult | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const [optimizedBlobUrl, setOptimizedBlobUrl] = useState<string | null>(null);
  const [iframeFullscreen, setIframeFullscreen] = useState<"before" | "after" | null>(null);

  /* ── Auth gate ── */
  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }

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

  /* ── Redirect to home if not authed ── */
  useEffect(() => {
    if (authReady && !authed) router.replace("/");
  }, [authReady, authed, router]);

  /* ── Blob URL for optimized iframe (srcDoc loses base URL context → black screen) ── */
  useEffect(() => {
    if (!result?.optimizedHtml) {
      setOptimizedBlobUrl(null);
      return;
    }
    const blob = new Blob([result.optimizedHtml], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    setOptimizedBlobUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [result?.optimizedHtml]);

  /* ── Scan ── */
  const runScan = useCallback(async () => {
    if (!url.trim()) { setError("Please enter a website URL."); return; }
    const normalized = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    try { new URL(normalized); } catch { setError("Please enter a valid URL."); return; }

    setError(null);
    setStep("scanning");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized, mode }),
      });
      if (!res.ok) throw new Error("Scan failed. Try a different URL.");
      const data: ScanResult = await res.json();
      setResult(data);
      setStep("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("input");
    }
  }, [url, mode]);

  /* ── PDF download ── */
  const downloadPdf = useCallback(async () => {
    if (!result) return;
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);

    const t = (text: string, x: number, y: number, size = 11, color = rgb(0.1, 0.1, 0.1), f = font) =>
      page.drawText(text, { x, y, size, color, font: f });

    t("EcoLens Optimization Report", 50, 800, 22, rgb(0, 0, 0), bold);
    t(`Site: ${result.targetUrl}`, 50, 770, 10);
    t(`Generated: ${new Date(result.createdAt).toLocaleString()}`, 50, 756, 10);
    t(`Mode: ${result.mode}`, 50, 742, 10);

    t("Summary", 50, 710, 14, rgb(0, 0, 0), bold);
    t(`Total media assets: ${result.totals.imageCount + result.totals.videoCount}`, 50, 692);
    t(`Original total size: ${formatBytes(result.totals.originalBytes)}`, 50, 676);
    t(`Optimized size: ${formatBytes(result.totals.optimizedBytes)}`, 50, 660);
    t(`Size reduction: ${formatPercent(result.metrics.reductionPercent)}`, 50, 644);
    t(`Bandwidth saved: ${result.metrics.bandwidthSavedMb.toFixed(2)} MB`, 50, 628);
    t(`CO₂ saved: ${result.metrics.co2SavedGrams.toFixed(2)} g/page`, 50, 612);
    t(`Load time improvement: ${formatPercent(result.metrics.loadTimeImprovementPercent)}`, 50, 596);
    t(`Eco score: ${result.metrics.ecoScoreBefore} → ${result.metrics.ecoScoreAfter}`, 50, 580);

    t("Cloudinary Transform Applied", 50, 548, 14, rgb(0, 0, 0), bold);
    t(result.cloudinary.imageTransform, 50, 530, 9, rgb(0.2, 0.2, 0.8));

    t("Top Offenders (by bytes wasted)", 50, 498, 14, rgb(0, 0, 0), bold);
    result.topOffenders.slice(0, 5).forEach((item, i) => {
      const y = 478 - i * 40;
      const urlDisplay = item.originalUrl.length > 80 ? item.originalUrl.slice(0, 77) + "..." : item.originalUrl;
      t(`${i + 1}. ${urlDisplay}`, 50, y, 8);
      t(`   Original: ${formatBytes(item.originalBytes)}  →  Optimized: ${formatBytes(item.optimizedBytes)}  (save ${formatBytes(item.savingsBytes)})`, 50, y - 12, 8, rgb(0.4, 0.4, 0.4));
      t(`   Fix: Convert to ${item.formatAfter} via ${result.cloudinary.imageTransform}`, 50, y - 24, 8, rgb(0.2, 0.5, 0.2));
    });

    const bytes = await doc.save();
    // Use bytes directly (not bytes.buffer) to avoid slice-of-larger-buffer corruption
    const blob = new Blob([bytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `ecolens-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }, [result]);

  /* ── Loading auth ── */
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ec-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ec-ink border-t-transparent" />
      </div>
    );
  }

  /* ── Chart data ── */
  const barData = result ? [
    { name: "Original", value: +formatMb(result.totals.originalBytes) },
    { name: "Optimized", value: +formatMb(result.totals.optimizedBytes) },
  ] : [];

  const greeting = userName ? `Hey, ${userName.split(" ")[0]} 👋` : "Welcome back 👋";

  return (
    <div className="flex min-h-screen flex-col bg-ec-canvas text-ec-ink">
      <Header />

      <main className="flex-1">
        {/* ── Top bar ── */}
        <div className="border-b border-ec-hairline bg-ec-surface-soft px-6 py-5">
          <div className="ec-container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName} width={44} height={44} className="h-11 w-11 rounded-full border border-ec-hairline object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ec-ink text-sm font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="ec-display text-xl font-bold text-ec-ink">{greeting}</p>
                <p className="text-xs text-ec-muted">EcoLens Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2">
              {result && (
                <button onClick={() => { setStep("input"); setResult(null); }} className="ec-button-secondary">
                  New Scan
                </button>
              )}
              {result && (
                <button id="download-pdf-btn" onClick={downloadPdf} className="ec-button-primary flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="ec-container py-10">

          {/* ═══ STEP 1: URL INPUT ═══ */}
          {step === "input" && (
            <div className="mx-auto max-w-2xl">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-ec-muted">Step 1 of 2</p>
                <h1 className="ec-display mt-4 text-4xl">Analyse a website</h1>
                <p className="mt-3 text-sm text-ec-muted">Paste any public URL — EcoLens will extract every image and video, run Cloudinary transforms, and generate a full report.</p>
              </div>

              {/* Mode picker */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    id={`mode-${m.value}`}
                    onClick={() => setMode(m.value)}
                    className={`rounded-xl border p-4 text-left transition ${
                      mode === m.value
                        ? "border-ec-ink bg-ec-ink text-white"
                        : "border-ec-hairline bg-ec-canvas text-ec-body hover:border-ec-ink/30"
                    }`}
                  >
                    <p className="text-lg">{m.icon}</p>
                    <p className="mt-1 text-sm font-bold">{m.label.replace(/^[^ ]+ /, "")}</p>
                    <p className={`mt-0.5 text-xs ${mode === m.value ? "text-white/70" : "text-ec-muted"}`}>{m.desc}</p>
                  </button>
                ))}
              </div>

              {/* URL input */}
              <div className="mt-6 rounded-xl border border-ec-hairline bg-ec-canvas p-5">
                <label htmlFor="scan-url" className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  Website URL
                </label>
                <div className="mt-3 flex gap-3">
                  <input
                    id="scan-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runScan()}
                    placeholder="https://yourwebsite.com"
                    className="ec-input flex-1"
                    autoFocus
                  />
                  <button id="start-scan-btn" onClick={runScan} className="ec-button-primary px-6">
                    Scan
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-ec-error">{error}</p>}
              </div>

              <p className="mt-4 text-center text-xs text-ec-muted">
                Applies: <code className="rounded bg-ec-surface-soft px-1 py-0.5 font-mono text-[11px]">f_auto,q_auto,w_auto,dpr_auto,g_auto,e_sharpen</code>
              </p>
            </div>
          )}

          {/* ═══ STEP 2: SCANNING ═══ */}
          {step === "scanning" && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-ec-ink border-t-transparent" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <p className="mt-6 text-xl font-bold text-ec-ink">Analysing {url}</p>
              <p className="mt-2 text-sm text-ec-muted">Extracting media · Running Cloudinary transforms · Computing metrics</p>
              <div className="mt-8 flex gap-3 text-xs text-ec-muted">
                {["image/fetch", "f_auto", "q_auto", "g_auto", "e_sharpen"].map((tag) => (
                  <span key={tag} className="animate-pulse rounded-full border border-ec-hairline px-2.5 py-1 font-mono">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: REPORT ═══ */}
          {step === "report" && result && (
            <div className="flex flex-col gap-8">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-ec-muted">
                <Link href="/dashboard" className="hover:text-ec-ink">Dashboard</Link>
                <span>/</span>
                <span className="text-ec-ink font-medium truncate max-w-sm">{result.targetUrl}</span>
              </div>

              {/* ── KPI row ── */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "Size reduced",     value: formatPercent(result.metrics.reductionPercent),            sub: `${formatBytes(result.totals.savingsBytes)} saved`,         color: "text-emerald-600" },
                  { label: "Bandwidth saved",   value: `${result.metrics.bandwidthSavedMb.toFixed(1)} MB`,        sub: `from ${formatBytes(result.totals.originalBytes)}`,          color: "text-blue-600"    },
                  { label: "CO₂ avoided",       value: `${result.metrics.co2SavedGrams.toFixed(1)} g`,            sub: "per page view",                                            color: "text-green-600"   },
                  { label: "Load time delta",   value: formatPercent(result.metrics.loadTimeImprovementPercent),  sub: "estimated improvement",                                    color: "text-violet-600"  },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-ec-hairline bg-ec-canvas p-5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-ec-muted">{kpi.label}</p>
                    <p className={`ec-display mt-2 text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                    <p className="mt-1 text-xs text-ec-muted">{kpi.sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Before site + Image comparison ── */}
              <div className="grid gap-4 lg:grid-cols-2">

                {/* Before: live iframe of original site */}
                <div className="rounded-xl border border-ec-hairline overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-ec-hairline bg-ec-surface-soft px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-red-400"/>
                    <p className="text-xs font-semibold text-ec-muted uppercase tracking-[0.15em]">Before — Original</p>
                    <div className="ml-auto flex gap-1.5">
                      <button
                        onClick={() => setIframeFullscreen("before")}
                        className="rounded-md border border-ec-hairline bg-ec-canvas px-2 py-1 text-[10px] text-ec-muted transition hover:text-ec-ink"
                      >
                        ⛶ Expand
                      </button>
                      <a href={result.targetUrl} target="_blank" rel="noopener noreferrer"
                        className="rounded-md border border-ec-hairline bg-ec-canvas px-2 py-1 text-[10px] text-ec-muted transition hover:text-ec-ink"
                      >
                        ↗ Open
                      </a>
                    </div>
                  </div>
                  <div className="h-72 bg-white">
                    <iframe title="Original site" src={result.targetUrl} className="h-full w-full" />
                  </div>
                </div>

                {/* After: actual image-by-image comparison grid */}
                <div className="rounded-xl border border-ec-hairline overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-ec-hairline bg-ec-surface-soft px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-green-400"/>
                    <p className="text-xs font-semibold text-ec-muted uppercase tracking-[0.15em]">After — Cloudinary Optimised</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-100 ml-auto">
                      {formatPercent(result.metrics.reductionPercent)} lighter
                    </span>
                  </div>
                  <div className="h-72 overflow-y-auto bg-ec-canvas p-3">
                    {result.media.filter(i => i.type === "image").length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {result.media.filter(i => i.type === "image").slice(0, 8).map((item) => (
                          <div key={item.id} className="rounded-lg border border-ec-hairline bg-white overflow-hidden">
                            {/* Side-by-side thumbnails */}
                            <div className="grid grid-cols-2 divide-x divide-ec-hairline h-20">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.originalUrl}
                                alt="Original"
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.optimizedUrl}
                                alt="Optimised"
                                className="h-full w-full object-cover"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <div className="flex items-center justify-between px-2 py-1.5">
                              <span className="text-[10px] text-ec-muted">{item.formatBefore} → {item.formatAfter}</span>
                              <span className="text-[10px] font-bold text-emerald-600">-{formatBytes(item.savingsBytes)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-100">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ec-ink">No static images found</p>
                          <p className="mt-1 text-xs text-ec-muted leading-relaxed">
                            This site likely uses JavaScript to render images dynamically.<br/>
                            Try a content-heavy site like a blog or e-commerce store.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Fullscreen overlay (original only) ── */}
              {iframeFullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                    <p className="text-sm font-semibold text-white">
                      {iframeFullscreen === "before" ? `Before — ${result.targetUrl}` : "After — Image Comparison"}
                    </p>
                    <button
                      onClick={() => setIframeFullscreen(null)}
                      className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70 transition hover:text-white"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="flex-1 bg-white">
                    <iframe title="Original site fullscreen" src={result.targetUrl} className="h-full w-full" />
                  </div>
                </div>
              )}

              {/* ── Charts row ── */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Bar chart */}
                <div className="col-span-2 rounded-xl border border-ec-hairline bg-ec-canvas p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">Media size comparison (MB)</p>
                  <div className="mt-4 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} barSize={56}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          <Cell fill="#111111" />
                          <Cell fill="#10b981" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Eco score radial */}
                <div className="rounded-xl border border-ec-hairline bg-ec-canvas p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">Eco score</p>
                  <div className="mt-4 flex flex-col items-center">
                    <div className="relative">
                      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                        <circle
                          cx="60" cy="60" r="50"
                          fill="none" stroke="#10b981" strokeWidth="12"
                          strokeDasharray={`${(result.metrics.ecoScoreAfter / 100) * 314} 314`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="ec-display text-2xl font-black text-ec-ink">{result.metrics.ecoScoreAfter}</span>
                        <span className="text-[10px] text-ec-muted">/100</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-ec-muted">
                      Was <span className="font-semibold text-ec-ink">{result.metrics.ecoScoreBefore}</span> → now <span className="font-semibold text-emerald-600">{result.metrics.ecoScoreAfter}</span>
                    </p>
                  </div>
                  {/* Mini stats */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ec-muted">Images</span>
                      <span className="font-semibold text-ec-ink">{result.totals.imageCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ec-muted">Videos</span>
                      <span className="font-semibold text-ec-ink">{result.totals.videoCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ec-muted">Mode</span>
                      <span className="font-semibold text-ec-ink capitalize">{result.mode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Top offenders table ── */}
              <div className="rounded-xl border border-ec-hairline bg-ec-canvas overflow-hidden">
                <div className="flex items-center justify-between border-b border-ec-hairline bg-ec-surface-soft px-5 py-3.5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">Top offenders</p>
                    <p className="ec-display mt-0.5 text-lg font-bold">Heaviest assets to fix first</p>
                  </div>
                  <span className="text-xs text-ec-muted">Sorted by bytes wasted</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ec-surface-soft text-[11px] uppercase tracking-[0.15em] text-ec-muted">
                      <tr>
                        <th className="px-5 py-3">#</th>
                        <th className="px-5 py-3">Asset URL</th>
                        <th className="px-5 py-3">Format</th>
                        <th className="px-5 py-3">Original</th>
                        <th className="px-5 py-3">Optimised</th>
                        <th className="px-5 py-3">Saved</th>
                        <th className="px-5 py-3">Fix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.topOffenders.map((item, i) => (
                        <tr key={item.id} className="border-t border-ec-hairline hover:bg-ec-surface-soft/50">
                          <td className="px-5 py-3 text-xs tabular-nums text-ec-muted">{i + 1}</td>
                          <td className="px-5 py-3 text-xs text-ec-body max-w-xs">
                            <span className="block truncate" title={item.originalUrl}>{item.originalUrl}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="rounded bg-ec-surface-soft px-1.5 py-0.5 text-[11px] font-mono text-ec-muted">{item.formatBefore}</span>
                          </td>
                          <td className="px-5 py-3 text-xs font-medium text-ec-ink">{formatBytes(item.originalBytes)}</td>
                          <td className="px-5 py-3 text-xs font-medium text-emerald-600">{formatBytes(item.optimizedBytes)}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-bold text-blue-600">-{formatBytes(item.savingsBytes)}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-ec-muted">→ {item.formatAfter}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Cloudinary transform inspector ── */}
              <div className="rounded-xl border border-ec-hairline bg-ec-canvas p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">Cloudinary transformation applied</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.cloudinary.imageTransform.split(",").map((param) => (
                    <span key={param} className="rounded-full border border-[#c5cbf0] bg-[#eef0fb] px-3 py-1 font-mono text-xs text-[#3448C5]">
                      {param}
                    </span>
                  ))}
                </div>
                <p className="mt-4 font-mono text-[11px] text-ec-muted break-all">
                  https://res.cloudinary.com/<strong>{result.cloudinary.cloudName}</strong>/image/fetch/{result.cloudinary.imageTransform}/<em>IMAGE_URL</em>
                </p>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
