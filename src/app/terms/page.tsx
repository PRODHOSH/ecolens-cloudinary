import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service – EcoLens",
  description: "The terms governing your use of the EcoLens platform.",
};

export default function TermsPage() {
  const updated = "4 May 2026";
  return (
    <>
      <Header />
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-ec-ink">
        <p className="text-xs uppercase tracking-[0.25em] text-ec-muted">Legal</p>
        <h1 className="ec-display mt-4 text-4xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-ec-muted">Last updated: {updated}</p>

        <div className="prose prose-neutral mt-12 max-w-none text-ec-body [&_h2]:ec-display [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ec-ink [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">

          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of EcoLens,
            a web media optimisation platform (&ldquo;Service&rdquo;) operated by{" "}
            <strong>Prodhosh VS</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
            By creating an account or using the Service, you agree to be bound by these Terms.
          </p>

          <h2>1. Eligibility</h2>
          <p>
            You must be at least 13 years old to use EcoLens. By using the Service you represent
            that you meet this requirement and that your use will comply with all applicable laws.
          </p>

          <h2>2. Account Registration</h2>
          <p>
            EcoLens uses <strong>Google OAuth 2.0</strong> and <strong>GitHub OAuth</strong> for
            authentication. You do not create a separate username and password with us — your
            identity is managed by Google or GitHub. You are responsible for maintaining control of
            the account you use to sign in. We are not liable for any loss resulting from unauthorised
            access to your Google or GitHub account.
          </p>
          <p>
            Account data (name, email, profile photo, scan history) is stored in{" "}
            <strong>Supabase</strong>. You may request deletion of your account at any time by
            emailing{" "}
            <a href="mailto:prodhosh3@gmail.com" className="underline">prodhosh3@gmail.com</a>.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>You agree <strong>not</strong> to:</p>
          <ul>
            <li>Submit URLs that you do not own or do not have permission to scan</li>
            <li>Use EcoLens to scrape, mirror, or republish third-party content</li>
            <li>Attempt to reverse engineer, decompile, or otherwise extract source code</li>
            <li>Use automated scripts to abuse the scan API beyond fair personal use</li>
            <li>Introduce malware, viruses, or any harmful code into the Service</li>
            <li>Use the Service in any way that violates applicable law or regulation</li>
          </ul>

          <h2>4. Cloudinary Integration</h2>
          <p>
            EcoLens uses <strong>Cloudinary</strong>&apos;s media transformation API to generate
            optimised previews of assets found on pages you scan. By submitting a URL for analysis
            you acknowledge that image URLs may be passed to Cloudinary for processing. EcoLens does
            not permanently store media files — Cloudinary transformations are ephemeral and served
            for preview purposes only.
          </p>
          <p>
            Use of the Cloudinary-powered features is also subject to Cloudinary&apos;s{" "}
            <a href="https://cloudinary.com/tos" target="_blank" rel="noopener noreferrer" className="underline">
              Terms of Service
            </a>.
          </p>

          <h2>5. Data & Privacy</h2>
          <p>
            Your use of EcoLens is subject to our{" "}
            <a href="/privacy" className="underline">Privacy Policy</a>, which is incorporated into
            these Terms by reference. In summary: we store your account information and scan history
            in Supabase, we do not sell your data, and you may request deletion at any time.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            EcoLens and its underlying code, design, and brand assets are the intellectual property
            of Prodhosh VS. The EcoLens logo, name, and visual identity may not be reproduced or
            used without written permission.
          </p>
          <p>
            The EcoLens source code is available on{" "}
            <a href="https://github.com/PRODHOSH/ecolens-cloudinary" target="_blank" rel="noopener noreferrer" className="underline">
              GitHub
            </a>{" "}
            and is licensed under the terms stated in the repository&apos;s LICENSE file.
          </p>

          <h2>7. Third-Party Services</h2>
          <p>The Service relies on these third-party providers:</p>
          <ul>
            <li><strong>Google OAuth 2.0</strong> — Authentication</li>
            <li><strong>GitHub OAuth</strong> — Authentication</li>
            <li><strong>Supabase</strong> — Database, auth sessions, and file storage</li>
            <li><strong>Cloudinary</strong> — Media transformation and delivery</li>
          </ul>
          <p>
            EcoLens is not responsible for the availability, performance, or policies of these
            third-party services.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, express or implied. We do not warrant that the Service will be
            uninterrupted, error-free, or free of harmful components. Optimisation results are
            estimates and may vary by site, browser, and CDN configuration.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Prodhosh VS shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out of or relating to
            your use of the Service, even if we have been advised of the possibility of such damages.
            Our total liability for any claim related to the Service shall not exceed the amount you
            paid us in the twelve months preceding the claim.
          </p>

          <h2>10. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to EcoLens at any time if we
            reasonably believe you have violated these Terms or applicable law. You may stop using
            the Service at any time. Sections 6, 8, 9, and 11 survive termination.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of India. Any
            dispute arising under these Terms shall be subject to the exclusive jurisdiction of
            courts in India.
          </p>

          <h2>12. Changes to These Terms</h2>
          <p>
            We may revise these Terms at any time. The &ldquo;Last updated&rdquo; date will reflect
            the most recent version. Continued use of EcoLens after revised Terms are posted
            constitutes your acceptance of the changes.
          </p>

          <h2>13. Contact</h2>
          <p>
            Questions about these Terms?{" "}
            <a href="mailto:prodhosh3@gmail.com" className="underline">prodhosh3@gmail.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
