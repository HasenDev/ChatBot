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
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import AccountSettings from "@/components/AccountSettings";
import Logout from "@/components/Logout";
import Search from "@/components/Search";
import yaml from "js-yaml";

interface Chat {
  chatId: string;
  name: string;
}

interface ApiChat {
  _id: string;
  name: string;
  updatedAt: string;
}
interface ApiResponse {
  chats: ApiChat[];
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
}

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

const ChatListSkeleton = () => {
  const SkeletonItem = ({ width = "w-full" }: { width?: string }) => (
    <div className={`${width} h-9 bg-gray-800/50 rounded-md overflow-hidden relative`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8DA195]/30 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
  return (
    <div className="space-y-1">
      {[
        "w-full",
        "w-10/12",
        "w-11/12",
        "w-full",
        "w-8/12",
        "w-10/12",
        "w-9/12",
        "w-full",
        "w-10/12",
        "w-11/12",
      ].map((w, i) => (
        <SkeletonItem key={i} width={w} />
      ))}
    </div>
  );
};

const UserSkeleton = ({ collapsed }: { collapsed?: boolean }) => (
  <div className={`flex items-center gap-3 p-2 ${collapsed ? "justify-center" : ""}`}>
    <div className={`${collapsed ? "w-7 h-7" : "w-9 h-9"} bg-gray-800 rounded-full animate-pulse`} />
    {!collapsed && (
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
        <div className="h-2 bg-gray-800 rounded w-1/4 animate-pulse" />
      </div>
    )}
  </div>
);

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveringBot, setHoveringBot] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [errorChats, setErrorChats] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const selectedChatId = pathname?.split("/chat/")[1] ?? "";
  const didInitialFetch = useRef(false);
  const fetchAttempts = useRef<Record<string, number>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot", iconPath: "/favicon.ico" });

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

  const fetchChats = useCallback(async () => {
    setLoadingChats(true);
    setErrorChats(false);
    try {
      const res = await fetch("/api/channels");
      if (!res.ok) throw new Error();
      const data: ApiResponse = await res.json();
      if (Array.isArray(data.chats)) {
        setChats(data.chats.map((c) => ({ chatId: c._id, name: c.name })));
      } else {
        setChats([]);
      }
    } catch {
      setErrorChats(true);
      setChats([]);
    } finally {
      setLoadingChats(false);
      didInitialFetch.current = true;
    }
  }, []);

  useEffect(() => {
    if (!didInitialFetch.current) fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!selectedChatId || loadingChats || chats.find((c) => c.chatId === selectedChatId)) return;
    const attempts = fetchAttempts.current[selectedChatId] || 0;
    if (attempts < 2) {
      fetchChats();
      fetchAttempts.current[selectedChatId] = attempts + 1;
    }
  }, [selectedChatId, chats, fetchChats, loadingChats]);

  const fetchUser = useCallback(async () => {
    setLoadingUser(true);
    setErrorUser(false);
    try {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error();
      const payload = await res.json();
      const u: UserProfile = {
        id: payload.user.id ?? payload.user._id,
        username: payload.user.displayName || payload.user.username,
        email: payload.user.email,
        avatar: payload.user.avatar || null,
      };
      setUser(u);
    } catch {
      setErrorUser(true);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const mobilePaddingStyle: React.CSSProperties | undefined = isMobile
    ? { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 65px)" }
    : undefined;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) setMobileOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [collapsed, setMobileOpen]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [dropdownOpen]);

  const sidebarWidth = isMobile ? (mobileOpen ? "260px" : "0px") : collapsed ? "72px" : "260px";

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed md:static top-0 left-0 h-screen bg-[#181818] text-white overflow-hidden z-40 flex flex-col"
      >
        <div className="flex items-center justify-between py-4 border-b border-gray-700 mx-3 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHoveringBot(true)}
            onMouseLeave={() => setHoveringBot(false)}
            onClick={() => collapsed && setCollapsed(false)}
            role="button"
            tabIndex={0}
          >
            <div className={`flex items-center justify-center rounded-full transition-all duration-200 ${collapsed ? "w-12 h-12" : "w-9 h-9"}`}>
              <AnimatePresence mode="wait">
                {collapsed && hoveringBot ? (
                  <motion.div key="expand" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-300" />
                  </motion.div>
                ) : (
                  <motion.div key="bot" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Image src={config.iconPath ?? "/favicon.ico"} width={32} height={32} alt={config.siteName ?? "AdmiBot"} className="rounded-full" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {!collapsed && !isMobile && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="font-bold text-lg">
                {config.siteName ?? "AdmiBot"}
              </motion.span>
            )}
          </div>
          {!isMobile && !collapsed && (
            <button onClick={() => setCollapsed(true)} className="p-2 hover:bg-[#303030] rounded-md transition">
              <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
          {isMobile && mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-[#303030] rounded-md transition">
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-7rem)]">
          <div className="space-y-3 mt-3">
            <button onClick={() => router.push("/chat")} className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} py-2 px-3 rounded-lg hover:bg-[#303030] transition text-sm font-medium`}>
              <PlusIcon className="w-5 h-5 text-gray-300" />
              {!collapsed && <span>New chat</span>}
            </button>

            <button onClick={() => setShowSearch(true)} className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} py-2 px-3 rounded-lg hover:bg-[#303030] transition text-sm font-medium`}>
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-300" />
              {!collapsed && <span>Search chats</span>}
            </button>

            {!collapsed && (
              <AnimatePresence mode="wait">
                <motion.div key={loadingChats ? "loading" : errorChats ? "error" : "content"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <p className="text-xs text-gray-500 uppercase mt-4 mb-2 tracking-wide">Chats</p>
                  {errorChats ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-2 text-red-400 text-center px-2">
                      <ExclamationTriangleIcon className="w-8 h-8" />
                      <span>Failed to fetch chats.</span>
                      <button onClick={fetchChats} className="mt-2 px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition text-sm text-white">Retry</button>
                    </div>
                  ) : loadingChats ? (
                    <ChatListSkeleton />
                  ) : chats.length > 0 ? (
                    <div className="space-y-1">
                      {chats.map((chat) => (
                        <button key={chat.chatId} onClick={() => router.push(`/chat/${chat.chatId}`)} className={`w-full text-left py-2 px-3 rounded-lg text-sm transition truncate ${selectedChatId === chat.chatId ? "bg-[#212121] text-white" : "hover:bg-[#303030] text-gray-300"}`}>
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{chat.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-10 space-y-3 text-gray-500">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-10 h-10" />
                      <p className="text-sm">No saved chats yet.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 p-3 relative shrink-0" style={mobilePaddingStyle}>
          {loadingUser ? (
            <UserSkeleton collapsed={collapsed} />
          ) : errorUser ? (
            <div className="flex items-center justify-between text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <button onClick={fetchUser} className="ml-auto text-sm text-red-200 hover:underline">Retry</button>
            </div>
          ) : user ? (
            <div>
              <div onClick={() => setDropdownOpen((o) => !o)} className={`flex items-center gap-3 p-2 rounded-md transition cursor-pointer hover:bg-[#303030] ${collapsed ? "justify-center" : ""}`} role="button" tabIndex={0}>
                {user.avatar ? (
                  <Image src={user.avatar} width={32} height={32} alt={user.username} className="rounded-full" />
                ) : (
                  <div className={`${collapsed ? "w-7 h-7" : "w-9 h-9"} rounded-full flex items-center justify-center text-white font-bold transition-all duration-200`} style={{ backgroundColor: stringToColor(user.username) }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}

                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.username}</span>
                    <span className="text-xs text-gray-400">Free</span>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {dropdownOpen && !collapsed && (
                  <motion.div ref={dropdownRef} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="absolute bottom-[74px] left-3 right-3 bg-[#1f1f23] rounded-md shadow-lg border border-gray-700 overflow-hidden z-50">
                    <button onClick={() => { setDropdownOpen(false); setShowSettings(true); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[#303030] flex items-center gap-2">
                      <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>

                    <div className="border-t border-gray-700" />

                    <button onClick={() => { setDropdownOpen(false); setShowLogout(true); }} className="w-full text-left px-4 py-2 text-sm hover:bg-[#303030] flex items-center gap-2">
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-400" />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </motion.aside>

      <AnimatePresence>
        {showSettings && <AccountSettings onClose={() => setShowSettings(false)} />}
        {showLogout && <Logout onClose={() => setShowLogout(false)} />}
        {showSearch && <Search onClose={() => setShowSearch(false)} />}
      </AnimatePresence>
    </>
  );
}
