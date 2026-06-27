import type { Metadata } from "next";
import "./globals.css";
import PWARegistration from "@/components/PWARegistration";

export const metadata: Metadata = {
  title: "Zuno - Quản lý tài chính",
  description: "Zuno giúp bạn quản lý tài chính cá nhân hiệu quả",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zuno",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-primary text-primary-2 antialiased selection:bg-slate-500/20">
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
