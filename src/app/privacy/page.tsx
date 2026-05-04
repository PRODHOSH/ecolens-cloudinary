import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy – EcoLens",
  description: "How EcoLens collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  const updated = "4 May 2026";
  return (
    <>
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-ec-ink">
        <p className="text-xs uppercase tracking-[0.25em] text-ec-muted">Legal</p>
        <h1 className="ec-display mt-4 text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ec-muted">Last updated: {updated}</p>

        <div className="prose prose-neutral mt-12 max-w-none text-ec-body [&_h2]:ec-display [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ec-ink [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">

          <p>
            EcoLens (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the Service&rdquo;) is a media
            optimisation tool built by <strong>Prodhosh VS</strong>. This Privacy Policy explains
            what information we collect when you use EcoLens, how we use it, and how we keep it safe.
          </p>
          <p>
            By using EcoLens you agree to the practices described here. If you do not agree, please
            stop using the Service.
          </p>

          <h2>1. Information We Collect</h2>

          <h3 className="mt-6 text-base font-semibold text-ec-ink">a) Authentication data</h3>
          <p>
            EcoLens uses <strong>Google OAuth 2.0</strong> and <strong>GitHub OAuth</strong> for sign-in.
            We do not store your Google or GitHub password. When you authenticate we receive:
          </p>
          <ul>
            <li>Your name and email address (from Google or GitHub)</li>
            <li>Your public profile photo URL</li>
            <li>A unique OAuth user identifier</li>
          </ul>
          <p>
            This information is stored securely in <strong>Supabase</strong> (our backend-as-a-service
            provider) and is used solely to identify your account and personalise your experience.
          </p>

          <h3 className="mt-6 text-base font-semibold text-ec-ink">b) Usage data</h3>
          <p>When you use EcoLens to scan a URL we may collect:</p>
          <ul>
            <li>The URL you submitted for analysis</li>
            <li>Scan results (media asset list, size, format, savings estimate)</li>
            <li>Timestamp and approximate location (country level) derived from your IP address</li>
          </ul>
          <p>We use this data to display your scan history and improve the accuracy of our analysis engine.</p>

          <h3 className="mt-6 text-base font-semibold text-ec-ink">c) Technical data</h3>
          <p>
            We automatically collect standard server logs including your IP address, browser type,
            operating system, referring URL, and pages visited. This data is used for security
            monitoring and aggregate analytics only.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To authenticate you via Google OAuth or GitHub OAuth</li>
            <li>To store and retrieve your scan history from Supabase</li>
            <li>To serve Cloudinary-optimised media previews during a scan</li>
            <li>To send essential transactional emails (e.g. account notifications)</li>
            <li>To improve and debug the EcoLens platform</li>
          </ul>
          <p>We do <strong>not</strong> sell your personal data to third parties.</p>

          <h2>3. Third-Party Services</h2>
          <p>EcoLens integrates with the following third-party services. Each has its own privacy policy:</p>
          <ul>
            <li>
              <strong>Google OAuth 2.0</strong> — Identity provider.{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>GitHub OAuth</strong> — Identity provider.{" "}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="underline">
                GitHub Privacy Statement
              </a>
            </li>
            <li>
              <strong>Supabase</strong> — Database, authentication, and storage backend. Your data is
              stored in Supabase&apos;s infrastructure.{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                Supabase Privacy Policy
              </a>
            </li>
            <li>
              <strong>Cloudinary</strong> — Media transformation and delivery. URLs you submit may be
              passed to Cloudinary for optimisation previews.{" "}
              <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                Cloudinary Privacy Policy
              </a>
            </li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active. Scan results are
            retained for 90 days and then automatically purged. You may request deletion of your
            account and all associated data at any time by emailing{" "}
            <a href="mailto:prodhosh3@gmail.com" className="underline">prodhosh3@gmail.com</a>.
          </p>

          <h2>5. Security</h2>
          <p>
            All data is transmitted over HTTPS. Authentication tokens are managed by Supabase Auth
            with industry-standard encryption. We do not store OAuth access tokens beyond the session
            lifecycle. We take reasonable technical and organisational measures to protect your data,
            but no system is completely secure.
          </p>

          <h2>6. Cookies</h2>
          <p>
            EcoLens uses session cookies managed by Supabase Auth to keep you signed in. No
            third-party advertising or tracking cookies are used. You can disable cookies in your
            browser, but this will prevent you from signing in.
          </p>

          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:prodhosh3@gmail.com" className="underline">prodhosh3@gmail.com</a>.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the
            top of this page reflects the most recent revision. Continued use of EcoLens after
            changes are posted constitutes your acceptance of the updated policy.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions or concerns? Reach out:{" "}
            <a href="mailto:prodhosh3@gmail.com" className="underline">prodhosh3@gmail.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
