import { NextResponse } from "next/server";
import { ScanResult } from "@/lib/types";

export async function POST(req: Request) {
  const { token, owner, repo, scanResult } = await req.json() as {
    token: string;
    owner: string;
    repo: string;
    scanResult: ScanResult
  };

  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "Missing required GitHub info" }, { status: 400 });
  }

  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // 1. Get the default branch (usually main or master)
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    const repoData = await repoRes.json();
    const baseBranch = repoData.default_branch || "main";

    // 2. Get the SHA of the base branch
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`, { headers });
    const branchData = await branchRes.json();
    const baseSha = branchData.object.sha;

    // 3. Create a new branch
    const newBranch = `ecolens-optimization-${Date.now()}`;
    await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${newBranch}`,
        sha: baseSha,
      }),
    });

    // 4. Prepare the optimization content
    const assetLines = scanResult.media
      .map((item) => `- ${item.filePath ?? item.originalUrl} -> ${item.originalUrl}`)
      .join("\n");

    const reportContent = `# EcoLens Optimization Report
Generated on: ${new Date().toLocaleString()}

## Summary
- **Size reduction**: ${scanResult.metrics.reductionPercent.toFixed(1)}%
- **Bandwidth saved**: ${scanResult.metrics.bandwidthSavedMb.toFixed(2)} MB
- **CO2 avoided**: ${scanResult.metrics.co2SavedGrams.toFixed(2)} g per page view

## Optimization Strategy
This PR provides a **Cloudinary Image Loader** that applies the following transformations to every asset:
- **f_auto**: Automatic format selection (delivers WebP/AVIF where supported)
- **q_auto**: Smart compression for the best visual quality at the lowest weight
- **c_limit**: Ensures images never scale up beyond their original size
- **Responsive Widths**: Integrated with Next.js Image component for optimal delivery

## 📂 Files Added
- \`ECOLENS_REPORT.md\`: This report
- \`cloudinary-loader.js\`: The Next.js compatible image loader
- \`.env.example\`: Template for required environment variables

## Getting Started

To activate the optimizations in this PR, follow these three simple steps:

### 1. Set Up Environment Variables
We've added a \`.env.example\` to your repo. Copy these variables to your active \`.env\` or \`.env.local\` file:
\`\`\`bash
# Your Cloudinary Cloud Name (from https://console.cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here

# Your site's domain (e.g., https://your-site.com)
# This is required so Cloudinary can fetch your local images.
NEXT_PUBLIC_SITE_URL=your_actual_site_url
\`\`\`

### 2. Register the Loader in Next.js
Open your \`next.config.js\` (or \`next.config.mjs\`) and tell Next.js to use the new EcoLens loader:
\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './cloudinary-loader.js',
  },
}
\`\`\`

### 3. Verify the Impact
1. Restart your development server.
2. Open your site and inspect any image in the **Network Tab**.
3. Look for URLs starting with \`res.cloudinary.com\`.
4. Notice the \`f_auto\` and \`q_auto\` parameters — your images are now being optimized in real-time!


## 📸 Optimized Assets
${assetLines}
`;

    // 5. Create the commits
    const files = [
      {
        path: "ECOLENS_REPORT.md",
        content: reportContent,
        message: "docs: add EcoLens optimization report",
      },
      {
        path: ".env.example",
        content: `# EcoLens - Cloudinary Optimization
# ------------------------------------------------------------
# 1. Get your Cloud Name from https://console.cloudinary.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here

# 2. Set your site's absolute URL (required for relative image paths)
# For local dev: http://localhost:3000
# For production: https://your-domain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`,
        message: "chore: add .env.example for EcoLens",
      },
      content: `/**
 * EcoLens Cloudinary Loader
 * 
 * This loader bridges your local images with Cloudinary's AI optimization engine.
 * It automatically handles format selection, quality compression, and responsive scaling.
 */
export default function cloudinaryLoader({ src, width, quality }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn("EcoLens: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing. Using original image source.");
    return src;
  }

  // Cloudinary Fetch requires absolute URLs. 
  // We resolve relative paths (/images/...) using your NEXT_PUBLIC_SITE_URL.
  let absoluteUrl = src;
  if (src.startsWith('/')) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (!siteUrl) {
      console.error("EcoLens: NEXT_PUBLIC_SITE_URL is required to optimize local relative paths.");
      return src;
    }
    // Clean up trailing slash and join
    absoluteUrl = \`\${siteUrl.replace(/\\/$/, '')}\${src}\`;
  }

  const params = [
    'f_auto',      // Automatic format (WebP/AVIF)
    'q_auto',      // Smart quality compression
    'c_limit',     // Prevent upscaling
    \`w_\${width}\`, // Responsive width
    \`q_\${quality || 'auto'}\`
  ].join(',');

  return \`https://res.cloudinary.com/\${cloudName}/image/fetch/\${params}/\${encodeURIComponent(absoluteUrl)}\`;
}
`,
      message: "feat: add Cloudinary image loader",
      }
    ];

  for (const file of files) {
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: file.message,
        content: Buffer.from(file.content).toString("base64"),
        branch: newBranch,
      }),
    });
  }

  // 6. Create the Pull Request
  const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "EcoLens: High-Performance Media Optimization Report",
      body: `### 🌿 EcoLens Analysis Complete
We analyzed your media assets and found that you can reduce page weight by **${scanResult.metrics.reductionPercent.toFixed(1)}%**.

### What's in this PR?
1.  **\`cloudinary-loader.js\`**: A custom Next.js loader that connects your site to Cloudinary's AI engine. It handles **relative paths** automatically.
2.  **\`.env.example\`**: Template for the two required environment variables.
3.  **\`ECOLENS_REPORT.md\`**: A full breakdown of your assets and detailed setup instructions.

### 🏁 Quick Start
1.  **Add Env Vars**: Copy the values from \`.env.example\` to your \`.env\`.
2.  **Register Loader**: Add the \`loaderFile\` to your \`next.config.js\`.
3.  **Deploy**: See your Lighthouse performance score jump!

*This report was generated automatically by [EcoLens](https://ecolens-cloudinary.vercel.app).*
`,
      head: newBranch,
      base: baseBranch,
    }),
  });


  const prData = await prRes.json();

  if (!prRes.ok) {
    throw new Error(prData.message || "Failed to create PR");
  }

  return NextResponse.json({ success: true, prUrl: prData.html_url });

} catch (error: any) {
  console.error("GitHub PR Error:", error);
  return NextResponse.json({ error: error.message || "Failed to create PR" }, { status: 500 });
}
}
