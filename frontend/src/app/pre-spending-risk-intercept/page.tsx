"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type RiskLevel = "low" | "medium" | "high";

type RiskAssessment = {
  riskTotal: number;
  level: RiskLevel;
  merchantName: string;
  amount: number;
  fundName: string;
  beforeRemaining: number;
  afterRemaining: number;
  daysLeft: number;
  intentAnalysis: string;
};

const currency = new Intl.NumberFormat("vi-VN");

const figmaFileKey = "QvmrmE6q8MLt7uFb0LNwNU";
const figmaNodeAssets = {
  secretaryAvatar: {
    nodeId: "204:337",
    src: "https://www.figma.com/api/mcp/asset/c4ebf5fb-a721-4ff4-a7a2-27b0fe9d9173",
  },
  chartIcon: {
    nodeId: "204:300",
    src: "https://www.figma.com/api/mcp/asset/bc9a012f-bfdb-4369-be6d-a6cd75e16f04",
  },
  dangerIcon: {
    nodeId: "204:320",
    src: "https://www.figma.com/api/mcp/asset/8a1e2b1b-e032-433c-a804-0f4c02c2907e",
  },
};

const demoAssessment: RiskAssessment = {
  riskTotal: 0.68,
  level: "medium",
  merchantName: "Nhà hàng nướng BBQ",
  amount: 450_000,
  fundName: "Ăn uống",
  beforeRemaining: 500_000,
  afterRemaining: 50_000,
  daysLeft: 4,
  intentAnalysis:
    "CẢNH BÁO: CHI TIÊU BẤT THƯỜNG! Hóa đơn BBQ 450.000đ này cao gấp 10 lần mức chi tiêu ăn uống trung bình hàng ngày của bạn (45.000đ/ngày). ZUNO khuyên bạn nên kích hoạt tính năng Tự động Chia hóa đơn (Split Bill) với nhóm bạn để tránh lố quỹ Ăn uống của tuần này.",
};

function classifyRisk(riskTotal: number): RiskLevel {
  if (riskTotal >= 0.75) return "high";
  if (riskTotal >= 0.45) return "medium";
  return "low";
}

function getBackUrl() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get("returnUrl");
    if (returnUrl) return returnUrl;
    if (document.referrer) return document.referrer;
  }
  return "http://localhost:8080";
}

export default function PreSpendingRiskInterceptPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const assessment = useMemo(
    () => ({ ...demoAssessment, level: classifyRisk(demoAssessment.riskTotal) }),
    [],
  );

  const shouldShowMediumIntercept =
    assessment.level === "medium" &&
    assessment.riskTotal >= 0.45 &&
    assessment.riskTotal < 0.75;

  function handleTransfer() {
    if (shouldShowMediumIntercept) {
      setSheetOpen(true);
      return;
    }

    // Low risk: continue to OTP/payment confirmation.
    // High risk: route to a stronger blocking flow.
  }

  return (
    <main className="min-h-dvh bg-slate-100 text-[#112945]">
      <div className="relative mx-auto h-[852px] w-full max-w-[393px] overflow-hidden bg-[#f7f8fa] shadow-2xl">
        <BankTransferMock onTransfer={handleTransfer} isDimmed={sheetOpen} />

        {sheetOpen ? (
          <button
            type="button"
            aria-label="Đóng cảnh báo rủi ro"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 z-30 bg-black/35 backdrop-blur-[2px]"
          />
        ) : null}

        <RiskBottomSheet
          open={sheetOpen}
          assessment={assessment}
          onCancel={() => {
            if (typeof window !== "undefined") {
              window.location.href = getBackUrl();
            }
          }}
          onBorrowFund={() => {
            if (typeof window !== "undefined") {
              window.location.href = getBackUrl();
            }
          }}
          onSplitBill={() => {
            if (typeof window !== "undefined") {
              window.location.href = getBackUrl();
            }
          }}
        />
      </div>
    </main>
  );
}

function BankTransferMock({
  onTransfer,
  isDimmed,
}: {
  onTransfer: () => void;
  isDimmed: boolean;
}) {
  return (
    <section
      className={`h-full transition duration-300 ${isDimmed ? "scale-[0.985] blur-[1px]" : ""}`}
    >
      <header className="bg-[linear-gradient(135deg,#112945,#174f84_55%,#4d78a8)] px-5 pb-7 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.location.href = getBackUrl();
                }
              }}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white transition hover:underline"
            >
              ← Quay lại
            </a>
            <h1 className="mt-1 text-2xl font-bold">Chuyển tiền</h1>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            AI Risk On
          </div>
        </div>
        <div className="mt-7 rounded-xl bg-white/12 p-4">
          <p className="text-xs text-white/65">Số dư khả dụng</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">5.000.000đ</p>
        </div>
      </header>

      <div className="px-4 py-5">
        <div className="rounded-xl border border-[#e3e6eb] bg-white p-4 shadow-sm">
          <label className="text-xs font-bold uppercase text-[#546982]">Người nhận</label>
          <div className="mt-2 rounded-lg border border-[#dbe3ee] px-3 py-3 font-semibold">
            ZUNO Wallet
          </div>

          <label className="mt-4 block text-xs font-bold uppercase text-[#546982]">
            Nội dung
          </label>
          <div className="mt-2 rounded-lg border border-[#dbe3ee] px-3 py-3">
            Bữa tối buffet nướng BBQ
          </div>

          <label className="mt-4 block text-xs font-bold uppercase text-[#546982]">
            Số tiền
          </label>
          <div className="mt-2 rounded-lg border border-[#dbe3ee] px-3 py-3 text-xl font-extrabold text-[#dc2626] tabular-nums">
            450.000đ
          </div>

          <button
            type="button"
            onClick={onTransfer}
            className="mt-5 h-12 w-full rounded-xl bg-[#112945] text-[15px] font-bold text-white shadow-lg shadow-[#112945]/20 transition active:scale-[0.98]"
          >
            Chuyển tiền
          </button>
        </div>
      </div>
    </section>
  );
}

function RiskBottomSheet({
  open,
  assessment,
  onCancel,
  onBorrowFund,
  onSplitBill,
}: {
  open: boolean;
  assessment: RiskAssessment;
  onCancel: () => void;
  onBorrowFund: () => void;
  onSplitBill: () => void;
}) {
  return (
    <aside
      aria-hidden={!open}
      data-figma-file-key={figmaFileKey}
      data-node-id="204:284"
      data-name="BOTTOM SHEET: Active Warning"
      className={`absolute inset-x-0 bottom-0 z-40 h-[587px] rounded-t-[28px] bg-[#f7f8fa] shadow-[0_-18px_40px_rgba(17,41,69,0.24)] transition-transform duration-500 ease-out ${open ? "translate-y-0" : "translate-y-full"
        }`}
    >
      <div className="flex h-[30px] items-center justify-center">
        <div className="h-1.5 w-12 rounded-full bg-[#c8d0dc]" />
      </div>

      <div className="px-4 pb-6">
        <section className="pt-2" data-node-id="204:288" data-name="1. AI Assistant Section">
          <div className="flex items-center gap-[18px]">
            <div
              className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-[#bccbb9] bg-white shadow-sm"
              data-node-id="204:289"
              data-name="Border"
            >
              <FigmaNodeImage
                alt="ZUNO Secretary"
                asset={figmaNodeAssets.secretaryAvatar}
                className="size-11 object-cover"
              />
            </div>
            <h2 className="text-base font-bold leading-6 text-[#565e74]">ZUNO Secretary</h2>
          </div>

          <div className="mt-3 w-[327px] rounded-xl border border-[rgba(188,203,185,0.3)] bg-white px-[17px] py-[13px] shadow-sm">
            <p className="text-[15px] font-medium leading-[22px] text-[#0b1c30]">
              {(() => {
                const target = "CẢNH BÁO: CHI TIÊU BẤT THƯỜNG!";
                if (assessment.intentAnalysis.toUpperCase().startsWith(target)) {
                  const prefix = assessment.intentAnalysis.slice(0, target.length);
                  const rest = assessment.intentAnalysis.slice(target.length);
                  return (
                    <>
                      <span className="font-bold text-[#f43f5e]">{prefix}</span>
                      {rest}
                    </>
                  );
                }
                const target2 = "KHOAN ĐÃ HOÀNG ƠI!";
                if (assessment.intentAnalysis.toUpperCase().startsWith(target2)) {
                  const prefix = assessment.intentAnalysis.slice(0, target2.length);
                  const rest = assessment.intentAnalysis.slice(target2.length);
                  return (
                    <>
                      <span className="font-bold text-[#dc2626]">{prefix}</span>
                      {rest}
                    </>
                  );
                }
                return assessment.intentAnalysis;
              })()}
            </p>
          </div>
        </section>

        <section
          className="mt-[18px] rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm"
          data-node-id="204:297"
          data-name="2. Financial Comparison Chart"
        >
          <div className="flex items-center gap-2">
            <FigmaNodeImage
              alt=""
              asset={figmaNodeAssets.chartIcon}
              className="size-[15px]"
              ariaHidden
            />
            <h3 className="text-base font-bold leading-6 text-[#112945]">
              So sánh ngân sách
            </h3>
          </div>

          <div className="mt-4 space-y-5">
            <BudgetBar
              label="Hiện tại"
              value={assessment.beforeRemaining}
              max={assessment.beforeRemaining}
              tone="safe"
            />
            <BudgetBar
              label="Sau giao dịch"
              value={assessment.afterRemaining}
              max={assessment.beforeRemaining}
              tone="danger"
              caption={`Mức nguy hiểm: Chỉ còn ${currency.format(
                Math.max(0, Math.round(assessment.afterRemaining / assessment.daysLeft)),
              )}đ/ngày`}
            />
          </div>
        </section>

        <div
          className="mt-4 flex flex-col items-center gap-3 pt-1 w-full"
          data-node-id="204:325"
          data-name="3. Action Buttons"
        >
          <button
            type="button"
            onClick={onSplitBill}
            className="flex h-[46px] w-[327px] items-center justify-center rounded-xl bg-gradient-to-r from-[#174f84] to-[#4d78a8] text-base font-bold text-white shadow-md transition active:scale-[0.98] hover:opacity-95"
          >
            🤖 Tự động Chia hóa đơn (Split Bill)
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[46px] w-[327px] items-center justify-center rounded-xl border border-[#cbe3f7] bg-white text-base font-semibold text-[#174f84] shadow-sm transition active:scale-[0.98] hover:bg-slate-50"
          >
            Hủy giao dịch
          </button>
          
          <button
            type="button"
            onClick={onBorrowFund}
            className="text-xs font-medium text-[#565e74] hover:underline mt-1"
          >
            Hoặc: Mượn từ Quỹ Trải nghiệm
          </button>
        </div>
      </div>
    </aside>
  );
}

function BudgetBar({
  label,
  value,
  max,
  tone,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  tone: "safe" | "danger";
  caption?: string;
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-base font-medium leading-6 text-[#112945]">{label}</span>
        <span className="flex items-center gap-1 text-base font-bold leading-6 tabular-nums text-[#112945]">
          {currency.format(value)}đ
          {tone === "danger" ? (
            <FigmaNodeImage
              alt=""
              asset={figmaNodeAssets.dangerIcon}
              className="size-3.5"
              ariaHidden
            />
          ) : null}
        </span>
      </div>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#e9eef5]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone === "danger"
              ? "bg-[#dc2626] shadow-[0_0_14px_rgba(220,38,38,0.55)]"
              : "bg-[#BFE6C3]"
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {caption ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium leading-[17px] text-[#dc2626]">
          <FigmaNodeImage
            alt=""
            asset={figmaNodeAssets.dangerIcon}
            className="size-3.5"
            ariaHidden
          />
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function FigmaNodeImage({
  asset,
  alt,
  className,
  ariaHidden = false,
}: {
  asset: { nodeId: string; src: string };
  alt: string;
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <img
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      className={className}
      data-figma-file-key={figmaFileKey}
      data-node-id={asset.nodeId}
      src={asset.src}
    />
  );
}
