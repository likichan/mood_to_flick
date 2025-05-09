// 全てのページで共通して適用される要素を管理
import type { Metadata } from "next";
import { Zen_Maru_Gothic, Indie_Flower } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "../components/Footer";

const ZenMaruGothic = Zen_Maru_Gothic({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mood To Flick",
  description: "今日の気分に合わせて、あなただけの映画を",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${ZenMaruGothic.className} text-white `}
      >
      <Header />
      <div className="px-[120px]"></div>
      <main>
        {children}
      </main>
      <Footer />
      </body>
    </html>
  );
}
