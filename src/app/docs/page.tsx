"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans selection:bg-blue-100">
      <Header />

      <main className="flex-1 py-16 px-6 sm:px-12">
        <div className="mx-auto max-w-3xl">
          <header className="mb-12 border-b border-slate-200 pb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Documentation</h1>
            <p className="text-lg text-slate-600">The complete guide to optimizing your website's media and reducing its digital carbon footprint with EcoLens.</p>
          </header>

          <section className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-slate-100 pb-2">Overview</h2>
            <p className="leading-7 mb-6">
              EcoLens is a media optimization platform designed to automate the process of making websites faster and more eco-friendly. 
              By integrating with **Cloudinary**, EcoLens identifies unoptimized images and videos, calculates their carbon impact, 
              and provides automated solutions to fix them.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-slate-100 pb-2">How it Works</h2>
            <p className="leading-7 mb-4">EcoLens uses two primary methods to analyze your project:</p>
            
            <h3 className="text-xl font-semibold mt-8 mb-3">1. Website URL Scan</h3>
            <p className="leading-7 mb-4">
              When you provide a website URL, EcoLens scrapes the page to find all media assets. 
              It then simulates Cloudinary's optimization algorithms (<code className="bg-slate-100 px-1 rounded text-pink-600">f_auto</code>, <code className="bg-slate-100 px-1 rounded text-pink-600">q_auto</code>) 
              to determine how much data can be saved.
            </p>

            <h3 className="text-xl font-semibold mt-8 mb-3">2. GitHub Repository Scan</h3>
            <p className="leading-7 mb-4">
              By pointing EcoLens to a GitHub repository, it analyzes the source code to find image references and local assets. 
              This allows for direct code optimization via Pull Requests.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-slate-100 pb-2">Implementation Strategies</h2>
            <p className="leading-7 mb-6">EcoLens provides three ways to apply optimizations:</p>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-2">A. Zero-Install SDK</h3>
                <p className="leading-7 mb-3">
                  The fastest way to optimize a live site. Add the following script tag to your site's <code className="bg-slate-100 px-1 rounded text-pink-600">&lt;head&gt;</code>:
                </p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
{`<script 
  src="https://ecolens.cloudinary.com/v1/sdk.js" 
  data-cloud="YOUR_CLOUD_NAME"
  async
></script>`}
                </pre>
                <p className="text-sm text-slate-500 mt-2 italic">This SDK automatically intercepts image requests and optimizes them on-the-fly via the Cloudinary Fetch API.</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-purple-600 mb-2">B. Automated Pull Request</h3>
                <p className="leading-7 mb-3">
                  EcoLens can directly contribute to your codebase. When you select this option:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>It creates a new branch in your repository.</li>
                  <li>It commits an <code className="bg-slate-100 px-1 rounded text-slate-900">ECOLENS_REPORT.md</code> with detailed metrics.</li>
                  <li>It injects a custom Cloudinary loader for Next.js or standard frameworks.</li>
                  <li>It opens a Pull Request for you to review and merge.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-emerald-600 mb-2">C. AI-Guided Prompt</h3>
                <p className="leading-7 mb-3">
                  If you prefer manual control, EcoLens generates a specialized prompt for AI tools (like ChatGPT or Claude). 
                  This prompt contains the exact list of assets and the recommended transformation strings.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-slate-100 pb-2">Metrics & CO2 Calculation</h2>
            <p className="leading-7 mb-4">
              EcoLens uses the **Digital Carbon Footprint** standard to estimate impact:
            </p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
              <p className="font-mono text-center text-slate-700 italic">
                Energy (kWh) = Data Transferred (GB) × 0.81 kWh/GB
                <br />
                CO2 (g) = Energy (kWh) × 442 g/kWh
              </p>
            </div>
            <p className="leading-7 mt-4 text-slate-600 text-sm">
              *Factors based on global average data center and network energy intensity.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-4 border-b border-slate-100 pb-2">Configuration</h2>
            <p className="leading-7 mb-4">To run EcoLens locally, ensure the following environment variables are set:</p>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GITHUB_ID=...
GITHUB_SECRET=...
CLOUDINARY_URL=...`}
            </pre>
          </section>

          <footer className="mt-20 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
            <p>© 2026 EcoLens Documentation. Powered by Cloudinary.</p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
