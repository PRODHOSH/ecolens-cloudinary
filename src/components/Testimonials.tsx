"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "EcoLens cut our page weight in half overnight. No design changes, no refactoring — just pure, automatic media optimisation from day one.",
    name: "Priya Mehta",
    role: "Frontend Engineer, Vercel",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    quote:
      "We had no idea how much bandwidth we were wasting. EcoLens made the problem visible and fixed it at the same time. Absolute game changer.",
    name: "James Rucker",
    role: "CTO, GreenStack",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    quote:
      "Integration took under five minutes. Our Lighthouse score jumped from 62 to 94 and our hosting bill dropped by a third. Remarkable tool.",
    name: "Aiko Tanaka",
    role: "Indie Builder & OSS Contributor",
    avatar: "https://i.pravatar.cc/80?img=45",
  },
  {
    quote:
      "The before-and-after comparison view sells itself to clients instantly. No hand-waving, no spreadsheets — just undeniable visual proof.",
    name: "Lucas Ferreira",
    role: "Product Lead, Cloudify",
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  {
    quote:
      "Every modern product should ship with EcoLens built in. It is like a performance engineer that watches your media pipeline around the clock.",
    name: "Sara Okafor",
    role: "Head of Engineering, Loopback",
    avatar: "https://i.pravatar.cc/80?img=44",
  },
];

const CARD_W = 440;
const SIDE_W = 200;
const GAP = 24;

export default function Testimonials() {
  const count = TESTIMONIALS.length;
  const [active, setActive] = useState(0);
  const [containerW, setContainerW] = useState(960);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // measure container
  useEffect(() => {
    const measure = () => {
      if (containerRef.current)
        setContainerW(containerRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, 5000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, resetTimer]);

  // The track starts so that card[0]'s left edge is at (containerW/2 - CARD_W/2)
  // Then we slide left by active * (CARD_W + GAP)
  const centreOffset = containerW / 2 - CARD_W / 2;
  const trackX = centreOffset - active * (CARD_W + GAP);

  return (
    <section
      id="testimonials"
      className="ec-section border-t border-ec-hairline-soft"
    >
      {/* Header */}
      <div className="ec-container">
        <div className="text-center" data-reveal>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ec-hairline bg-ec-surface-soft px-3 py-1 text-xs font-medium text-ec-muted">
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Testimonials
          </span>
          <h2 className="ec-display mx-auto mt-4 max-w-xl text-4xl font-semibold leading-tight text-ec-ink md:text-5xl">
            Don&rsquo;t just take our word for it
          </h2>
          <p className="mt-3 text-sm text-ec-muted">
            Our users are our best ambassadors. Discover why EcoLens is the top
            choice for sustainable media delivery.
          </p>
        </div>
      </div>

      {/* Sliding track */}
      <div
        ref={containerRef}
        className="relative mt-14 overflow-hidden"
        style={{ minHeight: "280px" }}
        role="region"
        aria-label="Testimonials"
        aria-live="polite"
      >
        {/* Fade masks */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-36"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.95), transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-36"
          style={{
            background:
              "linear-gradient(to left, rgba(255,255,255,0.95), transparent)",
          }}
          aria-hidden="true"
        />

        {/* Track */}
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(${trackX}px)`,
            transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "transform",
          }}
        >
          {TESTIMONIALS.map((item, i) => {
            const dist = Math.abs(i - active);
            const isActive = i === active;
            return (
              <div
                key={i}
                aria-hidden={!isActive}
                style={{
                  flexShrink: 0,
                  width: CARD_W,
                  opacity: dist === 0 ? 1 : dist === 1 ? 0.3 : 0.1,
                  transform: isActive ? "scale(1)" : "scale(0.97)",
                  transition:
                    "opacity 0.55s ease, transform 0.55s ease",
                  cursor: !isActive ? "pointer" : "default",
                }}
                onClick={() => {
                  if (!isActive) {
                    setActive(i);
                    resetTimer();
                  }
                }}
              >
                {/* Card */}
                <div
                  className="relative rounded-xl border border-ec-hairline bg-ec-canvas p-8"
                  style={{
                    boxShadow: isActive
                      ? "0 4px 16px rgba(0,0,0,0.08)"
                      : "none",
                  }}
                >
                  {/* Corner marks */}
                  <span className="absolute -left-px -top-px text-ec-hairline select-none">+</span>
                  <span className="absolute -right-px -top-px text-ec-hairline select-none">+</span>
                  <span className="absolute -bottom-px -left-px text-ec-hairline select-none">+</span>
                  <span className="absolute -bottom-px -right-px text-ec-hairline select-none">+</span>

                  <p className="text-xl font-semibold leading-snug text-ec-ink">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ec-hairline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ec-ink">{item.name}</p>
                      <p className="text-xs text-ec-muted">{item.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav controls */}
      <div className="ec-container mt-10 flex items-center justify-center gap-4">
        <button
          id="testimonials-prev"
          onClick={() => { prev(); resetTimer(); }}
          aria-label="Previous testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Testimonial slides">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              id={`testimonial-dot-${i}`}
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => { setActive(i); resetTimer(); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-5 bg-ec-ink" : "w-1.5 bg-ec-surface-strong"
              }`}
            />
          ))}
        </div>

        <button
          id="testimonials-next"
          onClick={() => { next(); resetTimer(); }}
          aria-label="Next testimonial"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
