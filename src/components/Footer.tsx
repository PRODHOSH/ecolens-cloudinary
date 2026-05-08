export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ec-surface-dark text-ec-on-dark-soft">
      <div className="ec-container py-16">

        {/* ── Top row ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">

          {/* Brand + developer card */}
          <div className="max-w-xs shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/ddn6tl045/image/fetch/f_auto,q_auto,e_trim/https://ecolens-cloudinary.vercel.app/logo.png" 
                alt="EcoLens Logo" 
                className="h-6 w-6 rounded-md object-contain" 
              />
              <p className="ec-display text-xl font-semibold text-ec-on-dark">EcoLens</p>
            </div>


            <p className="mt-2 text-sm text-ec-on-dark-soft">
              Optimize your media. Reduce your carbon footprint.
            </p>

            {/* Developer card */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#1a1a1a] bg-[#151515] px-4 py-3">
              {/* GitHub avatar */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://avatars.githubusercontent.com/PRODHOSH"
                alt="Prodhosh VS"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-[#2a2a2a] object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ec-on-dark">Prodhosh VS</p>
                <p className="text-xs text-ec-on-dark-soft">Developer</p>
              </div>
              {/* Social icons */}
              <div className="ml-auto flex items-center gap-2">
                <a
                  href="https://github.com/PRODHOSH"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2a2a] text-ec-on-dark-soft transition-colors hover:text-ec-on-dark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/prodhoshvs"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2a2a] text-ec-on-dark-soft transition-colors hover:text-ec-on-dark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="mailto:prodhosh3@gmail.com"
                  aria-label="Email"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2a2a] text-ec-on-dark-soft transition-colors hover:text-ec-on-dark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ec-on-dark-soft">Product</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#product" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">Overview</a></li>
                <li><a href="#how" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">How it works</a></li>
                <li><a href="/docs" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark font-bold italic">Documentation</a></li>
                <li><a href="#features" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">Features</a></li>
                <li><a href="#workflows" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">Workflows</a></li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ec-on-dark-soft">Developer</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a href="https://github.com/PRODHOSH/ecolens-cloudinary" target="_blank" rel="noopener noreferrer" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">
                    Repository
                  </a>
                </li>
                <li>
                  <a href="https://github.com/PRODHOSH/ecolens-cloudinary/issues" target="_blank" rel="noopener noreferrer" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">
                    Issues
                  </a>
                </li>
                <li>
                  <a href="https://github.com/PRODHOSH" target="_blank" rel="noopener noreferrer" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">
                    GitHub Profile
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/prodhoshvs" target="_blank" rel="noopener noreferrer" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ec-on-dark-soft">Legal</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="/privacy" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">Privacy Policy</a></li>
                <li><a href="/terms" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">Terms of Service</a></li>
                <li>
                  <a href="mailto:prodhosh3@gmail.com" className="text-ec-on-dark-soft transition-colors hover:text-ec-on-dark">
                    prodhosh3@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#1a1a1a] pt-6 text-xs text-ec-on-dark-soft sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} EcoLens · Built by{" "}
            <a
              href="https://github.com/PRODHOSH"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ec-on-dark transition-colors hover:underline"
            >
              Prodhosh VS
            </a>
          </span>
          <span className="text-ec-on-dark-soft">Powered by Cloudinary</span>
        </div>
      </div>
    </footer>
  );
}
