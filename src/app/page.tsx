"use client";

import CopyButton from "@/components/CopyButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const SDK_SNIPPET = `<script src="https://ecolens.app/sdk.js"></script>
<script>
  EcoLens.optimize();
</script>`;

const TESTIMONIALS = [
  {
    quote:
      "EcoLens helped us cut our page weight in half without touching our design.",
    author: "Frontend Engineer",
  },
  {
    quote:
      "We did not realize how much bandwidth we were wasting until we used EcoLens.",
    author: "Product Team",
  },
  {
    quote: "Integration took minutes. The impact was immediate.",
    author: "Indie Builder",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ec-canvas text-ec-ink">
      <Header />

      <main>
        <section id="product" className="ec-section">
          <div className="ec-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
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
            <div className="ec-card p-8">
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

        <section className="ec-section border-t border-ec-hairline-soft">
          <div className="ec-container">
            <h2 className="ec-display text-3xl font-semibold md:text-4xl">
              Most Websites Are Heavier Than They Need To Be
            </h2>
            <div className="mt-6 grid gap-4 text-ec-body md:grid-cols-3">
              <p>
                Images and videos account for the majority of web page weight.
              </p>
              <p>
                Unoptimized media slows down load times and increases bandwidth
                costs.
              </p>
              <p>
                Every unnecessary megabyte contributes to higher energy usage and
                carbon emissions.
              </p>
            </div>
            <p className="mt-6 text-lg font-semibold text-ec-ink">
              The problem is not your content. It is how it is delivered.
            </p>
          </div>
        </section>

        <section id="how" className="ec-section">
          <div className="ec-container grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="ec-card p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                Cloudinary engine
              </p>
              <h2 className="ec-display mt-4 text-3xl font-semibold">
                Powered by Cloudinary's Intelligent Media Pipeline
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
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                Feature set
              </p>
              <h2
                id="features"
                className="ec-display mt-4 text-3xl font-semibold md:text-4xl"
              >
                Everything You Need to Optimize at Scale
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {
                  [
                    {
                      title: "Real-Time Website Analysis",
                      detail:
                        "Scan any site and instantly uncover hidden media inefficiencies.",
                    },
                    {
                      title: "Before and After Comparison",
                      detail: "Visually compare original vs optimized delivery.",
                    },
                    {
                      title: "Performance Insights",
                      detail:
                        "Understand bandwidth, load time, and efficiency gains.",
                    },
                    {
                      title: "Carbon Impact Tracking",
                      detail:
                        "Quantify how much CO2 you save with smarter media delivery.",
                    },
                    {
                      title: "AI Media Optimization",
                      detail:
                        "Automatically enhance, resize, and deliver assets intelligently.",
                    },
                    {
                      title: "One-Line Integration",
                      detail:
                        "Apply optimizations instantly with a lightweight script.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="ec-card p-6">
                      <p className="text-sm font-semibold text-ec-ink">
                        {item.title}
                      </p>
                      <p className="mt-3 text-sm text-ec-body">
                        {item.detail}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </section>

        <section className="ec-section border-t border-ec-hairline-soft">
          <div className="ec-container grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                SDK integration
              </p>
              <h2 className="ec-display mt-4 text-3xl font-semibold">
                Add EcoLens in Seconds
              </h2>
              <p className="mt-4 text-sm text-ec-body">
                Integrate EcoLens into your website with just a few lines of
                code. No refactoring. No migration. Instant results.
              </p>
            </div>
            <div className="ec-card p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-ec-muted">
                  SDK snippet
                </p>
                <CopyButton value={SDK_SNIPPET} />
              </div>
              <pre className="mt-4 overflow-x-auto rounded-lg border border-ec-hairline bg-ec-canvas p-4 text-sm font-mono text-ec-ink">
                <code>{SDK_SNIPPET}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="ec-section">
          <div className="ec-container">
            <h2 className="ec-display text-3xl font-semibold md:text-4xl">
              See the Difference Instantly
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {
                [
                  "Reduce media size by up to 80%",
                  "Improve page load speeds significantly",
                  "Lower bandwidth usage across all devices",
                  "Deliver the same visual quality with less resource consumption",
                ].map((item) => (
                  <div
                    key={item}
                    className="ec-card-soft flex items-center justify-between px-5 py-4"
                  >
                    <span className="text-sm text-ec-body">{item}</span>
                    <span className="text-xs font-semibold uppercase text-ec-muted">
                      Impact
                    </span>
                  </div>
                ))
              }
            </div>
            <p className="mt-6 text-lg font-semibold text-ec-ink">
              Better performance. Lower cost. Smaller footprint.
            </p>
          </div>
        </section>

        <section className="ec-section border-t border-ec-hairline-soft">
          <div className="ec-container">
            <h2 className="ec-display text-3xl font-semibold md:text-4xl">
              Loved by Developers and Teams
            </h2>
            <div className="ec-marquee mt-8">
              <div className="ec-marquee-track">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((item, index) => (
                  <div
                    key={`${item.author}-${index}`}
                    className="ec-card min-w-[280px] max-w-sm p-6"
                  >
                    <p className="text-sm text-ec-body">{item.quote}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                      {item.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ec-section">
          <div className="ec-container">
            <h2 className="ec-display text-3xl font-semibold md:text-4xl">
              Built for Modern Product Ecosystems
            </h2>
            <p className="mt-4 text-sm text-ec-body">
              Built for modern teams that care about performance and
              sustainability.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Developer tools",
                "SaaS platforms",
                "AI-first products",
              ].map((item) => (
                <div key={item} className="ec-card p-6 text-sm text-ec-body">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="ec-section">
          <div className="ec-container">
            <div className="ec-card p-10 text-center">
              <h2 className="ec-display text-3xl font-semibold md:text-4xl">
                Start Optimizing Your Website Today
              </h2>
              <p className="mt-4 text-sm text-ec-body">
                Join a new generation of faster, lighter, and more efficient web
                experiences.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => window.dispatchEvent(new Event("ec-auth-open"))}
                  className="ec-button-primary"
                >
                  Try Demo
                </button>
                <button
                  onClick={() => window.dispatchEvent(new Event("ec-auth-open"))}
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
  );
}
