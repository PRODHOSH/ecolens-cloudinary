"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import CopyButton from "@/components/CopyButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ModeToggle from "@/components/ModeToggle";
import { formatBytes, formatMb, formatPercent } from "@/lib/format";
import { supabase } from "@/lib/supabaseClient";
import type { OptimizationMode, ScanResult } from "@/lib/types";

const SDK_SNIPPET = `<script src="https://ecolens.app/sdk.js"></script>
<script>
  EcoLens.optimize();
</script>`;

export default function ScanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") ?? "";
  const modeParam = (searchParams.get("mode") ?? "performance") as OptimizationMode;

  const [mode, setMode] = useState<OptimizationMode>(modeParam);
  const [inputUrl, setInputUrl] = useState(urlParam);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      setAuthed(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
      setAuthReady(true);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setInputUrl(urlParam);
  }, [urlParam]);

  useEffect(() => {
    if (!authed || !urlParam) {
      setResult(null);
    }
  }, [authed, urlParam]);

  const handleModeChange = (next: OptimizationMode) => {
    setMode(next);
    if (urlParam) {
      router.replace(`/scan?url=${encodeURIComponent(urlParam)}&mode=${next}`);
    }
  };

  const handleScanSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!authed) {
      window.dispatchEvent(new Event("ec-auth-open"));
      return;
    }

    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setError("Enter a URL to scan.");
      return;
    }

    const normalized = trimmed.startsWith("http")
      ? trimmed
      : `https://${trimmed}`;

    try {
      new URL(normalized);
      router.replace(`/scan?url=${encodeURIComponent(normalized)}&mode=${mode}`);
    } catch {
      setError("Enter a valid website URL.");
    }
  };

  useEffect(() => {
    if (!authed || !urlParam) {
      setLoading(false);
      return;
    }

    const runScan = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlParam, mode }),
        });

        if (!response.ok) {
          throw new Error("Scan failed.");
        }

        const payload: ScanResult = await response.json();
        setResult(payload);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try again."
        );
      } finally {
        setLoading(false);
      }
    };

    runScan();
  }, [urlParam, mode, authed]);

  useEffect(() => {
    setMode(modeParam);
  }, [modeParam]);

  const chartData = useMemo(() => {
    if (!result) return [];
    return [
      { name: "Original", value: formatMb(result.totals.originalBytes) },
      { name: "Optimized", value: formatMb(result.totals.optimizedBytes) },
    ];
  }, [result]);

  const integrationSnippet = useMemo(() => {
    const cloud = result?.cloudinary.cloudName ?? "YOUR_CLOUD";
    return `(() => {\n  const images = document.querySelectorAll("img");\n  images.forEach((img) => {\n    const original = img.src;\n    img.src = "https://res.cloudinary.com/${cloud}/image/fetch/f_auto,q_auto,w_auto,dpr_auto,g_auto/" + original;\n  });\n})();`;
  }, [result]);

  const handleDownloadReport = async () => {
    if (!result) return;
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (
      text: string,
      x: number,
      y: number,
      size = 12,
      color = rgb(0.14, 0.18, 0.23),
      fontStyle = font
    ) => {
      page.drawText(text, { x, y, size, color, font: fontStyle });
    };

    drawText("EcoLens Optimization Report", 50, 800, 20, rgb(0, 0, 0), bold);
    drawText(`Website: ${result.targetUrl}`, 50, 770, 11);
    drawText(`Generated: ${new Date(result.createdAt).toLocaleString()}`, 50, 754, 11);

    drawText("Summary", 50, 720, 14, rgb(0.1, 0.1, 0.1), bold);
    drawText(`Total media: ${result.totals.imageCount + result.totals.videoCount}`, 50, 700);
    drawText(`Original size: ${formatBytes(result.totals.originalBytes)}`, 50, 684);
    drawText(`Optimized size: ${formatBytes(result.totals.optimizedBytes)}`, 50, 668);
    drawText(`Reduction: ${formatPercent(result.metrics.reductionPercent)}`, 50, 652);
    drawText(`CO2 saved: ${result.metrics.co2SavedGrams.toFixed(2)} g`, 50, 636);

    drawText("Top Offenders", 50, 600, 14, rgb(0.1, 0.1, 0.1), bold);
    result.topOffenders.slice(0, 4).forEach((item, index) => {
      const y = 580 - index * 24;
      drawText(`- ${item.originalUrl}`, 50, y, 9);
      drawText(
        `  ${formatBytes(item.originalBytes)} -> ${formatBytes(item.optimizedBytes)}`,
        50,
        y - 12,
        9
      );
    });

    drawText("Cloudinary Transform", 50, 470, 14, rgb(0.1, 0.1, 0.1), bold);
    drawText(result.cloudinary.imageTransform, 50, 450, 10);

    const pdfBytes = await doc.save();
    const pdfBuffer = pdfBytes.buffer.slice(0) as ArrayBuffer;
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "ecolens-report.pdf";
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ec-canvas text-ec-ink">
      <Header />

      <main className="ec-section">
        <div className="ec-container flex flex-col gap-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                Scan workspace
              </p>
              <h1 className="ec-display text-3xl font-semibold md:text-4xl">
                Optimization report
              </h1>
              <p className="mt-2 text-sm text-ec-body">
                Analyze any website and compare the optimized delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/")}
                className="ec-button-secondary"
              >
                Back to home
              </button>
              <button
                onClick={handleDownloadReport}
                className="ec-button-primary"
                disabled={!result}
              >
                Download Report
              </button>
            </div>
          </div>

          <div className="ec-card p-6">
            <form
              onSubmit={handleScanSubmit}
              className="flex flex-col gap-4 md:flex-row md:items-center"
            >
              <input
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                placeholder="Enter a website URL"
                className="ec-input w-full flex-1"
              />
              <button
                type="submit"
                className="ec-button-primary"
              >
                Scan Website
              </button>
            </form>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                  Optimization mode
                </p>
                <p className="mt-1 text-sm text-ec-body">
                  Tune Cloudinary compression strategy.
                </p>
              </div>
              <ModeToggle value={mode} onChange={handleModeChange} />
            </div>
            {error ? (
              <p className="mt-4 text-sm text-ec-error">{error}</p>
            ) : null}
          </div>

          {!authReady ? (
            <div className="ec-card-soft p-6 text-sm text-ec-body">
              Checking authentication...
            </div>
          ) : null}

          {authReady && !authed ? (
            <div className="ec-card p-6">
              <p className="text-sm text-ec-body">
                Sign in to access the scan workspace and generate optimization
                reports.
              </p>
              <button
                onClick={() => window.dispatchEvent(new Event("ec-auth-open"))}
                className="ec-button-primary mt-4"
              >
                Sign In to Continue
              </button>
            </div>
          ) : null}

          {authed && result ? (
            <div className="flex flex-col gap-10">
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="ec-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      Original Version
                    </p>
                    <span className="text-xs text-ec-muted">Live embed</span>
                  </div>
                  <div className="mt-4 h-90 overflow-hidden rounded-lg border border-ec-hairline">
                    <iframe
                      title="Original site"
                      src={result.targetUrl}
                      className="h-full w-full"
                    />
                  </div>
                </div>
                <div className="ec-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      Optimized with Cloudinary
                    </p>
                    <span className="text-xs text-ec-muted">AI enhanced</span>
                  </div>
                  <div className="mt-4 h-90 overflow-hidden rounded-lg border border-ec-hairline">
                    <iframe
                      title="Optimized preview"
                      srcDoc={result.optimizedHtml}
                      className="h-full w-full bg-white"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="ec-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Before vs after
                      </p>
                      <h2 className="ec-display mt-2 text-2xl font-semibold">
                        Media performance comparison
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-ec-ink">
                      {formatPercent(result.metrics.reductionPercent)} lighter
                    </span>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Total media size
                      </p>
                      <p className="mt-2 text-lg font-semibold text-ec-ink">
                        {formatBytes(result.totals.originalBytes)}
                      </p>
                      <p className="text-xs text-ec-muted">
                        Optimized to {formatBytes(result.totals.optimizedBytes)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Media count
                      </p>
                      <p className="mt-2 text-lg font-semibold text-ec-ink">
                        {result.totals.imageCount} images
                      </p>
                      <p className="text-xs text-ec-muted">
                        {result.totals.videoCount} videos
                      </p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Load time impact
                      </p>
                      <p className="mt-2 text-lg font-semibold text-ec-ink">
                        {formatPercent(result.metrics.loadTimeImprovementPercent)}
                      </p>
                      <p className="text-xs text-ec-muted">Estimated improvement</p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Format shift
                      </p>
                      <p className="mt-2 text-lg font-semibold text-ec-ink">
                        JPEG to AVIF
                      </p>
                      <p className="text-xs text-ec-muted">Auto format delivery</p>
                    </div>
                  </div>
                  <div className="mt-6 h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            color: "#111111",
                          }}
                        />
                        <Bar dataKey="value" fill="#111111" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="ec-card p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                    Sustainability report
                  </p>
                  <h2 className="ec-display mt-2 text-2xl font-semibold">
                    Carbon impact
                  </h2>
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Total reduction
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-ec-ink">
                        {formatPercent(result.metrics.reductionPercent)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Bandwidth saved
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-ec-ink">
                        {result.metrics.bandwidthSavedMb.toFixed(2)} MB
                      </p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-canvas p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        CO2 saved
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-ec-ink">
                        {result.metrics.co2SavedGrams.toFixed(2)} g
                      </p>
                    </div>
                    <div className="rounded-lg border border-ec-hairline bg-ec-surface-soft p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                        Eco score
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-ec-ink">
                        {result.metrics.ecoScoreBefore} to {result.metrics.ecoScoreAfter}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ec-card p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      Top offenders
                    </p>
                    <h2 className="ec-display mt-2 text-2xl font-semibold">
                      Heaviest assets to optimize first
                    </h2>
                  </div>
                  <p className="text-xs text-ec-muted">
                    Sorted by estimated savings
                  </p>
                </div>
                <div className="mt-6 overflow-hidden rounded-lg border border-ec-hairline">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-ec-surface-soft text-xs uppercase tracking-[0.2em] text-ec-muted">
                      <tr>
                        <th className="px-4 py-3">URL</th>
                        <th className="px-4 py-3">Original</th>
                        <th className="px-4 py-3">Optimized</th>
                        <th className="px-4 py-3">Suggestion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.topOffenders.map((item) => (
                        <tr key={item.id} className="border-t border-ec-hairline">
                          <td className="px-4 py-3 text-xs text-ec-body">
                            {item.originalUrl}
                          </td>
                          <td className="px-4 py-3 text-xs text-ec-muted">
                            {formatBytes(item.originalBytes)}
                          </td>
                          <td className="px-4 py-3 text-xs text-ec-muted">
                            {formatBytes(item.optimizedBytes)}
                          </td>
                          <td className="px-4 py-3 text-xs text-ec-ink">
                            Convert to {item.formatAfter}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="ec-card p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                    Cloudinary transformation inspector
                  </p>
                  <h2 className="ec-display mt-2 text-2xl font-semibold">
                    Transformation chain
                  </h2>
                  <p className="mt-3 text-sm text-ec-body">
                    Each asset is routed through Cloudinary fetch with AI
                    cropping and auto enhancements.
                  </p>
                  <div className="mt-4 rounded-lg border border-ec-hairline bg-ec-canvas p-4 text-xs text-ec-ink">
                    {result.cloudinary.imageTransform}
                  </div>
                  <p className="mt-4 text-xs text-ec-muted">Example URL:</p>
                  <div className="mt-2 rounded-lg border border-ec-hairline bg-ec-canvas p-4 text-xs text-ec-ink">
                    https://res.cloudinary.com/{result.cloudinary.cloudName}/image/fetch/{
                      result.cloudinary.imageTransform
                    }/IMAGE_URL
                  </div>
                </div>
                <div className="ec-card p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                    Integration
                  </p>
                  <h2 className="ec-display mt-2 text-2xl font-semibold">
                    Apply optimization to your site
                  </h2>
                  <p className="mt-3 text-sm text-ec-body">
                    Copy optimized URLs or inject the EcoLens SDK to replace all
                    images dynamically.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      SDK snippet
                    </p>
                    <CopyButton value={SDK_SNIPPET} />
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-ec-hairline bg-ec-canvas p-4 text-xs font-mono text-ec-ink">
                    <code>{SDK_SNIPPET}</code>
                  </pre>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      JS image rewrite
                    </p>
                    <CopyButton value={integrationSnippet} />
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-ec-hairline bg-ec-canvas p-4 text-xs font-mono text-ec-ink">
                    <code>{integrationSnippet}</code>
                  </pre>
                </div>
              </section>

              <section className="ec-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                      Optimized assets
                    </p>
                    <h2 className="ec-display mt-2 text-2xl font-semibold">
                      Copy optimized image URLs
                    </h2>
                  </div>
                  <CopyButton
                    value={result.media
                      .filter((item) => item.type === "image")
                      .map((item) => item.optimizedUrl)
                      .join("\n")}
                    label="Copy all"
                  />
                </div>
                <div className="mt-4 grid gap-3">
                  {result.media.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-ec-hairline bg-ec-canvas p-3"
                    >
                      <p className="text-xs text-ec-muted">{item.originalUrl}</p>
                      <p className="mt-2 break-all text-xs text-ec-ink">
                        {item.optimizedUrl}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>

        {loading && authed ? (
          <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/90 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-ec-ink border-t-transparent" />
            <p className="mt-4 text-lg font-semibold text-ec-ink">
              Analyzing website and optimizing media...
            </p>
            <p className="mt-2 text-sm text-ec-muted">
              Real-time Cloudinary transformations in progress.
            </p>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
