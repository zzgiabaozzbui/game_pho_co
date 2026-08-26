import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Fraunces } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import RegisterSW from "@/components/RegisterSW";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["vietnamese", "latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kho báu Phố cổ | Old Quarter Treasure",
  description:
    "Hành trình truy tìm kho báu văn hóa qua 36 phố phường Hà Nội xưa.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Phố cổ 36", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: "Kho báu Phố cổ",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
    title: "Kho báu Phố cổ | Old Quarter Treasure",
    description:
      "Hành trình truy tìm kho báu văn hóa qua 36 phố phường Hà Nội xưa.",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d1b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${fraunces.variable}`}>
      <body className="paper-noise min-h-dvh bg-paper text-ink antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
