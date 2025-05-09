import { Zen_Maru_Gothic } from "next/font/google";

const ZenMaruGothic = Zen_Maru_Gothic({
  weight: "300",
  subsets: ["latin"]
});

export default function Footer() {
  return (
    <footer className="flex gap-6 py-4 text-[#FFB030] px-[120px]">
      <div className={`${ZenMaruGothic.className}`}>©︎ 2025 MOOD TO FLICKS</div>
      <div className={`${ZenMaruGothic.className}`}>made with ♡ for your movie time</div>
    </footer>
  );
}
