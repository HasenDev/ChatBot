/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useState, useRef, useEffect } from "react";
import UAParser from "ua-parser-js";
import {
  PlusIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/solid";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import yaml from "js-yaml";

interface Props {
  onSend: (message: string, think: boolean) => void;
  disabled?: boolean;
  thinkEnabled: boolean;
  onToggleThink: () => void;
  disableThink?: boolean;
}

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

export default function MessageBox({
  onSend,
  disabled,
  thinkEnabled,
  onToggleThink,
  disableThink = false,
}: Props) {
  const [message, setMessage] = useState("");
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [bottomPadding, setBottomPadding] = useState<number>(5);
  const [safeInset, setSafeInset] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot AI", iconPath: "/favicon.ico" });

  const measureSafeAreaInsetBottom = (): number => {
    if (typeof document === "undefined") return 0;
    try {
      const probe = document.createElement("div");
      probe.style.paddingBottom = "env(safe-area-inset-bottom)";
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.height = "0";
      probe.style.pointerEvents = "none";
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).paddingBottom;
      document.body.removeChild(probe);
      const px = parseFloat(computed || "") || 0;
      return px;
    } catch {
      return 0;
    }
  };

  const estimateAndroidNavBar = (): number => {
    if (typeof window === "undefined") return 0;
    const h = window.screen?.height ?? 0;
    if (!h) return 56;
    const guess = Math.round(h * 0.07);
    return Math.min(96, Math.max(48, guess));
  };

  const updateBottomPadding = () => {
    if (typeof window === "undefined") return;
    const inset = measureSafeAreaInsetBottom();
    const vv = window.visualViewport;
    const visualHeight = vv?.height ?? window.innerHeight;
    const viewportDiff = Math.max(0, window.innerHeight - visualHeight);
    let estimatedNavBar = 0;
    try {
      const parser = new UAParser(window.navigator.userAgent);
      const os = parser.getOS();
      if (os?.name === "Android") {
        estimatedNavBar = estimateAndroidNavBar();
      }
    } catch {
      estimatedNavBar = 0;
    }
    const final = Math.max(inset, viewportDiff, estimatedNavBar) + 5;
    setSafeInset(inset);
    setBottomPadding(Math.round(final));
  };

  useEffect(() => {
    const id = window.setTimeout(updateBottomPadding, 60);
    const vv = window.visualViewport;
    const onResize = () => updateBottomPadding();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    vv?.addEventListener("resize", onResize);
    vv?.addEventListener("scroll", onResize);
    document.addEventListener("visibilitychange", onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      vv?.removeEventListener("resize", onResize);
      vv?.removeEventListener("scroll", onResize);
      document.removeEventListener("visibilitychange", onResize);
    };
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newHeight = ta.scrollHeight;
    const maxHeight = 200;
    if (newHeight <= maxHeight) {
      ta.style.height = newHeight + "px";
      ta.style.overflowY = "hidden";
    } else {
      ta.style.height = maxHeight + "px";
      ta.style.overflowY = "auto";
    }
  }, [message]);

  useEffect(() => {
    if (!showAddDropdown) return;
    const t = setTimeout(() => setShowAddDropdown(false), 2500);
    return () => clearTimeout(t);
  }, [showAddDropdown]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    try {
      onSend(message.trim(), thinkEnabled);
      setMessage("");
    } catch (err) {
      console.error("MessageBox: onSend handler threw:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/config.yml", { cache: "no-store" });
        if (!res.ok) throw new Error();
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

  return (
    <div
      className="w-full px-4 sm:px-6 md:px-12 bg-[#212121]"
      style={{
        paddingBottom: `70px`,
        transition: "padding-bottom 160ms ease",
      }}
    >
      <div className="relative mx-auto max-w-3xl">
        <div className="flex flex-col bg-[#303030] rounded-2xl p-4 text-white shadow-lg border border-gray-600 space-y-6">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder="Ask anything."
            className="w-full resize-none bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base disabled:opacity-50"
            aria-label="Message input"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowAddDropdown(true)}
                  disabled={disabled}
                  className="text-gray-400 hover:text-white transition disabled:opacity-50"
                  aria-label="Add"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                {showAddDropdown && (
                  <div className="absolute left-0 bottom-full mb-2 w-max bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg flex items-center gap-2">
                    <PlusIcon className="w-4 h-4 opacity-20 absolute left-2" />
                    <span className="relative">Feature unavailable for now</span>
                  </div>
                )}
              </div>

              <button
                onClick={onToggleThink}
                disabled={disableThink}
                title={disableThink ? "Model doesn't support that feature" : ""}
                className={`flex items-center transition-colors ${thinkEnabled ? "text-blue-400" : "text-white"} ${disableThink ? "opacity-40 cursor-not-allowed" : "hover:text-blue-300"}`}
                aria-pressed={thinkEnabled}
              >
                <LightBulbIcon className="w-5 h-5 mr-1" />
                <span className="text-sm">Think</span>
              </button>
            </div>
            <button
              onClick={handleSend}
              className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={disabled || !message.trim()}
              aria-label="Send message"
            >
              <ArrowUpIcon
                className="w-4 h-4 text-black"
                style={{
                  strokeWidth: 3,
                  transform: "scale(1.1)",
                }}
              />
            </button>
          </div>
        </div>

        <div
          className="text-center mt-3 text-xs text-gray-400"
          style={{
            paddingBottom: `${Math.max(0, safeInset)}px`,
          }}
        >
          {`${config.siteName ?? "AdmiBot AI"} may display inaccurate information.`}
        </div>
      </div>
    </div>
  );
}
