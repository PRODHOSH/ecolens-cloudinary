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
    const reportContent = `
# EcoLens Optimization Report
Generated on: ${new Date().toLocaleString()}

## Impact Summary
- **Size Reduction**: ${scanResult.metrics.reductionPercent.toFixed(1)}%
- **Bandwidth Saved**: ${scanResult.metrics.bandwidthSavedMb.toFixed(2)} MB
- **CO2 Avoided**: ${scanResult.metrics.co2SavedGrams.toFixed(2)}g per page view

## Optimized Assets
${scanResult.topOffenders.map(item => `- [${item.filePath || item.originalUrl}](${item.originalUrl}) -> Optimized via Cloudinary`).join("\n")}

## Recommendation
Implement the Cloudinary Fetch API to automatically optimize these assets.
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
        title: "🌱 EcoLens: Media Optimization & Carbon Reduction",
        body: `EcoLens has analyzed your repository and found that your media assets can be reduced by **${scanResult.metrics.reductionPercent.toFixed(1)}%**.

This PR adds:
1. **ECOLENS_REPORT.md**: A detailed breakdown of your site's carbon footprint and optimization potential.
2. **cloudinary-loader.js**: A pre-configured Cloudinary loader for your images.

Merging this will significantly improve your site's Core Web Vitals and reduce its environmental impact.`,
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
