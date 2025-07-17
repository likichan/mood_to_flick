// src/app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // URLの#access_token=...などを消す
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    // 少し待ってからトップページへ遷移
    setTimeout(() => {
      router.replace("/");
    }, 100);
  }, [router]);

  return <div className="flex items-center justify-center min-h-screen text-white">ログイン処理中...</div>;
}
