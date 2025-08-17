/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useEffect, useState, useMemo } from "react";
import {
  XMarkIcon,
  PlusIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

interface Chat {
  _id: string;
  name: string;
  updatedAt: string;
}

interface SearchProps {
  onClose: () => void;
}
export default function Search({ onClose }: SearchProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/channels");
        if (!res.ok)
          throw new Error((await res.json()).error || "Failed to load chats");

        const data = await res.json();
        setChats(data.chats || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);
  const filteredChats = useMemo(() => {
    if (!query.trim()) return chats;
    return chats.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [chats, query]);

  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  const todayChats = filteredChats.filter((c) =>
    dayjs(c.updatedAt).isSame(today, "day")
  );
  const yesterdayChats = filteredChats.filter((c) =>
    dayjs(c.updatedAt).isSame(yesterday, "day")
  );
  const olderChats = filteredChats.filter(
    (c) =>
      !dayjs(c.updatedAt).isSame(today, "day") &&
      !dayjs(c.updatedAt).isSame(yesterday, "day")
  );
  const highlightMatch = (text: string) => {
    if (!query) return text;
    const re = new RegExp(`(${query})`, "gi");
    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <span
          key={i}
          className="bg-[#C0C0C1] text-black rounded-full px-2 py-0.5 mx-0.5"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleNewChat = () => {
    onClose();
    router.push("/chat/");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="
            bg-[#1e1e21]
            overflow-hidden
            flex flex-col
            w-full h-full
            sm:w-[500px] sm:max-h-[80vh] sm:rounded-xl sm:h-auto
            shadow-lg
          "
        >
          <div
            className="
              flex items-center
              px-4 py-3
              sm:px-6 sm:py-4
              border-b border-gray-700
            "
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="
                flex-1
                bg-transparent outline-none
                text-white placeholder-gray-400
                text-base sm:text-sm
                px-3 py-2 sm:px-3 sm:py-2
                rounded-md
                border border-gray-700 focus:border-[#C0C0C1]
                transition
              "
            />
            <button
              onClick={onClose}
              className="ml-3 p-2 rounded-full hover:bg-gray-700 transition"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>
          {error && (
            <div className="bg-red-900 text-red-200 px-6 py-3 text-sm">
              {error}
            </div>
          )}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <ul className="text-sm">
              <li
                onClick={handleNewChat}
                className="
                  mx-3 mt-4 mb-2
                  px-4 py-3
                  hover:bg-[#444444]
                  cursor-pointer transition
                  flex items-center gap-3
                  rounded-lg
                "
              >
                <PlusIcon className="w-5 h-5 text-gray-300" />
                <span className="text-white">New chat</span>
              </li>
              {todayChats.length > 0 && (
                <>
                  <div className="px-6 pt-6 pb-3 text-xs uppercase text-gray-400 tracking-wider">
                    Today
                  </div>
                  {todayChats.map((chat) => (
                    <Link
                      key={chat._id}
                      href={`/chat/${chat._id}`}
                      onClick={onClose}
                    >
                      <li className="mx-3 mb-2 px-4 py-3 hover:bg-[#444444] cursor-pointer transition flex items-center gap-3 rounded-lg">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-300" />
                        <span className="text-white">{highlightMatch(chat.name)}</span>
                      </li>
                    </Link>
                  ))}
                </>
              )}
              {yesterdayChats.length > 0 && (
                <>
                  <div className="px-6 pt-8 pb-3 text-xs uppercase text-gray-400 tracking-wider">
                    Yesterday
                  </div>
                  {yesterdayChats.map((chat) => (
                    <Link
                      key={chat._id}
                      href={`/chat/${chat._id}`}
                      onClick={onClose}
                    >
                      <li className="mx-3 mb-2 px-4 py-3 hover:bg-[#444444] cursor-pointer transition flex items-center gap-3 rounded-lg">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-300" />
                        <span className="text-white">{highlightMatch(chat.name)}</span>
                      </li>
                    </Link>
                  ))}
                </>
              )}
              {olderChats.length > 0 && (
                <>
                  <div className="px-6 pt-8 pb-3 text-xs uppercase text-gray-400 tracking-wider">
                    Older
                  </div>
                  {olderChats.map((chat) => (
                    <Link
                      key={chat._id}
                      href={`/chat/${chat._id}`}
                      onClick={onClose}
                    >
                      <li className="mx-3 mb-2 px-4 py-3 hover:bg-[#444444] cursor-pointer transition flex items-center gap-3 rounded-lg">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-gray-300" />
                        <span className="text-white">{highlightMatch(chat.name)}</span>
                      </li>
                    </Link>
                  ))}
                </>
              )}
              {!loading && filteredChats.length === 0 && (
                <div className="px-6 py-10 text-center text-gray-500 text-sm">
                  No chats found.
                </div>
              )}
              {loading && (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  Loading chats...
                </div>
              )}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
