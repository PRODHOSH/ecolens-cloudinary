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
- Size reduction: ${scanResult.metrics.reductionPercent.toFixed(1)}%
- Bandwidth saved: ${scanResult.metrics.bandwidthSavedMb.toFixed(2)} MB
- CO2 avoided: ${scanResult.metrics.co2SavedGrams.toFixed(2)} g per page view

  ## Transformation Pattern
  - Images: ${scanResult.cloudinary.imageTransform}

## Files Added By This PR
- ECOLENS_REPORT.md
- cloudinary-loader.js

  ## Source File Changes
  This PR does not rewrite image references automatically. Use the report to apply the changes, or run your own refactor with the loader.

## Optimized Assets
${assetLines}

## Cloudinary Setup
1. Go to https://console.cloudinary.com
2. Open your Cloudinary Dashboard
3. Copy your Cloud Name (visible at the top of the dashboard)

## Environment Setup
Create a .env file and a .env.example file at the project root with one of the following:

- CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
or
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME

## How To Validate
1. Install dependencies
2. Start the dev server
3. Confirm image URLs are served through Cloudinary
4. Compare page weight before and after
`;

    // 5. Create the commits
    // We'll add a report and a suggested loader if it's a Next.js project
    const files = [
      {
        path: "ECOLENS_REPORT.md",
        content: reportContent,
        message: "docs: add EcoLens optimization report",
      },
      {
        path: "cloudinary-loader.js",
        content: `
export default function cloudinaryLoader({ src, width, quality }) {
  const params = ['f_auto', 'c_limit', \`w_\${width}\`, \`q_\${quality || 'auto'}\`].join(',');
  return \`https://res.cloudinary.com/${scanResult.cloudinary.cloudName}/image/fetch/\${params}/\${encodeURIComponent(src)}\`;
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
        title: "EcoLens media optimization report and Cloudinary loader",
        body: `EcoLens analyzed this repository and found that media assets can be reduced by ${scanResult.metrics.reductionPercent.toFixed(1)}%.

This PR adds:
- ECOLENS_REPORT.md with impact metrics, setup steps, and a full asset list
- cloudinary-loader.js as a starter image loader

Note: This PR does not rewrite image references automatically.

Setup:
1. Retrieve your Cloudinary cloud name from https://console.cloudinary.com
2. Add CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) to your .env
3. Start the app and verify images load via Cloudinary

Validation:
- Confirm that optimized URLs include ${scanResult.cloudinary.imageTransform}
- Measure page weight before and after
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
