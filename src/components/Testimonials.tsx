"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// All quotes are normalised to ~140 chars so every card is the same height.
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

export default function Testimonials() {
  const count = TESTIMONIALS.length;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setActive((i) => (i - 1 + count) % count),
    [count]
  );

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, 5000);
  }, [next]);

  useEffect(() => {
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, scheduleNext]);

  const getIdx = (offset: number) => (active + offset + count) % count;
  const leftItem = TESTIMONIALS[getIdx(-1)];
  const centerItem = TESTIMONIALS[active];
  const rightItem = TESTIMONIALS[getIdx(1)];

  return (
    <section
      id="testimonials"
      className="ec-section border-t border-ec-hairline-soft"
    >
      <div className="ec-container">
        {/* ── Header ── */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ec-hairline bg-ec-surface-soft px-3 py-1 text-xs font-medium text-ec-muted">
            <svg
              width="11"
              height="11"
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

          <h2 className="ec-display mx-auto mt-4 max-w-xl text-4xl font-semibold leading-tight text-ec-ink md:text-5xl">
            Don&rsquo;t just take our word for it
          </h2>
          <p className="mt-3 text-sm text-ec-muted">
            Our users are our best ambassadors. Discover why EcoLens is the top
            choice for sustainable media delivery.
          </p>
        </div>

        {/* ── Carousel stage ── */}
        <div
          className="relative mt-14 flex items-stretch justify-center gap-0"
          role="region"
          aria-label="Testimonials"
          aria-live="polite"
        >
          {/* Left ghost — text only, faded */}
          <div
            className="hidden w-56 shrink-0 select-none overflow-hidden pr-8 pt-6 lg:block xl:w-72"
            aria-hidden="true"
          >
            <p className="text-xl font-semibold leading-snug text-ec-ink opacity-20 line-clamp-4">
              &ldquo;{leftItem.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-2.5 opacity-20">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-ec-surface-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leftItem.avatar}
                  alt={leftItem.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-ec-ink">
                  {leftItem.name}
                </p>
                <p className="text-xs text-ec-muted">{leftItem.role}</p>
              </div>
            </div>
          </div>

          {/* Center card with corner brackets */}
          <div className="relative w-full max-w-md shrink-0">
            {/* Corner marks — top-left */}
            <span className="absolute -left-px -top-px z-10 select-none text-ec-hairline">
              +
            </span>
            {/* Corner marks — top-right */}
            <span className="absolute -right-px -top-px z-10 select-none text-ec-hairline">
              +
            </span>
            {/* Corner marks — bottom-left */}
            <span className="absolute -bottom-px -left-px z-10 select-none text-ec-hairline">
              +
            </span>
            {/* Corner marks — bottom-right */}
            <span className="absolute -bottom-px -right-px z-10 select-none text-ec-hairline">
              +
            </span>

            {/* The card itself */}
            <div
              key={active}
              className="rounded-xl border border-ec-hairline bg-ec-canvas p-8 shadow-sm"
              style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}
            >
              <p className="text-xl font-semibold leading-snug text-ec-ink">
                &ldquo;{centerItem.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ec-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={centerItem.avatar}
                    alt={centerItem.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ec-ink">
                    {centerItem.name}
                  </p>
                  <p className="text-xs text-ec-muted">{centerItem.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right ghost — text only, faded */}
          <div
            className="hidden w-56 shrink-0 select-none overflow-hidden pl-8 pt-6 lg:block xl:w-72"
            aria-hidden="true"
          >
            <p className="text-xl font-semibold leading-snug text-ec-ink opacity-20 line-clamp-4">
              &ldquo;{rightItem.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-2.5 opacity-20">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-ec-surface-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rightItem.avatar}
                  alt={rightItem.name}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-ec-ink">
                  {rightItem.name}
                </p>
                <p className="text-xs text-ec-muted">{rightItem.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav controls ── */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            id="testimonials-prev"
            onClick={() => {
              prev();
              scheduleNext();
            }}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Testimonial slides"
          >
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                id={`testimonial-dot-${i}`}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => {
                  setActive(i);
                  scheduleNext();
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-5 bg-ec-ink"
                    : "w-1.5 bg-ec-surface-strong"
                }`}
              />
            ))}
          </div>

          <button
            id="testimonials-next"
            onClick={() => {
              next();
              scheduleNext();
            }}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ec-hairline bg-ec-canvas text-ec-ink transition-colors hover:bg-ec-surface-soft"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
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
