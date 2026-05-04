import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import {
  buildCloudinaryFetchUrl,
  getImageTransform,
  getVideoTransform,
} from "@/lib/cloudinary";
import type { MediaItem, OptimizationMode, ScanResult } from "@/lib/types";
import { clamp } from "@/lib/format";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE_BYTES = 450_000;
const FALLBACK_VIDEO_BYTES = 2_400_000;

const MODE_RATIOS: Record<OptimizationMode, number> = {
  performance: 0.45,
  quality: 0.6,
  eco: 0.35,
};

const VIDEO_RATIOS: Record<OptimizationMode, number> = {
  performance: 0.62,
  quality: 0.78,
  eco: 0.5,
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("http")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function toAbsoluteUrl(base: string, assetUrl: string) {
  try {
    return new URL(assetUrl, base).toString();
  } catch {
    return null;
  }
}

function pickFromSrcSet(srcSet?: string | null) {
  if (!srcSet) return null;
  const first = srcSet.split(",")[0]?.trim();
  if (!first) return null;
  return first.split(" ")[0];
}

function inferFormat(url: string) {
  if (url.startsWith("data:")) return "DATA";
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (!ext) return "Unknown";
    if (ext === "jpg" || ext === "jpeg") return "JPEG";
    if (ext === "png") return "PNG";
    if (ext === "gif") return "GIF";
    if (ext === "webp") return "WEBP";
    if (ext === "avif") return "AVIF";
    if (ext === "mp4") return "MP4";
    if (ext === "webm") return "WEBM";
    return ext.toUpperCase();
  } catch {
    return "Unknown";
  }
}

async function getAssetSize(url: string, type: "image" | "video") {
  try {
    const head = await fetch(url, { method: "HEAD" });
    const size = head.headers.get("content-length");
    if (size) return Number(size);
  } catch {
    // Ignore and fallback below.
  }

  try {
    const range = await fetch(url, {
      headers: {
        Range: "bytes=0-0",
      },
    });
    const rangeHeader = range.headers.get("content-range");
    if (rangeHeader) {
      const total = rangeHeader.split("/")[1];
      if (total) return Number(total);
    }
  } catch {
    // Ignore and fallback below.
  }

  return type === "image" ? FALLBACK_IMAGE_BYTES : FALLBACK_VIDEO_BYTES;
}

function estimateOptimizedBytes(
  originalBytes: number,
  type: "image" | "video",
  mode: OptimizationMode
) {
  const ratio = type === "video" ? VIDEO_RATIOS[mode] : MODE_RATIOS[mode];
  const estimate = Math.round(originalBytes * ratio);
  return Math.max(12_000, Math.min(estimate, originalBytes));
}

function buildEcoScores(reductionPercent: number, totalMb: number) {
  const baseScore = clamp(85 - totalMb * 2.5, 35, 85);
  const afterScore = clamp(baseScore + reductionPercent * 0.6, 40, 98);
  return { before: Math.round(baseScore), after: Math.round(afterScore) };
}

export async function POST(req: Request) {
  const payload = await req.json();
  const rawUrl = String(payload?.url ?? "");
  const mode = (payload?.mode ?? "performance") as OptimizationMode;

  if (!rawUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const targetUrl = normalizeUrl(rawUrl);
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    "demo";

  const htmlResponse = await fetch(targetUrl, {
    headers: {
      "User-Agent": "EcoLensBot/1.0",
    },
  });

  if (!htmlResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch target URL" },
      { status: 400 }
    );
  }

  const html = await htmlResponse.text();
  const $ = cheerio.load(html);
  $("script").remove();

  if ($("head base").length === 0) {
    $("head").prepend(`<base href="${targetUrl}">`);
  }

  const mediaSeeds: Array<{ type: "image" | "video"; url: string }> = [];
  const seen = new Set<string>();

  const register = (type: "image" | "video", url: string) => {
    if (seen.has(url)) return;
    seen.add(url);
    mediaSeeds.push({ type, url });
  };

  $("img").each((_, element) => {
    const src =
      $(element).attr("src") ||
      $(element).attr("data-src") ||
      $(element).attr("data-lazy-src") ||
      pickFromSrcSet($(element).attr("srcset"));

    if (!src || src.startsWith("data:")) return;
    const absolute = toAbsoluteUrl(targetUrl, src);
    if (!absolute) return;

    const optimized = buildCloudinaryFetchUrl(
      cloudName,
      absolute,
      "image",
      mode
    );
    $(element).attr("data-ecolens-original", absolute);
    $(element).attr("src", optimized);
    $(element).removeAttr("srcset");
    register("image", absolute);
  });

  $("video").each((_, element) => {
    const src = $(element).attr("src");
    if (src && !src.startsWith("data:")) {
      const absolute = toAbsoluteUrl(targetUrl, src);
      if (absolute) {
        const optimized = buildCloudinaryFetchUrl(
          cloudName,
          absolute,
          "video",
          mode
        );
        $(element).attr("data-ecolens-original", absolute);
        $(element).attr("src", optimized);
        register("video", absolute);
      }
    }
  });

  $("video source").each((_, element) => {
    const src = $(element).attr("src");
    if (!src || src.startsWith("data:")) return;
    const absolute = toAbsoluteUrl(targetUrl, src);
    if (!absolute) return;
    const optimized = buildCloudinaryFetchUrl(
      cloudName,
      absolute,
      "video",
      mode
    );
    $(element).attr("data-ecolens-original", absolute);
    $(element).attr("src", optimized);
    register("video", absolute);
  });

  const media: MediaItem[] = await Promise.all(
    mediaSeeds.map(async (item, index) => {
      const originalBytes = await getAssetSize(item.url, item.type);
      const optimizedBytes = estimateOptimizedBytes(
        originalBytes,
        item.type,
        mode
      );
      const transformation =
        item.type === "video"
          ? getVideoTransform(mode)
          : getImageTransform(mode);

      return {
        id: `media-${index + 1}`,
        type: item.type,
        originalUrl: item.url,
        optimizedUrl: buildCloudinaryFetchUrl(
          cloudName,
          item.url,
          item.type,
          mode
        ),
        originalBytes,
        optimizedBytes,
        savingsBytes: Math.max(0, originalBytes - optimizedBytes),
        formatBefore: inferFormat(item.url),
        formatAfter: item.type === "video" ? "AUTO" : "AVIF/WEBP",
        transformation,
      };
    })
  );

  const originalBytes = media.reduce(
    (sum, item) => sum + item.originalBytes,
    0
  );
  const optimizedBytes = media.reduce(
    (sum, item) => sum + item.optimizedBytes,
    0
  );
  const savingsBytes = Math.max(0, originalBytes - optimizedBytes);
  const reductionPercent = originalBytes
    ? (savingsBytes / originalBytes) * 100
    : 0;
  const totalMb = originalBytes / (1024 * 1024);
  const bandwidthSavedMb = savingsBytes / (1024 * 1024);
  const loadTimeImprovementPercent = clamp(reductionPercent * 0.8, 8, 78);
  const co2SavedGrams = bandwidthSavedMb * 0.2;
  const ecoScores = buildEcoScores(reductionPercent, totalMb);

  const topOffenders = [...media]
    .sort((a, b) => b.savingsBytes - a.savingsBytes)
    .slice(0, 6);

  const result: ScanResult = {
    targetUrl,
    optimizedHtml: $.html(),
    media,
    totals: {
      originalBytes,
      optimizedBytes,
      savingsBytes,
      imageCount: media.filter((item) => item.type === "image").length,
      videoCount: media.filter((item) => item.type === "video").length,
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
      imageTransform: getImageTransform(mode),
      videoTransform: getVideoTransform(mode),
    },
  };

  return NextResponse.json(result);
}
