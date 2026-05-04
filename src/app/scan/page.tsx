import { Suspense } from "react";
import ScanClient from "@/app/scan/ScanClient";

export const dynamic = "force-dynamic";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ec-canvas text-ec-ink">
          Loading scan...
        </div>
      }
    >
      <ScanClient />
    </Suspense>
  );
}
