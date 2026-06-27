"use client";

import React, { useEffect, useState } from "react";
import { Camera, Plus } from "lucide-react";

type Mode = "manual" | "scan";

export default function TransactionModeToggle({
  value,
  onChange,
  scanHref,
}: {
  value?: Mode;
  onChange?: (next: Mode) => void;
  scanHref?: string;
}) {
  const [internalMode, setInternalMode] = useState<Mode>((typeof window !== "undefined" && (window.sessionStorage.getItem("zuno:transaction-mode") as Mode)) || "manual");
  const mode = value ?? internalMode;

  useEffect(() => {
    try {
      window.sessionStorage.setItem("zuno:transaction-mode", mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const selectMode = (nextMode: Mode) => {
    if (!value) {
      setInternalMode(nextMode);
    }

    onChange?.(nextMode);
  };

  return (
    <div className="relative w-[280px] h-[44px] rounded-[30px] bg-[rgba(229,229,230,0.71)] px-[4px] py-[3px] flex items-center" role="tablist" aria-label="Transaction mode">
      <div className={`absolute left-[4px] top-[3px] h-[37px] w-[136px] rounded-[20px] bg-white transition-transform duration-200 ease-out ${mode === "manual" ? "translate-x-0" : "translate-x-[136px]"}`} />

      <button
        type="button"
        role="tab"
        aria-selected={mode === "manual"}
        onClick={() => selectMode("manual")}
        className={`z-10 flex h-[37px] w-[136px] items-center justify-center gap-[8px] rounded-[20px] px-[12px] transition-colors ${mode === "manual" ? "text-[#174f84]" : "text-black/80"}`}
      >
        <Plus aria-hidden className="size-[18px] shrink-0" strokeWidth={2.2} />
        <span className="font-['SF Compact Rounded:Regular'] text-[12px]">Manual Entry</span>
      </button>

      {scanHref ? (
        <a
          href={scanHref}
          role="tab"
          aria-selected={mode === "scan"}
          onClick={(event) => {
            event.preventDefault();
            window.location.assign(scanHref);
          }}
          className={`absolute right-[4px] z-10 flex h-[37px] w-[136px] items-center justify-center gap-[8px] rounded-[20px] px-[12px] transition-colors ${mode === "scan" ? "text-[#174f84]" : "text-black/80"}`}
        >
          <Camera aria-hidden className="size-[18px] shrink-0" strokeWidth={2.2} />
          <span className="font-['SF Compact Rounded:Regular'] text-[12px]">Scan Receipt</span>
        </a>
      ) : (
        <button
          type="button"
          role="tab"
          aria-selected={mode === "scan"}
          onClick={() => selectMode("scan")}
          className={`absolute right-[4px] z-10 flex h-[37px] w-[136px] items-center justify-center gap-[8px] rounded-[20px] px-[12px] transition-colors ${mode === "scan" ? "text-[#174f84]" : "text-black/80"}`}
        >
          <Camera aria-hidden className="size-[18px] shrink-0" strokeWidth={2.2} />
          <span className="font-['SF Compact Rounded:Regular'] text-[12px]">Scan Receipt</span>
        </button>
      )}
    </div>
  );
}
