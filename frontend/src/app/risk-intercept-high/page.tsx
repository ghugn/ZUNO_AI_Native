"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── SVG Icons extracted directly from Figma API node exports ───────────────

/** node_216_345 — Shield Lock (24×30) — bên cạnh tiêu đề PHÁT HIỆN GIAO DỊCH */
function ShieldLockIcon() {
  return (
    <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 30C8.525 29.125 5.65625 27.1312 3.39375 24.0187C1.13125 20.9062 0 17.45 0 13.65V4.5L12 0L24 4.5V13.65C24 17.45 22.8688 20.9062 20.6063 24.0187C18.3438 27.1312 15.475 29.125 12 30ZM9 21H15C15.425 21 15.7812 20.8563 16.0688 20.5688C16.3563 20.2812 16.5 19.925 16.5 19.5V15C16.5 14.575 16.3563 14.2188 16.0688 13.9312C15.7812 13.6437 15.425 13.5 15 13.5V12C15 11.175 14.7062 10.4688 14.1187 9.88125C13.5312 9.29375 12.825 9 12 9C11.175 9 10.4688 9.29375 9.88125 9.88125C9.29375 10.4688 9 11.175 9 12V13.5C8.575 13.5 8.21875 13.6437 7.93125 13.9312C7.64375 14.2188 7.5 14.575 7.5 15V19.5C7.5 19.925 7.64375 20.2812 7.93125 20.5688C8.21875 20.8563 8.575 21 9 21ZM10.5 13.5V12C10.5 11.575 10.6437 11.2188 10.9312 10.9312C11.2188 10.6437 11.575 10.5 12 10.5C12.425 10.5 12.7812 10.6437 13.0688 10.9312C13.3563 11.2188 13.5 11.575 13.5 12V13.5H10.5Z"
        fill="#EF4444"
      />
    </svg>
  );
}

/** node_216_357 — Cancel Circle (20×20) — icon trên nút Hủy giao dịch */
function CancelCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C10.9 18 11.7667 17.8542 12.6 17.5625C13.4333 17.2708 14.2 16.85 14.9 16.3L3.7 5.1C3.15 5.8 2.72917 6.56667 2.4375 7.4C2.14583 8.23333 2 9.1 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18ZM16.3 14.9C16.85 14.2 17.2708 13.4333 17.5625 12.6C17.8542 11.7667 18 10.9 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C9.1 2 8.23333 2.14583 7.4 2.4375C6.56667 2.72917 5.8 3.15 5.1 3.7L16.3 14.9Z"
        fill="white"
      />
    </svg>
  );
}

/** node_216_362 — Video Camera (20×16) — icon trên nút Xác thực sinh trắc học */
function VideoCameraIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H14C14.55 0 15.0208 0.195833 15.4125 0.5875C15.8042 0.979167 16 1.45 16 2V6.5L20 2.5V13.5L16 9.5V14C16 14.55 15.8042 15.0208 15.4125 15.4125C15.0208 15.8042 14.55 16 14 16H2ZM2 14H14V2H2V14ZM2 14V2V14Z"
        fill="#F0F6FC"
      />
    </svg>
  );
}

/** node_216_375 — Security Badge (18×20) — huy hiệu bảo mật góc avatar */
function SecurityBadgeIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.95427 20C3.7616 18.9242 2.13163 17.1886 1.06435 14.793C-0.00292435 12.3974 -0.267324 9.93289 0.271152 7.39956L1.56775 1.29957L10.2054 2.75431e-05L17.5677 4.70048L16.2711 10.8005C16.0479 11.8505 15.6935 12.8421 15.2077 13.7753C14.7219 14.7085 14.125 15.5702 13.417 16.3604L11.0941 12.7833C11.3447 12.5056 11.5522 12.2057 11.7165 11.8835C11.8808 11.5613 12.0019 11.2169 12.0798 10.8502C12.3136 9.75024 12.1221 8.72532 11.5053 7.77549C10.8885 6.82565 10.0301 6.23383 8.93007 6.00002C7.83007 5.76621 6.80515 5.95772 5.85532 6.57455C4.90548 7.19137 4.31366 8.04979 4.07985 9.14979C3.84603 10.2498 4.03754 11.2747 4.65437 12.2245C5.2712 13.1744 6.12962 13.7662 7.22961 14C7.57961 14.0744 7.93519 14.1021 8.29634 14.083C8.65749 14.064 9.00755 13.9947 9.34652 13.8751L11.8913 17.7606C11.0177 18.4285 10.0815 18.9611 9.08247 19.3584C8.08348 19.7558 7.04075 19.9696 5.95427 20ZM7.65473 12C7.10473 11.8831 6.67552 11.5872 6.36711 11.1123C6.05869 10.6374 5.96294 10.1249 6.07984 9.5749C6.19675 9.0249 6.49266 8.59569 6.96758 8.28728C7.4425 7.97886 7.95495 7.88311 8.50495 8.00002C9.05495 8.11692 9.48416 8.41283 9.79257 8.88775C10.101 9.36267 10.1967 9.87513 10.0798 10.4251C9.96293 10.9751 9.66702 11.4043 9.1921 11.7127C8.71718 12.0212 8.20473 12.1169 7.65473 12Z"
        fill="white"
      />
    </svg>
  );
}

/** node_216_391 — Three Dots Vertical (4×16) — nút More Options */
function MoreVerticalIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z"
        fill="#EF4444"
      />
    </svg>
  );
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

export default function RiskInterceptHighPage() {
  // Countdown: 14:59 = 899 giây (theo Figma)
  const [timeLeft, setTimeLeft] = useState(899);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <main
      className="flex min-h-dvh justify-center bg-black"
      style={{ fontFamily: "var(--font-inter, Inter, sans-serif)" }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "393px",
          maxHeight: "852px",
          background: "linear-gradient(180deg, rgba(17,41,69,1) 0%, rgba(77,120,168,1) 8%, rgba(247,248,250,1) 100%)",
        }}
      >
        {/* ── Background red glow atmosphere ── */}
        <div
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: "150px",
            height: "400px",
            background:
              "radial-gradient(ellipse 280px 220px at 50% 40%, rgba(239,68,68,0.10) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        {/* ════════════════════════════════════════════════════════
            Header - Top AppBar  |  390×80  |  HORIZONTAL
            ════════════════════════════════════════════════════════ */}
        <header
          className="relative z-10 flex shrink-0 items-center justify-between"
          style={{
            width: "390px",
            height: "80px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Left: Back button */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== "undefined") {
                window.location.href = getBackUrl();
              }
            }}
            className="text-xs font-semibold text-white/70 hover:text-white transition hover:underline flex items-center gap-1 z-50 cursor-pointer"
            style={{ minWidth: "80px", height: "40px" }}
          >
            ← Quay lại
          </a>

          {/* Center cluster: Avatar + Name */}
          <div className="flex items-center justify-center" style={{ gap: "8px", height: "40px" }}>
            <div
              className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
              style={{
                width: "32px",
                height: "32px",
                border: "1.5px solid #EF4444",
                background: "rgba(255,255,255,0.00)",
                flexShrink: 0,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full text-white font-bold text-xs"
                style={{ width: "28px", height: "28px", background: "#1a2f4a" }}
              >
                Z
              </div>
            </div>
            <span
              className="block whitespace-nowrap"
              style={{
                fontSize: "15px",
                fontWeight: 700,
                lineHeight: "20px",
                color: "#F0F6FC",
              }}
            >
              ZUNO Secretary
            </span>
          </div>

          {/* Right: Button */}
          <button
            type="button"
            aria-label="More options"
            className="flex items-center justify-center rounded-full"
            style={{ width: "40px", height: "40px", background: "transparent", border: "none", cursor: "pointer", minWidth: "40px" }}
          >
            <div style={{ width: "4px", height: "16px" }}>
              <MoreVerticalIcon />
            </div>
          </button>
        </header>

        {/* ════════════════════════════════════════════════════════
            Main Alert Content
            ════════════════════════════════════════════════════════ */}
        <div
          className="relative z-10 flex flex-1 flex-col overflow-y-auto no-scrollbar"
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingBottom: "128px",
          }}
        >
          <div style={{ width: "361px" }}>

            {/* Alert Shield Header */}
            <div style={{ paddingBottom: "32px", width: "346.1px" }}>
              <div
                className="flex items-start"
                style={{ gap: "8px", width: "346.1px", height: "64px" }}
              >
                <div
                  className="flex shrink-0 items-start justify-center"
                  style={{ width: "24px", height: "30px", paddingTop: "2px" }}
                >
                  <ShieldLockIcon />
                </div>

                <div style={{ paddingLeft: "12.55px", paddingRight: "12.55px", width: "314.1px" }}>
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      lineHeight: "32px",
                      color: "#EF4444",
                      margin: 0,
                      width: "289px",
                    }}
                  >
                    PHÁT HIỆN GIAO DỊCH BẤT THƯỜNG
                  </h1>
                </div>
              </div>
            </div>

            {/* Central Character / Police AI */}
            <div
              className="flex items-center justify-center"
              style={{ width: "361px", paddingBottom: "32px" }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{ width: "120px", height: "120px" }}
              >
                {/* Glow halo */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(239, 68, 68, 0.20)" }}
                />

                {/* Avatar circle */}
                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: "92px",
                    height: "92px",
                    background: "#2D333B",
                    border: "1.5px solid rgba(239, 68, 68, 0.40)",
                    padding: "4px",
                  }}
                >
                  {/* Avatar fallback */}
                  <div
                    className="overflow-hidden rounded-full flex items-center justify-center"
                    style={{ width: "84px", height: "84px", background: "#1a2f4a" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#EF4444"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#EF4444"/>
                    </svg>
                  </div>

                  {/* Security Badge Overlay */}
                  <div
                    className="absolute flex items-center justify-center"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "#EF4444",
                      border: "1px solid rgba(255,255,255,0.20)",
                      bottom: "-8px",
                      right: "-8px",
                      boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
                    }}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <SecurityBadgeIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message Card */}
            <div style={{ width: "358px", paddingBottom: "32px" }}>
              <div
                className="relative overflow-hidden"
                style={{
                  width: "364px",
                  height: "232px",
                  borderRadius: "16px",
                  background: "rgba(22, 27, 34, 0.40)",
                  border: "1px solid rgba(239, 68, 68, 0.20)",
                  padding: "24px",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0"
                  style={{
                    width: "4px",
                    height: "230px",
                    background: "#EF4444",
                    borderRadius: "16px 0 0 16px",
                  }}
                />

                <div className="flex flex-col items-center text-center w-full">
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "26px",
                      color: "#F0F6FC",
                      margin: "0",
                    }}
                  >
                    <span style={{ color: "#EF4444" }}>ZUNO</span> phát hiện giao dịch chuyển tiền
                  </p>

                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "26px",
                      color: "#F0F6FC",
                      margin: "0 0 10px 0",
                    }}
                  >
                    <span style={{ color: "#EF4444" }}>3.200.000đ</span> vào lúc <span style={{ color: "#EF4444" }}>02:45 AM</span> khác thường so với thói quen chi tiêu của bạn
                  </p>

                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: 400,
                      lineHeight: "26px",
                      color: "#F0F6FC",
                      margin: "0",
                    }}
                  >
                    Hệ thống đã tự động tạm giữ giao dịch này và gửi yêu cầu xác thực bảo mật tới ngân hàng liên kết.
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex w-full justify-center" style={{ paddingBottom: "40px" }}>
              <div className="flex flex-col items-center text-center">
                <div style={{ paddingBottom: "8px" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      lineHeight: "16px",
                      color: "#FF7575",
                      margin: 0,
                    }}
                  >
                    TỰ ĐỘNG HỦY SAU
                  </p>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', 'Courier New', monospace)",
                    fontSize: "56px",
                    fontWeight: 700,
                    lineHeight: "56px",
                    color: "#EF4444",
                    margin: 0,
                    textShadow: "0 0 24px rgba(239,68,68,0.55)",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-1px",
                  }}
                >
                  {mm}:{ss}
                </p>
              </div>
            </div>

            {/* Action Cluster */}
            <div
              className="flex flex-col"
              style={{ width: "361px", gap: "16px" }}
            >
              {/* Button 1: HỦY GIAO DỊCH & KHÓA THẺ KHẨN CẤP */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = getBackUrl();
                  }
                }}
                className="flex items-center justify-center transition-opacity hover:opacity-90 active:opacity-75"
                style={{
                  width: "361px",
                  height: "60px",
                  borderRadius: "12px",
                  background: "#EF4444",
                  border: "none",
                  cursor: "pointer",
                  gap: "8px",
                  padding: "20px 0",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.35)",
                }}
              >
                <div style={{ width: "20px", height: "20px", flexShrink: 0 }}>
                  <CancelCircleIcon />
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    lineHeight: "28px",
                    color: "#FFFFFF",
                  }}
                >
                  HỦY GIAO DỊCH &amp; KHÓA THẺ KHẨN CẤP
                </span>
              </button>

              <div className="flex flex-col" style={{ width: "361px", gap: "8px" }}>
                {/* Button 2: Xác thực sinh trắc học */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = getBackUrl();
                    }
                  }}
                  className="flex items-center justify-center transition-opacity hover:opacity-90 active:opacity-75"
                  style={{
                    width: "361px",
                    height: "60px",
                    borderRadius: "12px",
                    background: "rgba(26, 31, 38, 0.20)",
                    border: "1px solid rgba(201, 209, 217, 0.30)",
                    cursor: "pointer",
                    gap: "11.99px",
                    padding: "16px 0",
                  }}
                >
                  <div style={{ width: "20px", height: "16px", flexShrink: 0 }}>
                    <VideoCameraIcon />
                  </div>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      lineHeight: "24px",
                      color: "#F0F6FC",
                    }}
                  >
                    Xác thực sinh trắc học để tự mở khóa
                  </span>
                </button>

                {/* Footer note */}
                <div
                  className="flex items-center justify-center"
                  style={{ width: "361px", height: "30px", paddingLeft: "16px", paddingRight: "16px" }}
                >
                  <p
                    className="text-center"
                    style={{
                      fontSize: "10px",
                      fontWeight: 400,
                      lineHeight: "15px",
                      color: "#000000",
                      margin: 0,
                      width: "296px",
                    }}
                  >
                    Hệ thống sử dụng Dynamic Biometrics (Sinh trắc học động) để chống lại các cuộc tấn công Deepfake &amp; hình ảnh giả mạo.
                  </p>
                </div>
              </div>
            </div>
            {/* /Action Cluster */}

          </div>
        </div>
      </div>
    </main>
  );
}
