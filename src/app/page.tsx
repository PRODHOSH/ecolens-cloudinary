"use client";

import { useEffect } from "react";
import CopyButton from "@/components/CopyButton";
import DotGrid from "@/components/DotGrid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Testimonials from "@/components/Testimonials";

const SDK_SNIPPET = `<script src="https://ecolens.app/sdk.js"></script>
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
                <h1 className="ec-display mt-6 text-4xl font-semibold leading-tight md:text-6xl">
                  Cut Website Weight. Not Quality.
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
                  <a href="#how" className="ec-button-secondary">
                    See How It Works
                  </a>
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
                    className="w-full max-w-xs flex-shrink-0 md:w-72"
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

          {/* ─── How it works + Feature grid ─────────────────────── */}
          <section id="how" className="ec-section">
            <div className="ec-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="ec-card p-8" data-reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                  Cloudinary engine
                </p>
                <h2 className="ec-display mt-4 text-3xl font-semibold">
                  Powered by Cloudinary&apos;s Intelligent Media Pipeline
                </h2>
                <p className="mt-4 text-sm text-ec-body">
                  EcoLens leverages Cloudinary to automatically transform,
                  optimize, and deliver media in the most efficient way possible.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-ec-body">
                  <li>Automatic format selection (WebP, AVIF)</li>
                  <li>Smart quality optimization</li>
                  <li>Responsive delivery across devices</li>
                  <li>AI-powered cropping and enhancement</li>
                  <li>Real-time media transformation</li>
                </ul>
                <p className="mt-6 text-sm font-semibold text-ec-ink">
                  Enterprise-grade media optimization, made accessible.
                </p>
              </div>
              <div id="features">
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted" data-reveal>
                  Feature set
                </p>
                <h2 className="ec-display mt-4 text-3xl font-semibold md:text-4xl" data-reveal data-reveal-delay="100">
                  Everything You Need to Optimize at Scale
                </h2>
                {/* Numbered bento feature list */}
                <div className="mt-8 space-y-3">
                  {[
                    { n: "01", title: "Real-Time Website Analysis", detail: "Scan any public URL — EcoLens extracts every media asset and scores them for size, format, and delivery efficiency instantly.", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                    { n: "02", title: "Before / After Comparison", detail: "Side-by-side visual diff of original vs Cloudinary-optimized delivery. Clients see it. No explanation needed.", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" },
                    { n: "03", title: "Performance Insights", detail: "Get a breakdown of bandwidth saved, estimated load time improvement, and Lighthouse score delta — per page.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                    { n: "04", title: "Carbon Impact Tracking", detail: "Translate bytes saved into grams of CO₂ avoided. Make sustainability tangible for your team and your users.", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                    { n: "05", title: "AI Media Optimization", detail: "Cloudinary's AI auto-selects WebP/AVIF, smart-crops, quality-tuned, and delivers responsive sizes — zero config.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { n: "06", title: "One-Line Integration", detail: "Drop a single script tag. EcoLens rewrites image URLs on the fly — no build step, no CDN migration required.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
                  ].map((f, i) => (
                    <div
                      key={f.n}
                      className="group flex items-start gap-4 rounded-xl border border-ec-hairline bg-ec-canvas px-5 py-4 transition-shadow hover:shadow-sm"
                      data-reveal
                      data-reveal-delay={String(Math.min(i * 80, 400))}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    >
                      <span className="mt-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-ec-muted">{f.n}</span>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ec-hairline bg-ec-surface-soft text-ec-ink">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={f.icon} /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ec-ink">{f.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-ec-muted">{f.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>



          {/* ─── SDK ──────────────────────────────────────────────── */}
          <section className="ec-section border-t border-ec-hairline-soft">
            <div className="ec-container grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
              <div data-reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">SDK integration</p>
                <h2 className="ec-display mt-4 text-3xl font-semibold">Add EcoLens in Seconds</h2>
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
`}<span style={{ color: "#3b82f6" }}>&lt;script</span>{" "}<span style={{ color: "#6b7280" }}>src</span>=<span style={{ color: "#10b981" }}>"https://ecolens.app/sdk.js"</span><span style={{ color: "#3b82f6" }}>&gt;&lt;/script&gt;</span>{`
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
                <h2 className="ec-display text-3xl font-semibold md:text-4xl">The Numbers Speak</h2>
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
          <section className="ec-section overflow-hidden">
            <div className="ec-container">
              <div className="text-center" data-reveal>
                <h2 className="ec-display text-3xl font-semibold md:text-4xl">
                  Built for Modern Product Ecosystems
                </h2>
                <p className="mt-3 text-sm text-ec-muted">
                  Three audiences. One platform. Zero compromises.
                </p>
              </div>

              {/* Orbital ring diagram */}
              <div
                className="relative mx-auto mt-16 flex items-center justify-center"
                style={{ height: "480px", maxWidth: "560px" }}
                data-reveal
                data-reveal-delay="150"
              >
                {/* SVG connection lines */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 560 480"
                  fill="none"
                  aria-hidden="true"
                >
                  {/* lines from center to each node */}
                  <line x1="280" y1="240" x2="280" y2="68" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" />
                  <line x1="280" y1="240" x2="108" y2="372" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" style={{ animationDelay: "0.3s" }} />
                  <line x1="280" y1="240" x2="452" y2="372" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" style={{ animationDelay: "0.6s" }} />
                  {/* outer triangle connecting nodes */}
                  <line x1="280" y1="68" x2="108" y2="372" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" style={{ animationDelay: "0.9s" }} />
                  <line x1="108" y1="372" x2="452" y2="372" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" style={{ animationDelay: "1.2s" }} />
                  <line x1="452" y1="372" x2="280" y2="68" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" className="ec-line-march" style={{ animationDelay: "1.5s" }} />
                </svg>

                {/* Center nexus */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="ec-nexus-pulse h-10 w-10 rounded-full border-2 border-ec-hairline bg-ec-canvas flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-ec-ink" />
                  </div>
                </div>

                {/* Node — top center: Developer tools */}
                <div className="absolute" style={{ top: "20px", left: "50%", transform: "translateX(-50%)" }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="ec-orbit-ring flex h-28 w-28 flex-col items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas shadow-sm" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink" aria-hidden="true">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ec-muted">Dev</span>
                    </div>
                    <p className="text-sm font-semibold text-ec-ink">Developer tools</p>
                    <p className="max-w-[140px] text-center text-xs text-ec-muted">SDKs, APIs, and CLI integrations</p>
                  </div>
                </div>

                {/* Node — bottom left: SaaS platforms */}
                <div className="absolute" style={{ bottom: "20px", left: "60px" }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="ec-orbit-ring flex h-28 w-28 flex-col items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)", animationDelay: "0.6s" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink" aria-hidden="true">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ec-muted">SaaS</span>
                    </div>
                    <p className="text-sm font-semibold text-ec-ink">SaaS platforms</p>
                    <p className="max-w-[140px] text-center text-xs text-ec-muted">Drop-in media pipelines at scale</p>
                  </div>
                </div>

                {/* Node — bottom right: AI-first */}
                <div className="absolute" style={{ bottom: "20px", right: "60px" }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="ec-orbit-ring flex h-28 w-28 flex-col items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)", animationDelay: "1.2s" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ec-ink" aria-hidden="true">
                        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
                      </svg>
                      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-ec-muted">AI</span>
                    </div>
                    <p className="text-sm font-semibold text-ec-ink">AI-first products</p>
                    <p className="max-w-[140px] text-center text-xs text-ec-muted">Smart delivery for AI-generated assets</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── CTA ──────────────────────────────────────────────── */}
          <section id="pricing" className="ec-section">
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
                  <button
                    onClick={() =>
                      window.dispatchEvent(new Event("ec-auth-open"))
                    }
                    className="ec-button-secondary"
                  >
                    Get Started Free
                  </button>
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
