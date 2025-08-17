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
import { motion, useAnimationControls } from "framer-motion";
import { useTypewriter } from "react-simple-typewriter";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import yaml from "js-yaml";

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

const Lights = ({ colors = ["rgba(100,150,255,0.18)", "rgba(200,80,200,0.12)", "rgba(100,255,200,0.10)", "rgba(255,180,100,0.08)"] }: { colors?: string[] }) => {
  const presets = [
    { size: 200, left: "10%", top: "10%", dx: 40, dy: -30, dur: 18 },
    { size: 160, left: "80%", top: "5%", dx: -50, dy: 25, dur: 22 },
    { size: 140, left: "55%", top: "75%", dx: -30, dy: -20, dur: 16 },
    { size: 120, left: "30%", top: "55%", dx: 25, dy: 35, dur: 20 },
    { size: 90, left: "85%", top: "45%", dx: -20, dy: 10, dur: 14 },
  ];

  return (
    <>
      {colors.map((color, i) => {
        const p = presets[i % presets.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.06, scale: 0.9, x: 0, y: 0 }}
            animate={{
              opacity: [0.04, 0.18, 0.04],
              scale: [0.95, 1.05, 0.95],
              x: [0, p.dx, 0],
              y: [0, p.dy, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 1.2,
            }}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: "9999px",
              background: `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 40%)`,
              pointerEvents: "none",
              zIndex: -40,
              mixBlendMode: "screen",
              filter: "blur(28px)",
            }}
          />
        );
      })}
    </>
  );
};

const HeroSection = ({ text, siteName, iconPath }: { text: string; siteName: string; iconPath: string }) => (
  <div className="relative flex-1 flex flex-col justify-center items-center px-6 sm:px-10 md:px-20 text-center space-y-6 overflow-hidden">
    <motion.div
      className="absolute inset-0 -z-20 blur-3xl"
      style={{
        background:
          "radial-gradient(circle at bottom left, rgba(10,25,75,0.5), transparent 40%)," +
          "radial-gradient(circle at top left, rgba(200,50,150,0.4), transparent 40%)," +
          "radial-gradient(circle at center right, rgba(100,10,50,0.3), transparent 50%)",
        backgroundSize: "200% 200%",
      }}
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="flex flex-col items-center space-y-2 mb-4 md:flex-row md:space-x-4 md:space-y-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <div
          className="w-14 h-14 rounded-full overflow-hidden bg-transparent"
          style={{ border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Image
            src={iconPath}
            alt={`${siteName} Logo`}
            width={56}
            height={56}
            className="object-cover w-full h-full rounded-full"
            style={{ border: "none" }}
          />
        </div>
      </motion.div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">{siteName}</h1>
    </motion.div>
    <motion.p
      className="text-lg sm:text-xl md:text-2xl text-gray-300 h-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 1 }}
    >
      {text}
      <span className="ml-2 text-lg animate-pulse">●</span>
    </motion.p>
  </div>
);

const SidebarCTA = () => (
  <motion.div
    className="relative w-full md:w-[400px] flex flex-col justify-between md:justify-center items-center p-6 sm:p-8 bg-gray-900/40 backdrop-blur-md border-gray-700 shadow-xl rounded-t-3xl md:rounded-l-3xl"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <div className="flex flex-col items-center w-full space-y-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Let’s Dive In!</h2>
      <div className="flex flex-col gap-4 w-full max-w-[280px]">
        <Link href="/signin" className="py-3 rounded-full text-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 text-center shadow-lg shadow-blue-500/30">Sign In</Link>
        <Link href="/signup" className="py-3 rounded-full text-lg font-semibold bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-center border border-gray-600">Sign Up</Link>
      </div>
      <p className="mt-2 text-sm text-gray-400">Free forever — Upgrade anytime</p>
    </div>
    <div className="absolute mt-2 bottom-4 text-xs text-gray-500 hidden md:block">© {new Date().getFullYear()} — All rights reserved</div>
  </motion.div>
);

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace("/chat");
  }, [status, router]);

  const [text] = useTypewriter({
    words: ["Your AI-powered productivity partner.", "Automate tasks. Simplify your day.", "Chat smarter. Work faster.", "Next-gen assistance for everything you do."],
    loop: true,
    typeSpeed: 50,
    deleteSpeed: 30,
    delaySpeed: 3500,
  });
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot AI", iconPath: "/favicon.ico" });
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/config.yml", { cache: "no-store" });
        if (!res.ok) throw new Error("config fetch failed");
        const text = await res.text();
        const parsed = yaml.load(text) as SiteConfig | undefined;
        if (mounted && parsed) {
          setConfig((prev) => ({ ...prev, ...(parsed || {}) }));
        }
      } catch (e) {
        console.warn("Failed to load /config.yml, using defaults:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const orbControls = useAnimationControls();
  useEffect(() => {
    const animateOrb = async () => {
      while (true) {
        await orbControls.start({
          x: Math.random() * window.innerWidth - window.innerWidth / 2,
          y: Math.random() * window.innerHeight - window.innerHeight / 2,
          transition: { duration: 10, ease: "easeInOut" },
        });
      }
    };
    animateOrb();
  }, [orbControls]);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0b0b0f] text-white flex flex-col md:flex-row">
      <Lights />
      <motion.div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl -z-30" animate={orbControls} initial={{ x: 0, y: 0 }} />

      <HeroSection text={text} siteName={config.siteName ?? "AdmiBot AI"} iconPath={config.iconPath ?? "/favicon.ico"} />
      <SidebarCTA />
    </main>
  );
}
