/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
const botIconURL = "https://images-ext-1.discordapp.net/external/b8zcWkli7-1gfgPERCgPuNFHVDlunLf_0dD17nlZBec/%3Fsize%3D512/https/cdn.discordapp.com/avatars/1152592127075823696/dd73290e4b2b1e9c799ae8160436bef0.webp?format=webp&width=704&height=704";
export default function NotFound() {
  const router = useRouter();
  const [lights, setLights] = useState<JSX.Element[]>([]);
  useEffect(() => {
    const arr: JSX.Element[] = [];
    for (let i = 0; i < 7; i++) {
      const size = 300 + Math.random() * 300;
      const colors = ["#1e3a8a", "#3b82f6", "#4338ca", "#2563eb"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const dur = 10 + Math.random() * 10;
      const del = Math.random() * 5;
      arr.push(
        <div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20 animate-lightMove"
          style={{
            background: color,
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animationDuration: `${dur}s`,
            animationDelay: `${del}s`,
          }}
        />
      );
    }
    setLights(arr);
  }, []);
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center text-white overflow-hidden px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        {lights}
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
      </div>
      <header className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="relative w-10 h-10 rounded-full overflow-hidden shadow border border-white/20">
          <Image src={botIconURL} alt="AdmiBot" fill className="object-cover" priority />
        </div>
        <span className="text-xl font-bold">AdmiBot</span>
      </header>
      <div className="z-10 text-center space-y-6">
        <h1 className="text-7xl font-extrabold">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="max-w-lg text-gray-300">
          We can’t find that page. It may have moved or never existed.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.replace("/")}
            className="py-3 px-6 rounded-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold text-lg shadow-lg shadow-blue-500/30"
          >
            Go to Home
          </button>
          <button
            onClick={() => router.back()}
            className="py-3 px-6 rounded-full bg-gray-800 hover:bg-gray-700 transition text-white font-semibold text-lg shadow-lg shadow-black/30"
          >
            Go Back
          </button>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 select-none">
        V3.0.6-r4
      </div>
    </main>
  );
}
