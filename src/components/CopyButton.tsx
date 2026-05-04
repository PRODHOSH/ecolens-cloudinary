"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

export default function CopyButton({
  value,
  label = "Copy",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-lg border border-ec-hairline bg-ec-canvas px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ec-ink transition hover:border-ec-ink/30 ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
