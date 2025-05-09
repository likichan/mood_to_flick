'use client';

import Link from "next/link";
import MoodCard from "@/components/MoodCard";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const moods = [
    {
      mood: "元気がでる",
      description: "明るく楽しい気分の時に見たい映画"
    },
    {
      mood: "癒されたい",
      description: "心が沈んでいる時に見たい映画"
    },
    {
      mood: "笑いたい",
      description: "やる気に満ち溢れている時に見たい映画"
    },
    {
      mood: "泣きたい",
      description: "やる気に満ち溢れている時に見たい映画"
    },
    {
      mood: "ぼーっとしたい",
      description: "やる気に満ち溢れている時に見たい映画"
    }
  ];

  const handleMoodClick = (mood: string) => {
    console.log(`Selected mood: ${mood}`);
    // ここに気分が選択されたときの処理を追加
    router.push(`/recommend?mood=${encodeURIComponent(mood)}`);
  };

  return (
    <main className="flex flex-col min-h-screen" >
      <div className="text-2xl">あなたの"今"に合う映画を見つけよう</div>
      <p className="mt-6">今のあなたの気持ちに近いものを選んでください</p>
      <div className="grid grid-cols-5 gap-3 mt-6">
        {moods.map((mood, index) => (
          <MoodCard
            key={index}
            mood={mood.mood}
            description={mood.description}
            onClick={() => handleMoodClick(mood.mood)}
          />
        ))}
      </div>
    </main>
  );
}
