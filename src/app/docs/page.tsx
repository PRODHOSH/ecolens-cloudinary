"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DocsPage() {
  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "how-it-works", label: "How It Works" },
    { id: "implementation", label: "Implementation" },
    { id: "metrics", label: "Metrics" },
    { id: "configuration", label: "Configuration" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-ec-canvas text-ec-ink selection:bg-ec-brand/10">
      <Header />

      <main className="flex-1">
        <div className="ec-container pb-24 pt-12">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ec-muted">Docs</p>
                <nav className="mt-6 space-y-2">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm text-ec-body transition hover:text-ec-ink"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div>
              <header className="mb-12 border-b border-ec-hairline pb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-ec-muted">EcoLens</p>
                <h1 className="ec-display mt-4 text-4xl md:text-5xl">Documentation</h1>
                <p className="mt-4 max-w-2xl text-base text-ec-body">
                  Everything you need to scan, optimize, and reduce the carbon footprint of your media delivery.
                </p>
              </header>

              <div className="mb-10 flex flex-wrap gap-3 lg:hidden">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-full border border-ec-hairline px-3 py-1 text-xs text-ec-body transition hover:text-ec-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <article className="space-y-12">
                <section id="overview" className="border-b border-ec-hairline pb-10">
                  <h2 className="text-2xl font-semibold">Overview</h2>
                  <p className="mt-3 text-sm leading-7 text-ec-body">
                    EcoLens is a media optimization platform that automates the process of making websites faster and more eco-friendly.
                    It works on public HTML, CSS, and JavaScript sites as well as modern frameworks.
                  </p>
                </section>

                <section id="how-it-works" className="border-b border-ec-hairline pb-10">
                  <h2 className="text-2xl font-semibold">How It Works</h2>
                  <p className="mt-3 text-sm text-ec-body">
                    EcoLens uses two primary methods to analyze your project:
                  </p>
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-ec-ink">Website URL Scan</h3>
                      <p className="mt-2 text-sm text-ec-body">
                        Provide a URL and EcoLens scrapes the page to find media assets. It simulates Cloudinary transformations like
                        <span className="rounded bg-ec-surface-soft px-1">f_auto</span> and <span className="rounded bg-ec-surface-soft px-1">q_auto</span>
                        to estimate savings.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ec-ink">GitHub Repository Scan</h3>
                      <p className="mt-2 text-sm text-ec-body">
                        Point EcoLens to a GitHub repository to analyze source code for images and local assets. This enables direct
                        optimization via Pull Requests.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="implementation" className="border-b border-ec-hairline pb-10">
                  <h2 className="text-2xl font-semibold">Implementation</h2>
                  <div className="mt-6 space-y-6 text-sm text-ec-body">
                    <div>
                      <h3 className="text-base font-semibold text-ec-ink">Zero-Install SDK</h3>
                      <p className="mt-2">Add this script tag to your HTML head:</p>
                      <pre className="mt-3 overflow-x-auto rounded-xl border border-ec-hairline bg-ec-surface-soft px-4 py-3 text-xs text-ec-ink">
{`<script
  src="https://ecolens-cloudinary.vercel.app/sdk.js"
  data-cloud="YOUR_CLOUD_NAME"
  async
></script>`}
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ec-ink">Automated Pull Request</h3>
                      <p className="mt-2">EcoLens can open a PR that includes an optimization report and a Cloudinary loader.</p>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ec-ink">AI-Guided Prompt</h3>
                      <p className="mt-2">Use the generated prompt in Claude Code or Cursor to automate refactors.</p>
                    </div>
                  </div>
                </section>

                <section id="metrics" className="border-b border-ec-hairline pb-10">
                  <h2 className="text-2xl font-semibold">Metrics</h2>
                  <p className="mt-3 text-sm text-ec-body">
                    EcoLens uses the Digital Carbon Footprint standard:
                  </p>
                  <div className="mt-4 text-sm text-ec-body">
                    Energy (kWh) = Data Transferred (GB) × 0.81 kWh/GB
                    <br />
                    CO2 (g) = Energy (kWh) × 442 g/kWh
                  </div>
                </section>

                <section id="configuration" className="pb-4">
                  <h2 className="text-2xl font-semibold">Configuration</h2>
                  <p className="mt-3 text-sm text-ec-body">To run EcoLens locally, set:</p>
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-ec-hairline bg-ec-surface-soft px-4 py-3 text-xs text-ec-ink">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GITHUB_ID=...
GITHUB_SECRET=...
CLOUDINARY_URL=...`}
                  </pre>
                </section>
              </article>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
