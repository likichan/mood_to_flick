"use client";
import Link from "next/link";
import { Indie_Flower } from "next/font/google";
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { LuLogOut, LuLogIn } from "react-icons/lu";
import { CgProfile } from "react-icons/cg";

const IndieFlower = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

export default function Header() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <header
      className="relative overflow-hidden h-[148px] text-[#FFB030] text-6xl pt-6 flex items-center justify-between"
      style={{ paddingLeft: "120px", paddingRight: "120px" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#303792] -z-10" />
      <Link href="/" className={`relative z-10 ${IndieFlower.className} cursor-pointer`}>
        Mood To Flicks
      </Link>
      <div className="flex items-center">
        {user ? (
          <>
            <button
              onClick={() => { window.location.href = "/mypage"; }}
              className="relative z-10 text-white ml-8 flex items-center"
              style={{ fontSize: '1.5rem', height: '64px' }}
            >
              <CgProfile size={32} />
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="relative z-10 text-white ml-4 flex items-center"
              style={{ fontSize: '1.5rem', height: '64px' }}
            >
              <LuLogOut size={32} />
            </button>
          </>
        ) : (
          <button
            onClick={() => { window.location.href = "/auth"; }}
            className="relative z-10 text-white ml-8 flex items-center"
            style={{ fontSize: '1.5rem', height: '64px' }}
          >
            <LuLogIn size={32} />
          </button>
        )}
      </div>
    </header>
  );
}
