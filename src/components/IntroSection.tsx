import React from "react";
import { useRouter } from "next/navigation";

const IntroSection = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full h-80 bg-center bg-no-repeat bg-cover rounded-xl"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAE_h3sN_Zcb1BfMIuISV6VfR4o1hEX65KXHzENrPlJSH8Uafb7e9VrLolAZkVQ6Qq3IWKYQ1d60HvrguxyjFz5PhZXs20TuM39xJ4Liaqzu3KDkDUA3oJ78BombEeEKlK3yMWfu1LbSBfjUNRDveh-Reb5nysnHjeSnUOPAZzffWLV4LV-y8yxZHw4_3n-47_tRd-AYQosXSOUvqX2mVk8qZLd4k-UlEauawIAgFDAqxQTo5Vo1UVLho8jlBF1yi3N8AMiSHMCUKY')",
        }}
      />
      <h1 className="text-white text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
        Mood To Flick
      </h1>
      <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
        あなたの”今”に合う映画を見つけよう
      </p>
      <div className="flex px-4 py-3 justify-center">
        <button
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#324099] text-white text-sm font-bold leading-normal tracking-[0.015em]"
          onClick={() => {
            router.push("/mood");
          }}
        >
          <span className="truncate">映画を探す</span>
        </button>
      </div>
    </div>
  );
};

export default IntroSection; 