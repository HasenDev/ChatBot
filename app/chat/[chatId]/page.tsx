/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import UserMessage from "@/components/UserMessage";
import { useRouter } from "next/navigation";
import AIMessage from "@/components/AIMessage";
import MessageBox from "@/components/MessageBox";
import { useModel } from "@/context/ModelContext";
import ErrorBox from "@/components/ErrorBox";
const ChatSkeleton = () => {
  const SkeletonBubble = ({
    isUser = false,
    width,
    height,
  }: {
    isUser?: boolean;
    width: string;
    height: string;
  }) => {
    const alignment = isUser ? "items-end" : "items-start";
    return (
      <div className={`flex flex-col ${alignment}`}>
        <div
          className={`relative ${width} ${height} bg-[#181818] rounded-2xl overflow-hidden`}
        >
          <motion.div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#8DA195]/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1" />
      <div className="space-y-6">
        <SkeletonBubble isUser width="w-1/3" height="h-12" />
        <SkeletonBubble width="w-4/5" height="h-24" />
        <SkeletonBubble isUser width="w-1/2" height="h-16" />
        <SkeletonBubble width="w-2/5" height="h-12" />
      </div>
    </>
  );
};
export default function ChatDetailPage() {
  const { selectedModel } = useModel();
  const { chatId } = useParams() as { chatId: string };
  const [messages, setMessages] = useState<any[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [thinkEnabled, setThinkEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const isProgrammaticScroll = useRef(false);
  const router = useRouter();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const isStreaming = Boolean(
    messages?.some((m) => m.role === "assistant" && m.isStreaming)
  );
  const scrollToBottomInstant = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    isProgrammaticScroll.current = true;
    c.scrollTo({ top: c.scrollHeight, behavior: "auto" });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 0);
  }, []);
  const scrollToBottomNotInstant = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    isProgrammaticScroll.current = true;
    c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 0);
  }, []);
  useEffect(() => {
  setMessages(null);
  setIsError(false);
  isFirstLoad.current = true;
  setAutoScrollEnabled(true);

  fetch(`/api/chat/${chatId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load chat history.");
      return res.json();
    })
    .then((data) => {
      setMessages(data.messages || []);
    })
    .catch(() => {
      setIsError(true);
      setMessages([]);
      router.push("/chat");
    });
}, [chatId, router]);
  useLayoutEffect(() => {
    if (messages && isFirstLoad.current) {
      scrollToBottomInstant();
      isFirstLoad.current = false;
    }
  }, [messages, scrollToBottomInstant]);
  useEffect(() => {
    if (
      messages &&
      !isFirstLoad.current &&
      autoScrollEnabled
    ) {
      
      scrollToBottomInstant();
    }
  }, [messages, autoScrollEnabled, scrollToBottomInstant]);
  useEffect(() => {
    if (!isStreaming && !isFirstLoad.current && autoScrollEnabled) {
      scrollToBottomInstant();
    }
  }, [isStreaming, autoScrollEnabled, scrollToBottomInstant]);
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const onScroll = () => {
      if (!isProgrammaticScroll.current) {
        setAutoScrollEnabled(false);
      }
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (selectedModel === "llama-4-scout") {
      setThinkEnabled(false);
    }
  }, [selectedModel]);
  const handleSend = useCallback(
  async (text: string, think: boolean) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsError(false);
    const tempUserId = "temp-user-" + Date.now();
    const tempAiId = "temp-ai-" + Date.now();
    const userMsg = {
      _id: tempUserId,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => (prev ? [...prev, userMsg] : [userMsg]));
    const aiPlaceholder = {
      _id: tempAiId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) =>
      prev ? [...prev, aiPlaceholder] : [aiPlaceholder]
    );

    

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: trimmed,
          model: selectedModel,
          think,
        }),
      });
      

      if (!res.ok) {
        setIsError(true);
        return;
      }
      scrollToBottomInstant();
      const realUserId = res.headers.get("X-User-Message-Id");
      const realAiId = res.headers.get("X-Ai-Message-Id");
      if (realUserId && realAiId) {
        setMessages((prev) =>
          prev!.map((m) => {
            if (m._id === tempUserId) return { ...m, _id: realUserId };
            if (m._id === tempAiId) return { ...m, _id: realAiId };
            return m;
          })
        );
      }
      
      const targetAiId = realAiId || tempAiId;
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });

        setMessages((prev) =>
          prev!.map((m) =>
            m._id === targetAiId ? { ...m, content: acc } : m
          )
        );
      }
      setMessages((prev) =>
        prev!.map((m) =>
          m._id === targetAiId ? { ...m, isStreaming: false } : m
        )
      );
    } catch {
      setIsError(true);
    }
  },
  [chatId, selectedModel, scrollToBottomInstant]
);


  const handleRegenerate = useCallback(
  async (msgId: string) => {
    setIsError(false);
    setMessages((prev) => {
      const idx = prev!.findIndex((m) => m._id === msgId);
      if (idx === -1) return prev;
      return prev!.slice(0, idx + 1).map((m) =>
        m._id === msgId
          ? { ...m, content: "", isStreaming: true, isError: false }
          : m
      );
    });

    try {
      const res = await fetch("/api/chat/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          regenerateFromMessageId: msgId,
          model: selectedModel,
          think: thinkEnabled,
        }),
      });

      if (!res.ok) {
        setIsError(true);
        return;
      }
      const realAiId = res.headers.get("X-Ai-Message-Id") || msgId;

      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const safeContent = acc.replace(/<\/p>\s*<pre>/g, "<pre>");

        setMessages((prev) =>
          prev!.map((m) =>
            m._id === realAiId ? { ...m, content: safeContent } : m
          )
        );
      }

      setMessages((prev) =>
        prev!.map((m) =>
          m._id === realAiId ? { ...m, isStreaming: false } : m
        )
      );
    } catch {
      setIsError(true);
    }
  },
  [chatId, selectedModel, thinkEnabled]
);
  const handleEdit = useCallback(
  async (userMsgId: string, newContent: string) => {
    setIsError(false);
    const idx = messages!.findIndex((m) => m._id === userMsgId);
    if (idx === -1) return;

    setMessages((prev) => {
      const truncated = prev!.slice(0, idx + 1);
      truncated[idx] = { ...truncated[idx], content: newContent };
      return truncated;
    });
    const tempAiId = "edit-" + Date.now();
    const placeholder = {
      _id: tempAiId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => (prev ? [...prev, placeholder] : [placeholder]));

    try {
      const res = await fetch("/api/chat/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messageId: userMsgId,
          newContent,
          model: selectedModel,
          think: thinkEnabled,
        }),
      });

      if (!res.ok) {
        setIsError(true);
        return;
      }
      const realAiId = res.headers.get("X-Ai-Message-Id");
      if (realAiId) {
        setMessages((prev) =>
          prev!.map((m) =>
            m._id === tempAiId ? { ...m, _id: realAiId } : m
          )
        );
      }
      const targetAiId = realAiId || tempAiId;
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const safeContent = acc.replace(/<\/p>\s*<pre>/g, "<pre>");

        setMessages((prev) =>
          prev!.map((m) =>
            m._id === targetAiId ? { ...m, content: safeContent } : m
          )
        );
      }
      setMessages((prev) =>
        prev!.map((m) =>
          m._id === targetAiId ? { ...m, isStreaming: false } : m
        )
      );
    } catch {
      setIsError(true);
    }
  },
  [chatId, messages, selectedModel, thinkEnabled]
);

  const handleRefresh = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <main
        ref={containerRef}
        className={`flex flex-col flex-1 overflow-y-auto pt-20 pb-20 text-white px-4 sm:px-6 md:px-10 lg:px-20 xl:px-60 max-w-full ${
  messages !== null ? "space-y-4" : ""
}`}
      >
        {messages === null ? (
  <ChatSkeleton />
) : (
  messages.map((m) =>
    m.role === "user" ? (
      <UserMessage
        key={m._id}
        id={m._id}          
        content={m.content}
        onEdit={(newText) => handleEdit(m._id, newText)}
      />
    ) : (
      <AIMessage
        key={m._id}
        id={m._id}          
        content={m.content}
        isStreaming={!!m.isStreaming}
        isError={!!m.isError}
        onRegenerate={() => handleRegenerate(m._id)}
      />
    )
  )
)}
      </main>
      {isError && <ErrorBox onRefresh={handleRefresh} />}
      <MessageBox
        onSend={handleSend}
        disabled={messages === null || isError}
        thinkEnabled={thinkEnabled}
        onToggleThink={() => setThinkEnabled((f) => !f)}
        disableThink={selectedModel === "llama-4-scout"}
      />
    </div>
  );
}
