"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "EcoLens helped us cut our page weight in half without touching our design. Our users noticed the speed improvement immediately.",
    name: "Priya Mehta",
    role: "Frontend Engineer, Vercel",
    initials: "PM",
    color: "#fb923c",
  },
  {
    quote:
      "We did not realise how much bandwidth we were wasting until we used EcoLens. The carbon savings report alone justified the switch.",
    name: "James Rucker",
    role: "CTO, GreenStack",
    initials: "JR",
    color: "#8b5cf6",
  },
  {
    quote:
      "Integration took minutes. The impact was immediate. Our Lighthouse score went from 62 to 94 overnight.",
    name: "Aiko Tanaka",
    role: "Indie Builder & OSS Contributor",
    initials: "AT",
    color: "#ec4899",
  },
  {
    quote:
      "The before/after comparison view is brilliant. Clients can see exactly what they are getting — no hand-waving required.",
    name: "Lucas Ferreira",
    role: "Product Lead, Cloudify",
    initials: "LF",
    color: "#34d399",
  },
  {
    quote:
      "Every SaaS product should ship with something like EcoLens. It is like a performance audit that never sleeps.",
    name: "Sara Okafor",
    role: "Head of Engineering, Loopback",
    initials: "SO",
    color: "#3b82f6",
  },
];

function Avatar({
  initials,
  color,
}: {
  initials: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ background: color }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export default function Testimonials() {
  const count = TESTIMONIALS.length;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count]
  );
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);

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

  const getIndex = (offset: number) => (active + offset + count) % count;

  return (
    <section id="testimonials" className="ec-section border-t border-ec-hairline-soft">
      <div className="ec-container">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ec-hairline bg-ec-surface-soft px-3 py-1 text-xs font-medium text-ec-muted">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Testimonials
          </span>

          <h2 className="ec-display mx-auto mt-4 max-w-lg text-4xl font-semibold leading-tight text-ec-ink md:text-5xl">
            Don&rsquo;t just take our word for it
          </h2>
          <p className="mt-3 text-sm text-ec-muted">
            Our users are our best ambassadors. Discover why EcoLens is the top
            choice for sustainable media delivery.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative mt-14 flex items-center justify-center"
          role="region"
          aria-label="Testimonials carousel"
          aria-live="polite"
        >
          {/* Left ghost */}
          <div
            className="pointer-events-none absolute left-0 hidden w-64 select-none opacity-40 blur-[1px] transition-all duration-500 lg:block xl:w-72"
            aria-hidden="true"
          >
            <TestimonialCard item={TESTIMONIALS[getIndex(-1)]} muted />
          </div>

          {/* Center active card */}
          <div
            key={active}
            className="relative z-10 w-full max-w-md transition-all duration-500"
          >
            <TestimonialCard item={TESTIMONIALS[active]} />
          </div>

          {/* Right ghost */}
          <div
            className="pointer-events-none absolute right-0 hidden w-64 select-none opacity-40 blur-[1px] transition-all duration-500 lg:block xl:w-72"
            aria-hidden="true"
          >
            <TestimonialCard item={TESTIMONIALS[getIndex(1)]} muted />
          </div>
        </div>

        {/* Nav controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {/* Prev button */}
          <button
            id="testimonials-prev"
            onClick={() => { prev(); resetTimer(); }}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft active:bg-ec-surface-card"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1.5" role="tablist" aria-label="Testimonial slides">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                id={`testimonial-dot-${i}`}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => { setActive(i); resetTimer(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-ec-ink"
                    : "w-1.5 bg-ec-surface-strong"
                }`}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            id="testimonials-next"
            onClick={() => { next(); resetTimer(); }}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft active:bg-ec-surface-card"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  item,
  muted = false,
}: {
  item: (typeof TESTIMONIALS)[number];
  muted?: boolean;
}) {
  return (
    <div
      className={`ec-card p-6 ${muted ? "" : "shadow-sm"}`}
      style={
        muted
          ? undefined
          : { boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }
      }
    >
      {/* Stars */}
      <div className="flex gap-0.5" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="#fb923c"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="mt-4 text-sm leading-relaxed text-ec-body">
        &ldquo;{item.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="mt-5 flex items-center gap-3">
        <Avatar initials={item.initials} color={item.color} />
        <div>
          <p className="text-sm font-semibold text-ec-ink">{item.name}</p>
          <p className="text-xs text-ec-muted">{item.role}</p>
        </div>
      </div>
    </div>
  );
}
