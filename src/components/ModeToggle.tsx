"use client";

import type { OptimizationMode } from "@/lib/types";

const MODES: Array<{
  value: OptimizationMode;
  label: string;
  hint: string;
}> = [
  { value: "performance", label: "Performance", hint: "q_auto:eco" },
  { value: "quality", label: "Quality", hint: "q_auto:best" },
  { value: "eco", label: "Eco", hint: "Aggressive" },
];

type ModeToggleProps = {
  value: OptimizationMode;
  onChange: (value: OptimizationMode) => void;
};

export default function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full bg-ec-surface-soft p-2">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
            value === mode.value
              ? "bg-ec-canvas text-ec-ink shadow-sm"
              : "text-ec-muted hover:text-ec-ink"
          }`}
        >
          {mode.label}
          <span className="ml-2 text-[10px] text-ec-muted">{mode.hint}</span>
        </button>
      ))}
    </div>
  );
}
