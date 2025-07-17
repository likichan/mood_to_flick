// 全てのページで共通して適用される要素を管理
import type { Metadata } from "next";
import { Zen_Maru_Gothic, Indie_Flower } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "../components/Footer";
import { supabase } from '@/lib/supabaseClient';

const ZenMaruGothic = Zen_Maru_Gothic({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mood To Flick",
  description: "今日の気分に合わせて、あなただけの映画を",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-[#14161f]">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
