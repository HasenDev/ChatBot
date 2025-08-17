/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MessageBox from "@/components/MessageBox";
import UserMessage from "@/components/UserMessage";
import AIMessage from "@/components/AIMessage";
import { useModel } from "@/context/ModelContext";
import yaml from "js-yaml";

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

export default function ChatLandingPage() {
  const router = useRouter();
  const { selectedModel } = useModel();
  const [messages, setMessages] = useState<any[]>([]);
  const [isError, setIsError] = useState(false);
  const thinkEnabled = false;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot AI", iconPath: "/favicon.ico" });

  const scrollToBottom = useCallback(() => {
    const c = containerRef.current;
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onScroll = () => {
      autoScroll.current = c.scrollHeight - (c.scrollTop + c.clientHeight) < 20;
    };
    c.addEventListener("scroll", onScroll);
    return () => c.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (autoScroll.current) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/config.yml", { cache: "no-store" });
        if (!res.ok) return;
        const txt = await res.text();
        const parsed = yaml.load(txt) as SiteConfig | undefined;
        if (mounted && parsed) setConfig((prev) => ({ ...prev, ...(parsed || {}) }));
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFirstMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setIsError(false);
      autoScroll.current = true;
      const userMsg = {
        _id: "user-" + Date.now(),
        role: "user",
        content: trimmed,
      };
      setMessages([userMsg]);
      const aiPlaceholder = {
        _id: "ai-" + Date.now(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };
      setMessages((prev) => [...prev, aiPlaceholder]);
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          model: selectedModel,
          think: thinkEnabled,
        }),
      });
      if (!res.ok) {
        console.error("send failed:", await res.text());
        setIsError(true);
        return;
      }
      const newChatId = res.headers.get("X-Chat-Id");
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m._id === aiPlaceholder._id ? { ...m, content: acc } : m
          )
        );
      }
      setMessages((prev) =>
        prev.map((m) =>
          m._id === aiPlaceholder._id ? { ...m, isStreaming: false } : m
        )
      );
      if (newChatId) {
        router.push(`/chat/${newChatId}`);
      }
    },
    [router, selectedModel]
  );

  function seedFromString(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  }

  const palettes = [
    { name: "golden", stops: ["#b07a2a", "#e0b56b", "#8b5e34"] },
    { name: "green", stops: ["#0f6b3a", "#29a16a", "#1b7a4f"] },
    { name: "blue", stops: ["#06b6d4", "#38bdf8", "#60a5fa"] },
    { name: "red", stops: ["#ff6b6b", "#ff9a8a", "#c53030"] },
  ];

  function paletteForName(name: string) {
    const seed = seedFromString(name || "admi");
    const idx = seed % palettes.length;
    return palettes[idx];
  }

  function gradientStyleForPalette(p: { stops: string[] }) {
    const g = `linear-gradient(90deg, ${p.stops[0]} 0%, ${p.stops[1]} 50%, ${p.stops[2]} 100%)`;
    return {
      backgroundImage: g,
      WebkitBackgroundClip: "text" as const,
      backgroundClip: "text" as const,
      color: "transparent",
      textShadow: `0 0 14px ${p.stops[1]}`,
    };
  }

  const displayName = config.siteName ?? "AdmiBot AI";
  const palette = paletteForName(displayName);
  const gradientStyle = gradientStyleForPalette(palette);

  return (
    <>
      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto pt-20 pb-20 text-white space-y-4 px-4 sm:px-8 md:px-16 lg:px-60 relative"
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-x-0 top-1/3 text-center"
            >
              <motion.span
                style={gradientStyle}
                className="text-2xl sm:text-3xl font-semibold drop-shadow-[0_0_6px_rgba(255,255,255,0.05)]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {displayName}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((m) =>
          m.role === "user" ? (
            <UserMessage key={m._id} id={m._id} content={m.content} />
          ) : (
            <AIMessage
              key={m._id}
              content={m.content}
              isStreaming={!!m.isStreaming}
              isError={!!m.isError}
            />
          )
        )}
      </main>

      <MessageBox
        onSend={handleFirstMessage}
        disabled={isError}
        thinkEnabled={thinkEnabled}
        onToggleThink={() => {}}
        disableThink={true}
      />
    </>
  );
}
