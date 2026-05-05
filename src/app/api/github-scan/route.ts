import { NextResponse } from "next/server";
import {
  buildCloudinaryFetchUrl,
  getImageTransform,
} from "@/lib/cloudinary";
import type { MediaItem, OptimizationMode, ScanResult } from "@/lib/types";
import { clamp } from "@/lib/format";

export const dynamic = "force-dynamic";

const MODE_RATIOS: Record<OptimizationMode, number> = {
  performance: 0.45,
  quality: 0.6,
  eco: 0.35,
};

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

function inferFormat(path: string) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "JPEG", jpeg: "JPEG", png: "PNG", gif: "GIF",
    webp: "WEBP", avif: "AVIF", svg: "SVG",
  };
  return map[ext] ?? ext.toUpperCase();
}

function buildEcoScores(reductionPercent: number, totalMb: number) {
  const baseScore = clamp(85 - totalMb * 2.5, 35, 85);
  const afterScore = clamp(baseScore + reductionPercent * 0.6, 40, 98);
  return { before: Math.round(baseScore), after: Math.round(afterScore) };
}

export function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  try {
    const clean = input.trim().replace(/\.git$/, "");
    const url = new URL(clean.startsWith("http") ? clean : `https://${clean}`);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    const parts = input.trim().split("/").filter(Boolean);
    if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
    return null;
  }
}

export async function POST(req: Request) {
  const payload = await req.json();
  const rawUrl = String(payload?.url ?? "");
  const mode = (payload?.mode ?? "performance") as OptimizationMode;

  const parsed = parseGitHubRepo(rawUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid GitHub URL or repo" }, { status: 400 });
  }

  const { owner, repo } = parsed;
  const targetUrl = `https://github.com/${owner}/${repo}`;

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    "demo";

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "EcoLensBot/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Try HEAD first, fallback to main
  let treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) {
    treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      { headers }
    );
  }
  if (!treeRes.ok) {
    return NextResponse.json(
      { error: `Could not access repo "${owner}/${repo}". Make sure it is public.` },
      { status: 400 }
    );
  }

  const treeData = await treeRes.json();
  const files = (treeData.tree as Array<{ path: string; type: string; size?: number }>) ?? [];
  const imageFiles = files.filter((f) => f.type === "blob" && IMAGE_EXTENSIONS.test(f.path));

  const imageTransform = getImageTransform(mode);

  const media: MediaItem[] = imageFiles.map((file, index) => {
    const rawFileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${file.path}`;
    const originalBytes = file.size ?? 450_000;
    const optimizedBytes = Math.max(12_000, Math.round(originalBytes * MODE_RATIOS[mode]));
    return {
      id: `media-${index + 1}`,
      type: "image" as const,
      originalUrl: rawFileUrl,
      optimizedUrl: buildCloudinaryFetchUrl(cloudName, rawFileUrl, "image", mode),
      originalBytes,
      optimizedBytes,
      savingsBytes: Math.max(0, originalBytes - optimizedBytes),
      formatBefore: inferFormat(file.path),
      formatAfter: "AVIF/WEBP",
      transformation: imageTransform,
      filePath: file.path,
    } as MediaItem & { filePath: string };
  });

  const originalBytes = media.reduce((s, i) => s + i.originalBytes, 0);
  const optimizedBytes = media.reduce((s, i) => s + i.optimizedBytes, 0);
  const savingsBytes = Math.max(0, originalBytes - optimizedBytes);
  const reductionPercent = originalBytes ? (savingsBytes / originalBytes) * 100 : 0;
  const totalMb = originalBytes / (1024 * 1024);
  const bandwidthSavedMb = savingsBytes / (1024 * 1024);
  const loadTimeImprovementPercent = clamp(reductionPercent * 0.8, 8, 78);
  const co2SavedGrams = bandwidthSavedMb * 0.2;
  const ecoScores = buildEcoScores(reductionPercent, totalMb);

  const topOffenders = [...media]
    .sort((a, b) => b.savingsBytes - a.savingsBytes)
    .slice(0, 10);

  const result: ScanResult = {
    targetUrl,
    optimizedHtml: "",
    media,
    totals: {
      originalBytes,
      optimizedBytes,
      savingsBytes,
      imageCount: media.length,
      videoCount: 0,
    },
    metrics: {
      reductionPercent,
      bandwidthSavedMb,
      loadTimeImprovementPercent,
      co2SavedGrams,
      ecoScoreBefore: ecoScores.before,
      ecoScoreAfter: ecoScores.after,
    },
    topOffenders,
    mode,
    createdAt: new Date().toISOString(),
    cloudinary: {
      cloudName,
      imageTransform,
      videoTransform: "",
    },
  };

  return NextResponse.json({ ...result, sourceType: "github", owner, repo });
}
