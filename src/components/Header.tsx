import { Indie_Flower } from "next/font/google";

const IndieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

export default function Header() {

  return (
    <header className="relative overflow-hidden h-[148px] text-[#FFB030] text-6xl"
    style={{ paddingLeft: "120px", paddingRight: "120px" }}>
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#303792] -z-10" />
      <div className={`relative z-10 ${ IndieFlower.className }`}>Mood To Flicks</div>
    </header>
  );

}
