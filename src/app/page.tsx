"use client";

import { useEffect } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import DotGrid from "@/components/DotGrid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Testimonials from "@/components/Testimonials";

const SDK_SNIPPET = `<script src="https://ecolens-cloudinary.vercel.app/sdk.js"></script>
<script>
  EcoLens.optimize();
</script>`;

export default function Home() {
  // ── Scroll-reveal observer ──────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── DotGrid background — fixed, full viewport, behind everything ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "#ffffff",
        }}
      >
        <DotGrid
          dotSize={2}
          gap={22}
          baseColor="#d1d5db"
          activeColor="#d4d8e0"
          proximity={80}
          shockRadius={180}
          shockStrength={4}
          resistance={750}
          returnDuration={1.5}
          style={{}}
        />
      </div>

      {/* ── Page content — sits above the dot grid ── */}
      <div className="relative z-10 flex min-h-screen flex-col text-ec-ink">
        <Header />

        <main>
          {/* ─── Hero ─────────────────────────────────────────────── */}
          <section id="product" className="ec-section">
            <div className="ec-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div data-reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-ec-muted">
                  EcoLens platform
                </p>
                <h1 className="ec-display mt-6 text-5xl font-black leading-none tracking-tight md:text-7xl">
                  Cut Website Weight.<br className="hidden md:block" /> Not Quality.
                </h1>
                <p className="mt-6 text-lg text-ec-body md:text-xl">
                  EcoLens uses Cloudinary to transform your media into faster,
                  lighter, and more sustainable experiences without changing how
                  your site looks.
                </p>
                <p className="mt-4 text-sm text-ec-muted">
                  Same visuals. Less bandwidth. Lower carbon.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      window.dispatchEvent(new Event("ec-auth-open"))
                    }
                    className="ec-button-primary"
                  >
                    Try Demo
                  </button>
                  <Link href="/docs" className="ec-button-secondary">
                    View Documentation
                  </Link>
                </div>
              </div>
              <div className="ec-card p-8" data-reveal data-reveal-delay="150">
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                  Live impact preview
                </p>
                <h2 className="ec-display mt-4 text-2xl font-semibold">
                  Optimization snapshot
                </h2>
                <div className="mt-6 grid gap-4">
                  {[
                    { label: "Media scanned", value: "142 assets" },
                    { label: "Size reduction", value: "-68%" },
                    { label: "CO2 saved", value: "18.4 g" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border border-ec-hairline bg-ec-canvas px-4 py-3"
                    >
                      <span className="text-sm text-ec-muted">{item.label}</span>
                      <span className="text-sm font-semibold text-ec-ink">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg border border-ec-hairline bg-ec-surface-soft p-4 text-sm text-ec-body">
                  AI cropping, format negotiation, and responsive delivery are
                  applied to every asset.
                </div>
              </div>
            </div>
          </section>

          {/* ─── Problem ──────────────────────────────────────────── */}
          <section className="ec-section border-t border-ec-hairline-soft">
            <div className="ec-container">
              <div className="text-center" data-reveal>
                <h2 className="ec-display text-3xl font-semibold md:text-4xl">
                  Most Websites Are Heavier Than They Need To Be
                </h2>
                <p className="mt-3 text-sm text-ec-muted">
                  The problem is not your content. It is how it is delivered.
                </p>
              </div>

              {/* Crisscross angled cards */}
              <div
                className="relative mt-14 flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-0"
                style={{ perspective: "1200px" }}
              >
                {[
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    ),
                    stat: "~70%",
                    title: "Of page weight is media",
                    body: "Images and videos account for the majority of every web page's total transfer size — most of it never optimised.",
                    rotate: "-4deg",
                    ty: "18px",
                    delay: 0,
                    z: 5,
                    mx: undefined,
                  },
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    ),
                    stat: "3×",
                    title: "Slower load times",
                    body: "Unoptimised media bloats bandwidth costs and tanks performance scores, costing conversions with every extra second.",
                    rotate: "0deg",
                    ty: "-8px",
                    delay: 100,
                    z: 10,
                    mx: "-1.5rem",
                  },
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 2a10 10 0 1 0 10 10" />
                        <path d="M12 6v6l4 2" />
                        <path d="M22 2 12 12" strokeOpacity="0.4" />
                      </svg>
                    ),
                    stat: "18g",
                    title: "CO₂ per unoptimised page",
                    body: "Every unnecessary megabyte burns energy in transit. Smarter delivery means a measurably smaller carbon footprint.",
                    rotate: "4deg",
                    ty: "18px",
                    delay: 200,
                    z: 5,
                    mx: undefined,
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="w-full max-w-xs shrink-0 md:w-72"
                    data-reveal
                    data-reveal-delay={String(card.delay)}
                    style={{
                      transform: `rotate(${card.rotate}) translateY(${card.ty})`,
                      zIndex: card.z,
                      marginLeft: i === 1 ? card.mx : undefined,
                      marginRight: i === 1 ? card.mx : undefined,
                    }}
                  >
                    <div
                      className="rounded-xl border border-ec-hairline bg-ec-canvas p-7"
                      style={{
                        boxShadow:
                          i === 1
                            ? "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)"
                            : "0 2px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ec-hairline bg-ec-surface-soft text-ec-ink">
                        {card.icon}
                      </div>
                      <p className="text-3xl font-semibold text-ec-ink ec-display">
                        {card.stat}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ec-ink">
                        {card.title}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-ec-body">
                        {card.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── How it works + Feature cards ────────────────────── */}
          <section id="how" className="ec-section border-t border-ec-hairline-soft">
            <div className="ec-container">

              {/* Label + heading */}
              <div data-reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">Cloudinary engine</p>
                <h2 id="features" className="ec-display mt-3 max-w-lg text-4xl leading-tight md:text-5xl">
                  Your images,<br />intelligently delivered.
                </h2>
              </div>

              {/* Two column */}
              <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1fr_1.5fr]">

                {/* LEFT — vertical pipeline */}
                <div className="space-y-0" data-reveal data-reveal-delay="100">
                  {[
                    {
                      dot: "bg-ec-surface-soft border border-ec-hairline text-ec-muted",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
                      title: "Your website",
                      desc: "Paste any public URL — EcoLens extracts every image, video, and media asset from the page.",
                    },
                    {
                      dot: "bg-ec-ink border-ec-ink text-white",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                      title: "EcoLens analyses",
                      desc: "Each asset is scored for format, size, compression ratio, and estimated CO₂ cost.",
                    },
                    {
                      dot: "bg-[#eef0fb] border border-[#c5cbf0]",
                      icon: <svg width="20" height="16" viewBox="0 0 48 36" fill="none" aria-hidden="true"><path d="M38.4 13.44C37.92 7.2 32.64 2.4 26.4 2.4C21.6 2.4 17.52 5.04 15.36 8.88C14.4 8.4 13.2 8.16 12 8.16C7.68 8.16 4.08 11.52 3.84 15.84C1.68 16.56 0 18.48 0 20.88C0 23.76 2.4 26.16 5.28 26.16H38.16C42.48 26.16 46.08 22.56 46.08 18.24C46.08 14.4 43.68 11.04 40.08 10.08L38.4 13.44Z" fill="#3448C5"/><path d="M24 10L18 18H22V26H26V18H30L24 10Z" fill="white"/></svg>,
                      title: "Cloudinary optimises",
                      desc: "Auto-selects WebP / AVIF, smart-crops, quality-tunes, and delivers via global CDN.",
                    },
                    {
                      dot: "bg-emerald-50 border border-emerald-200 text-emerald-600",
                      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                      title: "Faster. Lighter. Greener.",
                      desc: "Up to 80% smaller files, 3× faster loads, and measurably less CO₂ per page view.",
                    },
                  ].map((step, i, arr) => (
                    <div key={step.title} className="relative flex gap-4">
                      {/* Dashed connector line (not last) */}
                      {i < arr.length - 1 && (
                        <div
                          className="absolute top-10 w-px"
                          style={{
                            left: "19px",
                            bottom: "-8px",
                            background: "repeating-linear-gradient(to bottom, #e5e7eb 0, #e5e7eb 4px, transparent 4px, transparent 10px)",
                          }}
                          aria-hidden="true"
                        />
                      )}
                      {/* Node */}
                      <div className={`relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.dot}`}>
                        {step.icon}
                      </div>
                      {/* Content */}
                      <div className="pb-9">
                        <p className="text-sm font-bold text-ec-ink">{step.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ec-muted">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RIGHT — 2×3 feature cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Real-Time Analysis",  sub: "Scan any public URL and get a full media audit in seconds.",          bg: "bg-blue-50",    border: "border-blue-100",    stroke: "#3b82f6" },
                    { icon: "M8 7h12m0 0l-4-4m4 4-4 4m0 6H4m0 0 4 4m-4-4 4-4",                                                                                                 label: "Before / After",    sub: "Visual diff of original vs Cloudinary-optimised delivery.",        bg: "bg-violet-50", border: "border-violet-100", stroke: "#7c3aed" },
                    { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",   label: "Performance Score", sub: "Bandwidth saved, load time delta, and Lighthouse impact.",        bg: "bg-amber-50",  border: "border-amber-100",  stroke: "#d97706" },
                    { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",                                         label: "Carbon Tracking",   sub: "Translate bytes saved into grams of CO₂ avoided, per page.",     bg: "bg-emerald-50",border: "border-emerald-100",stroke: "#059669" },
                    { icon: "M13 10V3L4 14h7v7l9-11h-7z",                                                                                                                         label: "AI Optimisation",   sub: "Cloudinary AI picks the best format, crop, and quality — automatically.", bg: "bg-rose-50",   border: "border-rose-100",   stroke: "#e11d48" },
                    { icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",                                                                                                             label: "One-Line Setup",    sub: "A single script tag — no build step, no migration, instant results.", bg: "bg-cyan-50",   border: "border-cyan-100",   stroke: "#0891b2" },
                  ].map((f, i) => (
                    <div
                      key={f.label}
                      className="group rounded-xl border border-ec-hairline bg-ec-canvas p-4 transition-shadow hover:shadow-sm"
                      data-reveal
                      data-reveal-delay={String(Math.min(i * 70, 350))}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    >
                      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${f.border} ${f.bg}`}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={f.icon}/>
                        </svg>
                      </div>
                      <p className="mt-3 text-sm font-bold text-ec-ink">{f.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ec-muted">{f.sub}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>



          {/* ─── SDK ──────────────────────────────────────────────── */}
          <section id="sdk" className="ec-section border-t border-ec-hairline-soft">
            <div className="ec-container grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
              <div data-reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">SDK integration</p>
                <h2 className="ec-display mt-4 text-3xl">Two tags. Live in 60 seconds.</h2>
                <p className="mt-4 text-sm text-ec-body">One script tag. Zero refactoring. Instant Cloudinary-powered delivery for every image on your page.</p>
                <div className="mt-8 space-y-3">
                  {[
                    { icon: "M5 13l4 4L19 7", label: "No build step required" },
                    { icon: "M5 13l4 4L19 7", label: "Works on any HTML page" },
                    { icon: "M5 13l4 4L19 7", label: "Live in under 60 seconds" },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ec-ink">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={step.icon} /></svg>
                      </div>
                      <span className="text-sm text-ec-body">{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Terminal card */}
              <div className="overflow-hidden rounded-xl border border-ec-hairline" data-reveal data-reveal-delay="150">
                {/* Terminal chrome */}
                <div className="flex items-center gap-1.5 border-b border-ec-hairline bg-ec-surface-soft px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-ec-muted">index.html</span>
                  <div className="ml-auto">
                    <CopyButton value={SDK_SNIPPET} />
                  </div>
                </div>
                <pre className="overflow-x-auto bg-ec-canvas p-5 text-sm font-mono leading-relaxed text-ec-ink">
                  <code><span className="text-ec-muted">{"<!-- Add before </body> -->"}</span>{`
`}<span style={{ color: "#3b82f6" }}>&lt;script</span>{" "}<span style={{ color: "#6b7280" }}>src</span>=<span style={{ color: "#10b981" }}>&quot;https://ecolens-cloudinary.vercel.app/sdk.js&quot;</span><span style={{ color: "#3b82f6" }}>&gt;&lt;/script&gt;</span>{`
`}<span style={{ color: "#3b82f6" }}>&lt;script&gt;</span>{`
  `}<span style={{ color: "#8b5cf6" }}>EcoLens</span>.<span style={{ color: "#f59e0b" }}>optimize</span>();{`
`}<span style={{ color: "#3b82f6" }}>&lt;/script&gt;</span></code>
                </pre>
              </div>
            </div>
          </section>

          {/* ─── Impact ───────────────────────────────────────────── */}
          <section className="ec-section border-t border-ec-hairline-soft">
            <div className="ec-container">
              <div className="text-center" data-reveal>
                <h2 className="ec-display text-3xl md:text-4xl">The numbers don&rsquo;t lie.</h2>
                <p className="mt-3 text-sm text-ec-muted">Better performance. Lower cost. Smaller footprint.</p>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { stat: "80%", label: "Smaller media", sub: "Average size reduction per optimised asset", bar: 80 },
                  { stat: "3×", label: "Faster loads", sub: "Typical improvement in page load time", bar: 75 },
                  { stat: "68%", label: "Less bandwidth", sub: "Reduction in bytes transferred to users", bar: 68 },
                  { stat: "18g", label: "CO₂ saved / page", sub: "Carbon avoided per optimised page load", bar: 60 },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="flex flex-col rounded-xl border border-ec-hairline bg-ec-canvas p-6"
                    data-reveal
                    data-reveal-delay={String(i * 100)}
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                  >
                    <p className="ec-display text-5xl font-semibold text-ec-ink">{s.stat}</p>
                    <p className="mt-2 text-sm font-semibold text-ec-ink">{s.label}</p>
                    <p className="mt-1 text-xs text-ec-muted">{s.sub}</p>
                    {/* Progress bar */}
                    <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-ec-surface-strong">
                      <div
                        className="ec-stat-bar h-full rounded-full bg-ec-ink"
                        style={{ "--bar-w": `${s.bar}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Testimonials ─────────────────────────────────────── */}
          <Testimonials />

          {/* ─── Ecosystem ────────────────────────────────────────── */}
          <section id="workflows" className="ec-section overflow-hidden border-t border-ec-hairline-soft">
            <div className="ec-container">
              <div className="text-center" data-reveal>
                <h2 className="ec-display text-3xl font-semibold md:text-4xl">
                  Optimized for Every Workflow
                </h2>
                <p className="mt-3 text-sm text-ec-muted">
                  Three ways to deliver lightning-fast media. Zero configuration required.
                </p>
              </div>

              <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3">
                {/* SDK */}
                <div className="flex flex-col items-center text-center" data-reveal data-reveal-delay="100">
                  <div className="group relative mb-8 flex h-40 w-40 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas shadow-sm transition-all hover:border-ec-brand hover:shadow-xl">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-ec-brand/5 opacity-0 group-hover:opacity-100" />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink transition-colors group-hover:text-ec-brand">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <h3 className="ec-display text-xl font-bold">Runtime SDK</h3>
                  <p className="mt-2 text-sm text-ec-muted max-w-[200px]">Drop a single script tag to optimize assets instantly in the browser.</p>
                </div>

                {/* CLI */}
                <div className="flex flex-col items-center text-center" data-reveal data-reveal-delay="250">
                  <div className="group relative mb-8 flex h-40 w-40 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas shadow-sm transition-all hover:border-ec-brand hover:shadow-xl">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-ec-brand/5 opacity-0 group-hover:opacity-100" style={{ animationDelay: "0.5s" }} />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink transition-colors group-hover:text-ec-brand">
                      <polyline points="4 17 10 11 4 5" />
                      <line x1="12" y1="19" x2="20" y2="19" />
                    </svg>
                  </div>
                  <h3 className="ec-display text-xl font-bold">EcoLens CLI</h3>
                  <p className="mt-2 text-sm text-ec-muted max-w-[200px]">Optimize local repositories and assets with a simple terminal command.</p>
                </div>

                {/* GitHub PR */}
                <div className="flex flex-col items-center text-center" data-reveal data-reveal-delay="400">
                  <div className="group relative mb-8 flex h-40 w-40 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas shadow-sm transition-all hover:border-ec-brand hover:shadow-xl">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-ec-brand/5 opacity-0 group-hover:opacity-100" style={{ animationDelay: "1s" }} />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink transition-colors group-hover:text-ec-brand">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </div>
                  <h3 className="ec-display text-xl font-bold">GitHub PRs</h3>
                  <p className="mt-2 text-sm text-ec-muted max-w-[200px]">Automatically refactor codebases via intelligent, eco-conscious pull requests.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── CTA ──────────────────────────────────────────────── */}
          <section id="start" className="ec-section">
            <div className="ec-container">
              <div className="ec-card p-10 text-center" data-reveal>
                <h2 className="ec-display text-3xl font-semibold md:text-4xl">
                  Start Optimizing Your Website Today
                </h2>
                <p className="mt-4 text-sm text-ec-body">
                  Join a new generation of faster, lighter, and more efficient
                  web experiences.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() =>
                      window.dispatchEvent(new Event("ec-auth-open"))
                    }
                    className="ec-button-primary"
                  >
                    Try Demo
                  </button>
                  <Link href="/docs" className="ec-button-secondary">
                    Read the Docs
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
