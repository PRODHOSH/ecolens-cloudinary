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
  if (!trimmed.startsWith("http")) return `https://${trimmed}`;
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
  } catch { /* fallthrough */ }

  try {
    const range = await fetch(url, { headers: { Range: "bytes=0-0" } });
    const rangeHeader = range.headers.get("content-range");
    if (rangeHeader) {
      const total = rangeHeader.split("/")[1];
      if (total) return Number(total);
    }
  } catch { /* fallthrough */ }

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
    headers: { "User-Agent": "EcoLensBot/1.0" },
  });

  if (!htmlResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch target URL" },
      { status: 400 }
    );
  }

  const html = await htmlResponse.text();
  const $ = cheerio.load(html);

  // Inject base tag so relative URLs resolve correctly in the iframe preview
  if ($("head base").length === 0) {
    $("head").prepend(`<base href="${targetUrl}">`);
  }

  // ── Media registry ──────────────────────────────────────────────────────
  const mediaSeeds: Array<{ type: "image" | "video"; url: string }> = [];
  const seen = new Set<string>();

  const register = (type: "image" | "video", url: string) => {
    // Normalise: strip query/hash for dedup, but keep original for fetch
    const key = url.split("?")[0].split("#")[0];
    if (seen.has(key) || key.startsWith("data:") || key.length < 4) return;
    seen.add(key);
    mediaSeeds.push({ type, url });
  };

  // ── Strategy 1: Standard <img> tags ────────────────────────────────────
  $("img").each((_, el) => {
    const src =
      $(el).attr("src") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy-src") ||
      $(el).attr("data-original") ||
      $(el).attr("data-image") ||
      pickFromSrcSet($(el).attr("srcset")) ||
      pickFromSrcSet($(el).attr("data-srcset"));
    if (!src || src.startsWith("data:")) return;
    const absolute = toAbsoluteUrl(targetUrl, src);
    if (!absolute) return;
    // Rewrite src to Cloudinary-optimised version in the HTML preview
    const optimized = buildCloudinaryFetchUrl(cloudName, absolute, "image", mode);
    $(el).attr("data-ecolens-original", absolute);
    $(el).attr("src", optimized);
    $(el).removeAttr("srcset");
    register("image", absolute);
  });

  // ── Strategy 2: <picture><source> srcsets ──────────────────────────────
  $("picture source").each((_, el) => {
    const srcset = $(el).attr("srcset") || $(el).attr("data-srcset");
    const first = pickFromSrcSet(srcset);
    if (!first) return;
    const absolute = toAbsoluteUrl(targetUrl, first);
    if (absolute) register("image", absolute);
  });

  // ── Strategy 3: <link rel="preload" as="image"> ────────────────────────
  $("link").each((_, el) => {
    if ($(el).attr("rel") !== "preload") return;
    if ($(el).attr("as") !== "image") return;
    const href = $(el).attr("href") || $(el).attr("imagesrcset");
    if (!href) return;
    const absolute = toAbsoluteUrl(targetUrl, href);
    if (absolute) register("image", absolute);
  });

  // ── Strategy 4: <meta og:image / twitter:image> ────────────────────────
  $("meta").each((_, el) => {
    const prop = $(el).attr("property") || $(el).attr("name") || "";
    if (
      prop === "og:image" ||
      prop === "og:image:secure_url" ||
      prop === "twitter:image" ||
      prop === "twitter:image:src"
    ) {
      const content = $(el).attr("content");
      if (content) {
        const absolute = toAbsoluteUrl(targetUrl, content);
        if (absolute) register("image", absolute);
      }
    }
  });

  // ── Strategy 5: Inline style background-image: url(...) ────────────────
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") ?? "";
    const bgRe = /background(?:-image)?\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi;
    let m: RegExpExecArray | null;
    while ((m = bgRe.exec(style)) !== null) {
      if (!m[1] || m[1].startsWith("data:")) continue;
      const absolute = toAbsoluteUrl(targetUrl, m[1]);
      if (absolute) register("image", absolute);
    }
  });

  // ── Strategy 6: Next.js __NEXT_DATA__ JSON deep-walk ──────────────────
  const nextDataRaw = $("script#__NEXT_DATA__").html();
  if (nextDataRaw) {
    try {
      const nextData = JSON.parse(nextDataRaw) as unknown;
      const IMG_EXT = /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i;
      const walk = (val: unknown): void => {
        if (typeof val === "string") {
          if (
            IMG_EXT.test(val) &&
            (val.startsWith("http") || val.startsWith("/"))
          ) {
            const absolute = toAbsoluteUrl(targetUrl, val);
            if (absolute) register("image", absolute);
          }
        } else if (Array.isArray(val)) {
          val.forEach(walk);
        } else if (val && typeof val === "object") {
          Object.values(val).forEach(walk);
        }
      };
      walk(nextData);
    } catch {
      // Silently skip bad JSON
    }
  }

  // ── Strategy 7: Raw HTML regex sweep for any remaining image URLs ───────
  const RAW_IMG_RE =
    /(?:src|href|content|data-src|data-lazy-src|data-original)=["']([^"']*\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"']*)?)["']/gi;
  let m2: RegExpExecArray | null;
  while ((m2 = RAW_IMG_RE.exec(html)) !== null) {
    const raw = m2[1];
    if (!raw || raw.startsWith("data:")) continue;
    const absolute = toAbsoluteUrl(targetUrl, raw);
    if (absolute) register("image", absolute);
  }

  // ── Videos ────────────────────────────────────────────────────────────
  $("video").each((_, el) => {
    const src = $(el).attr("src");
    if (src && !src.startsWith("data:")) {
      const absolute = toAbsoluteUrl(targetUrl, src);
      if (absolute) {
        const optimized = buildCloudinaryFetchUrl(cloudName, absolute, "video", mode);
        $(el).attr("data-ecolens-original", absolute);
        $(el).attr("src", optimized);
        register("video", absolute);
      }
    }
  });

  $("video source").each((_, el) => {
    const src = $(el).attr("src");
    if (!src || src.startsWith("data:")) return;
    const absolute = toAbsoluteUrl(targetUrl, src);
    if (!absolute) return;
    const optimized = buildCloudinaryFetchUrl(cloudName, absolute, "video", mode);
    $(el).attr("data-ecolens-original", absolute);
    $(el).attr("src", optimized);
    register("video", absolute);
  });

  // ── Build MediaItem list (size probing in parallel) ────────────────────
  const media: MediaItem[] = await Promise.all(
    mediaSeeds.map(async (item, index) => {
      const originalBytes = await getAssetSize(item.url, item.type);
      const optimizedBytes = estimateOptimizedBytes(originalBytes, item.type, mode);
      const transformation =
        item.type === "video" ? getVideoTransform(mode) : getImageTransform(mode);

      return {
        id: `media-${index + 1}`,
        type: item.type,
        originalUrl: item.url,
        optimizedUrl: buildCloudinaryFetchUrl(cloudName, item.url, item.type, mode),
        originalBytes,
        optimizedBytes,
        savingsBytes: Math.max(0, originalBytes - optimizedBytes),
        formatBefore: inferFormat(item.url),
        formatAfter: item.type === "video" ? "AUTO" : "AVIF/WEBP",
        transformation,
      };
    })
  );

  // ── Aggregate metrics ──────────────────────────────────────────────────
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
    .slice(0, 8);

  const result: ScanResult = {
    targetUrl,
    optimizedHtml: $.html(),
    media,
    totals: {
      originalBytes,
      optimizedBytes,
      savingsBytes,
      imageCount: media.filter((i) => i.type === "image").length,
      videoCount: media.filter((i) => i.type === "video").length,
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
