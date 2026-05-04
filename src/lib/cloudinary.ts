import type { OptimizationMode } from "./types";

const IMAGE_QUALITY: Record<OptimizationMode, string> = {
  performance: "q_auto:eco",
  quality: "q_auto:best",
  eco: "q_auto:low",
};

const VIDEO_QUALITY: Record<OptimizationMode, string> = {
  performance: "q_auto:eco",
  quality: "q_auto:best",
  eco: "q_auto:low",
};

export function getImageTransform(mode: OptimizationMode) {
  return [
    "f_auto",
    IMAGE_QUALITY[mode],
    "w_auto",
    "dpr_auto",
    "g_auto",
    "e_auto_contrast",
    "e_sharpen",
  ].join(",");
}

export function getVideoTransform(mode: OptimizationMode) {
  return ["f_auto", VIDEO_QUALITY[mode]].join(",");
}

export function buildCloudinaryFetchUrl(
  cloudName: string,
  originalUrl: string,
  type: "image" | "video",
  mode: OptimizationMode
) {
  const resource = type === "video" ? "video" : "image";
  const transform =
    type === "video" ? getVideoTransform(mode) : getImageTransform(mode);
  return `https://res.cloudinary.com/${cloudName}/${resource}/fetch/${transform}/${encodeURIComponent(
    originalUrl
  )}`;
}
