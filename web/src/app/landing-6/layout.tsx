import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeRoot } from "./components/ThemeRoot";
import "./tokens.css";

// JetBrains Mono có subset "vietnamese" trên Google Fonts, nên mọi bề mặt HUD
// (vốn dùng mono) hiển thị đủ dấu mà không phải rơi về sans.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["vietnamese", "latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phở Cổ — Giữ gìn · Bảo vệ · Tái hiện",
  description:
    "Hành trình đi tìm hương vị đã mất giữa 36 phố phường Hà Nội. Sưu tầm công thức, mở rương cổ, chọn phe Phở Bắc hay Phở Nam.",
  openGraph: {
    type: "website",
    siteName: "Phở Cổ",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
    title: "Phở Cổ — Giữ gìn · Bảo vệ · Tái hiện",
    description:
      "Hành trình đi tìm hương vị đã mất giữa 36 phố phường Hà Nội. Sưu tầm công thức, mở rương cổ, chọn phe Phở Bắc hay Phở Nam.",
  },
};

export default function Landing6Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeRoot className={`l6 ${jetbrainsMono.variable}`}>{children}</ThemeRoot>
  );
}
