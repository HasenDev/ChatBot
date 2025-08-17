/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ChatDetailPage = dynamic(() => import("./page"), { ssr: false });
export default function ChatWrapper() {
  const { chatId } = useParams();
  const [mountedChatId, setMountedChatId] = useState<string | null>(null);
  useEffect(() => {
    if (chatId && typeof chatId === "string") {
      setTimeout(() => {
        setMountedChatId(chatId);
      }, 100);
    }
  }, [chatId]);

  return mountedChatId === chatId ? <ChatDetailPage /> : <div className="text-white p-8">Loading chat...</div>;
}
