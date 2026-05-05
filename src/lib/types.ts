export type OptimizationMode = "performance" | "quality" | "eco";

export type MediaItem = {
  id: string;
  type: "image" | "video";
  originalUrl: string;
  optimizedUrl: string;
  originalBytes: number;
  optimizedBytes: number;
  savingsBytes: number;
  formatBefore: string;
  formatAfter: string;
  transformation: string;
  filePath?: string;
};

export type ScanTotals = {
  originalBytes: number;
  optimizedBytes: number;
  savingsBytes: number;
  imageCount: number;
  videoCount: number;
};

export type ScanMetrics = {
  reductionPercent: number;
  bandwidthSavedMb: number;
  loadTimeImprovementPercent: number;
  co2SavedGrams: number;
  ecoScoreBefore: number;
  ecoScoreAfter: number;
};

export type ScanResult = {
  targetUrl: string;
  optimizedHtml: string;
  media: MediaItem[];
  totals: ScanTotals;
  metrics: ScanMetrics;
  topOffenders: MediaItem[];
  mode: OptimizationMode;
  createdAt: string;
  cloudinary: {
    cloudName: string;
    imageTransform: string;
    videoTransform: string;
  };
  sourceType?: "website" | "github";
  owner?: string;
  repo?: string;
};
