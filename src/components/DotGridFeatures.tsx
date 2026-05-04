"use client";

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="7" strokeOpacity="0.35" />
        <circle cx="12" cy="12" r="11" strokeOpacity="0.15" />
      </svg>
    ),
    label: "Hover Proximity",
    title: "Dots glow as you get close",
    body: "Move your cursor anywhere on the page. Dots within range shift from grey toward a darker tone — a soft radial highlight that follows you silently.",
    rotate: "-4deg",
    translateY: "18px",
    delay: 0,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
        <path d="M2 12c0-1 .4-2 1-2.8" strokeOpacity="0.4" />
        <path d="M2 12c0 1 .4 2 1 2.8" strokeOpacity="0.4" />
      </svg>
    ),
    label: "Inertia Push",
    title: "Speed scatters dots away",
    body: "Swipe your cursor fast and watch nearby dots scatter with momentum. GSAP's InertiaPlugin carries them outward, then elastic physics snaps them home.",
    rotate: "0deg",
    translateY: "-8px",
    delay: 100,
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeOpacity="0.5" />
        <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12" strokeOpacity="0.3" />
      </svg>
    ),
    label: "Click Shockwave",
    title: "Click sends a ripple",
    body: "Click anywhere on the page and a radial shockwave radiates outward, displacing every dot in its path. They spring back with elastic ease.",
    rotate: "4deg",
    translateY: "18px",
    delay: 200,
  },
];

export default function DotGridFeatures() {
  return (
    <section className="ec-section border-t border-ec-hairline-soft" data-reveal>
      <div className="ec-container">
        {/* Header */}
        <div className="text-center" data-reveal>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ec-hairline bg-ec-surface-soft px-3 py-1 text-xs font-medium text-ec-muted">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Interactive Background
          </span>
          <h2 className="ec-display mx-auto mt-4 max-w-md text-4xl font-semibold leading-tight text-ec-ink md:text-5xl">
            The background is alive
          </h2>
          <p className="mt-3 text-sm text-ec-muted">
            Three interaction layers built into every pixel of the canvas.
          </p>
        </div>

        {/* Angled crisscross cards */}
        <div
          className="relative mt-16 flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-0"
          style={{ perspective: "1200px" }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              data-reveal
              data-reveal-delay={f.delay}
              className="w-full max-w-xs flex-shrink-0 md:w-72"
              style={{
                transform: `rotate(${f.rotate}) translateY(${f.translateY})`,
                zIndex: i === 1 ? 10 : 5,
                marginLeft: i === 1 ? "-1.5rem" : undefined,
                marginRight: i === 1 ? "-1.5rem" : undefined,
                transition: "transform 0.3s ease",
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
                {/* Icon badge */}
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ec-hairline bg-ec-surface-soft text-ec-ink">
                  {f.icon}
                </div>

                {/* Label pill */}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  {f.label}
                </p>

                {/* Title */}
                <h3 className="ec-display text-lg font-semibold leading-snug text-ec-ink">
                  {f.title}
                </h3>

                {/* Body */}
                <p className="mt-3 text-sm leading-relaxed text-ec-body">
                  {f.body}
                </p>

                {/* Decorative corner dot */}
                <div className="mt-6 flex justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-ec-surface-strong" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA hint */}
        <p className="mt-16 text-center text-xs text-ec-muted">
          Try it — move fast, click anywhere, hover slowly. Three modes, one canvas.
        </p>
      </div>
    </section>
  );
}
