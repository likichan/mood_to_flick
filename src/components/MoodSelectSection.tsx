import MoodCard from "@/components/MoodCard";
import { useRouter } from "next/navigation";

const moods = [
  {
    mood: "元気になりたい",
    description: "明るく楽しい気分の時に見たい映画"
  },
  {
    mood: "リラックスしたい",
    description: "心が沈んでいる時に見たい映画"
  },
  {
    mood: "思いっきり笑いたい",
    description: "やる気に満ち溢れている時に見たい映画"
  },
  {
    mood: "しんみりしたい",
    description: "感動したい・泣きたい時に見たい映画"
  },
  {
    mood: "まったりしたい",
    description: "ぼーっとしたい・癒されたい時に見たい映画"
  },
  {
    mood: "戸惑いたい",
    description: "ミステリーやどんでん返しを味わいたい時に"
  },
  {
    mood: "ドキドキしたい",
    description: "驚きやスリルを味わいたい時に"
  },
  {
    mood: "刺激が欲しい",
    description: "冒険やアクションを楽しみたい時に"
  },
];

const MoodSelectSection = () => {
  const router = useRouter();
  const handleMoodClick = (mood: string) => {
    router.push(`/recommend?mood=${encodeURIComponent(mood)}`);
  };
  return (
    <section id="mood-section" className="flex flex-col items-center">
      <div className="text-2xl text-white">あなたの"今"に合う映画を見つけよう</div>
      <p className="mt-6 text-white">今のあなたの気持ちに近いものを選んでください</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {moods.map((mood, index) => (
          <MoodCard
            key={index}
            mood={mood.mood}
            description={mood.description}
            onClick={() => handleMoodClick(mood.mood)}
          />
        ))}
      </div>
    </section>
  );
};

export default MoodSelectSection; 