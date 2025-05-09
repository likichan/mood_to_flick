'use client';
import "../styles/moodCard.css";

type Props = {
  mood: string;
  description: string;
  onClick: () => void;
};

export default function MoodCard({ mood, description, onClick }: Props) {
  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 cursor-pointer hover:bg-white/20 transition-all duration-300"
      onClick={onClick}
    >
      <h3 className="text-2xl font-bold mb-2">{mood}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
} 


