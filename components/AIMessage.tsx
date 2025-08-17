/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useState, useMemo, FC, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  ClipboardIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "../hooks/useMediaQuery";

type Segment =
  | { type: "text"; content: string }
  | { type: "code"; content: string; lang: string }
  | { type: "thought"; content: string };

interface ThoughtBlockProps {
  content: string;
}
function normalizeMathSyntax(markdown?: string) {
  if (!markdown) return markdown ?? "";
  let md = markdown;
  md = md.replace(/\\\(([\s\S]*?)\\\)/g, (_, g) => `$${g}$`);
  md = md.replace(/\\\[([\s\S]*?)\\\]/g, (_, g) => `$$${g}$$`);
  md = md.replace(/\[\s*(\\[\s\S]*?)\s*\]/g, (_, g) => `$$${g}$$`);

  return md;
}
function dedent(text: string): string {
  const lines = text.split("\n");
  if (lines[0]?.trim() === "") lines.shift();
  const baseIndent = lines.reduce((min, line) =>
    line.trim() === ""
      ? min
      : Math.min(min, line.match(/^\s*/)?.[0].length ?? 0),
    Infinity
  );
  if (baseIndent === Infinity || baseIndent === 0) return text;
  return lines.map((l) => l.slice(baseIndent)).join("\n");
}
const mdComponents = {
  h1: ({ ...props }: any) => (
    <h1 className="mt-6 mb-4 text-2xl sm:text-3xl font-bold text-white" {...props} />
  ),
  h2: ({ ...props }: any) => (
    <h2 className="mt-5 mb-3 text-xl sm:text-2xl font-semibold text-white" {...props} />
  ),
  h3: ({ ...props }: any) => (
    <h3 className="mt-4 mb-2 text-lg sm:text-xl font-medium text-white" {...props} />
  ),
  h4: ({ ...props }: any) => (
    <h4 className="mt-3 mb-2 text-base sm:text-lg font-medium text-white" {...props} />
  ),
  h5: ({ ...props }: any) => (
    <h5 className="mt-3 mb-1 text-sm sm:text-base font-medium text-white" {...props} />
  ),
  h6: ({ ...props }: any) => (
    <h6 className="mt-2 mb-1 text-sm font-semibold text-white uppercase tracking-wide" {...props} />
  ),
  p: ({ ...props }: any) => (
    <p className="mb-4 text-sm sm:text-base leading-relaxed text-gray-300 whitespace-pre-wrap break-words" {...props} />
  ),
  blockquote: ({ ...props }: any) => (
    <blockquote className="border-l-4 border-white pl-4 italic text-gray-400 my-4" {...props} />
  ),
  hr: () => <hr className="border-gray-700 my-6 w-full max-w-full mx-auto" />,
  ul: ({ ...props }: any) => <ul className="list-disc ml-6 space-y-2 text-gray-300 mb-4" {...props} />,
  ol: ({ ...props }: any) => <ol className="list-decimal ml-6 space-y-2 text-gray-300 mb-4" {...props} />,
  li: ({ ...props }: any) => <li className="leading-relaxed" {...props} />,
  code: ({ inline, children }: any) =>
    inline ? (
      <code className="bg-[#424242] rounded px-1.5 py-0.5 text-xs sm:text-sm font-mono text-white">{children}</code>
    ) : (
      <code className="bg-[#424242] text-white text-xs sm:text-sm font-mono px-2 py-0.5 rounded-md inline-block align-middle whitespace-pre-wrap break-all">
        {children}
      </code>
    ),
  a: ({ href, children, ...props }: any) => {
    const displayText = typeof children === "string" ? children.replace(/^https?:\/\//, "") : children;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline hover:text-blue-400 break-words"
        {...props}
      >
        {displayText}
      </a>
    );
  },

  table: ({ ...props }: any) => (
  <div className="my-4">
    <table
      className="
        w-full border-collapse text-sm sm:text-base text-gray-300
        sm:rounded-lg sm:overflow-hidden sm:shadow-lg
      "
      {...props}
    />
  </div>
),

thead: ({ ...props }: any) => (
  <thead
    className="
      hidden sm:table-header-group
      bg-gradient-to-r from-[#2c2c2c] to-[#252525] text-gray-200 font-semibold
    "
    {...props}
  />
),

tbody: ({ ...props }: any) => <tbody {...props} />,

tr: ({ ...props }: any) => (
  <tr
    className="
      border-b border-gray-700 last:border-0 
      hover:bg-[#2a2a2a] transition-colors
      block sm:table-row
      mb-6 sm:mb-0 sm:border-0 sm:hover:bg-[#252525]
      rounded-md sm:rounded-none
    "
    {...props}
  />
),

th: ({ ...props }: any) => (
  <th
    className="
      text-left py-3 px-4 whitespace-nowrap 
      block sm:table-cell
    "
    {...props}
  />
),

td: ({ ...props }: any) => {
  const { children, ...rest } = props;
  return (
    <td
      className="
        py-2 px-4 whitespace-normal 
        block sm:table-cell 
        before:content-[attr(data-label)] before:block before:font-semibold before:text-gray-400 before:mb-1 sm:before:hidden
        sm:border-t sm:border-gray-700
      "
      {...rest}
    >
      {children}
    </td>
  );
},

};


const ThoughtBlock: FC<ThoughtBlockProps> = ({ content }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const previousContentRef = useRef(content);
  const thinkingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (content !== previousContentRef.current) {
      setIsThinking(true);
      if (thinkingTimeoutRef.current) window.clearTimeout(thinkingTimeoutRef.current);
      thinkingTimeoutRef.current = window.setTimeout(() => {
        setIsThinking(false);
      }, 2000);
      previousContentRef.current = content;
    }
    return () => {
      if (thinkingTimeoutRef.current) window.clearTimeout(thinkingTimeoutRef.current);
    };
  }, [content]);

  return (
    <div className="text-white">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors w-full text-left mb-2"
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronDownIcon className="w-4 h-4 flex-shrink-0" /> : <ChevronUpIcon className="w-4 h-4 flex-shrink-0" />}
        <span
          className={clsx(
            "font-semibold bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent",
            isThinking && "animate-thinking-gradient [background-size:200%]"
          )}
        >
          Thinking
        </span>
      </button>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700 prose prose-invert prose-sm max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
                {normalizeMathSyntax(content)}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface Props {
  content: string;
  onRegenerate: () => Promise<void>;
  isError?: boolean;
  isStreaming?: boolean;
}
export default function AIMessage({
  content,
  onRegenerate,
  isError,
  isStreaming,
}: Props) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const isGenerating = isStreaming || loading;
  const [openModalIdx, setOpenModalIdx] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width:840px)");
  const [visibleContent, setVisibleContent] = useState<string>(content ?? "");
  const prevContentRef = useRef(content ?? "");
  const tokenQueueRef = useRef<string[]>([]);
  const rafRef = useRef<number | null>(null);
  const MAX_CHUNK_LENGTH = 180;
  const MIN_CHUNK_LENGTH = 30;
  const BASE_CHARS_PER_FRAME = 40;
  const MAX_CHARS_PER_FRAME = 1200;
  function chunkStringPreservingWords(text: string, maxLen = MAX_CHUNK_LENGTH) {
    const chunks: string[] = [];
    let buffer = "";
    const tokens = text.match(/(\s+|[^\s]+)/g) || [];
    for (const tk of tokens) {
      if (buffer.length + tk.length > maxLen) {
        if (buffer.length > 0) {
          chunks.push(buffer);
          buffer = tk;
        } else {
          for (let i = 0; i < tk.length; i += maxLen) {
            chunks.push(tk.slice(i, i + maxLen));
          }
          buffer = "";
        }
      } else {
        buffer += tk;
        if (/[.!?]\s*$/.test(buffer) && buffer.length >= MIN_CHUNK_LENGTH) {
          chunks.push(buffer);
          buffer = "";
        }
      }
    }
    if (buffer.length > 0) chunks.push(buffer);
    return chunks;
  }
  const pushAppended = useCallback(
    (appended: string, streaming: boolean) => {
      if (!appended) return;
      if (!streaming) {
        tokenQueueRef.current.push(appended);
      } else {
        const chunks = chunkStringPreservingWords(appended);
        tokenQueueRef.current.push(...chunks);
      }
      if (rafRef.current == null) {
        const tick = () => {
          const q = tokenQueueRef.current;
          if (q.length === 0) {
            rafRef.current = null;
            return;
          }
          const totalPendingChars = q.reduce((s, c) => s + c.length, 0);
          const dynamic = Math.min(
            MAX_CHARS_PER_FRAME,
            Math.max(BASE_CHARS_PER_FRAME, Math.floor(Math.sqrt(totalPendingChars) * 6))
          );

          let consumed = "";
          while (q.length > 0 && consumed.length < dynamic) {
            consumed += q.shift();
          }
          setVisibleContent((prev) => prev + consumed);

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      }
    },
    []
  );
  useEffect(() => {
    const prev = prevContentRef.current ?? "";
    if (content === prev) return;
    if (content.length < prev.length) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      tokenQueueRef.current = [];
      setVisibleContent(content);
      prevContentRef.current = content;
      return;
    }
    const appended = content.slice(prev.length);
    prevContentRef.current = content;
    pushAppended(appended, !!isStreaming);
  }, [content, isStreaming, pushAppended]);
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      tokenQueueRef.current = [];
    };
  }, []);
  const segments: Segment[] = useMemo(() => {
    const parts: Segment[] = [];
    const raw = visibleContent || "";
    if (!raw) return parts;
    const re = /(```(\w*)|<\/?think>)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw))) {
      const d = m[0],
        lang = m[2] || "text",
        i = m.index;
      if (i > last) parts.push({ type: "text", content: raw.slice(last, i) });
      const start = re.lastIndex;
      if (d.startsWith("```")) {
        const close = /```/g;
        close.lastIndex = start;
        const c = close.exec(raw);
        if (c) {
          parts.push({
            type: "code",
            content: dedent(raw.slice(start, c.index)),
            lang,
          });
          last = close.lastIndex;
        } else {
          parts.push({
            type: "code",
            content: dedent(raw.slice(start)),
            lang,
          });
          last = raw.length;
        }
      } else if (d === "<think>") {
        const close = /<\/think>/g;
        close.lastIndex = start;
        const c = close.exec(raw);

        if (c) {
          const thoughtContent = raw.slice(start, c.index);
          if (thoughtContent.trim().length > 0) {
            parts.push({
              type: "thought",
              content: thoughtContent,
            });
          }
          last = close.lastIndex;
        } else {
          const thoughtContent = raw.slice(start);
          if (thoughtContent.trim().length > 0) {
            parts.push({
              type: "thought",
              content: thoughtContent,
            });
          }
          last = raw.length;
        }
      }

      re.lastIndex = last;
    }
    if (last < raw.length) parts.push({ type: "text", content: raw.slice(last) });
    return parts.filter((p) => p.content.trim() !== "");
  }, [visibleContent]);
  const copyToClipboard = useCallback(async (text: string) => {
    if (!text) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (!ok) throw new Error("execCommand copy failed");
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleCopy = async (text: string) => {
    setCopyStatus("idle");
    const ok = await copyToClipboard(text);
    setCopyStatus(ok ? "success" : "error");
    window.setTimeout(() => setCopyStatus("idle"), 3000);
  };
  const [codeCopyStatus, setCodeCopyStatus] = useState<Record<number, "idle" | "success" | "error">>({});
  const handleCodeCopy = async (idx: number, text: string) => {
    setCodeCopyStatus((s) => ({ ...s, [idx]: "idle" }));
    const ok = await copyToClipboard(text);
    setCodeCopyStatus((s) => ({ ...s, [idx]: ok ? "success" : "error" }));
    window.setTimeout(() => {
      setCodeCopyStatus((s) => ({ ...s, [idx]: "idle" }));
    }, 3000);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await onRegenerate();
    } catch (err) {
      console.error("regenerate error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col max-w-full sm:max-w-3xl mx-auto items-start">
      <div className="flex-1 space-y-6 text-left">
        {segments.map((seg, idx) => {
          if (seg.type === "thought") {
            return <ThoughtBlock key={idx} content={seg.content} />;
          }
          if (seg.type === "code") {
            const codeCopy = codeCopyStatus[idx] ?? "idle";
            return isMobile ? (
              <div key={idx} className="space-y-2">
                <motion.div
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-full bg-neutral-800 rounded-xl px-4 py-3 text-white text-sm flex justify-between items-center overflow-hidden break-words"
                >
                  <span className="uppercase font-mono text-xs text-gray-300 truncate max-w-[70%]">{seg.lang}</span>
                  <button className="bg-white text-black text-xs px-3 py-1 rounded-full hover:opacity-90 transition" onClick={() => setOpenModalIdx(idx)}>
                    Open Code
                  </button>
                </motion.div>
                <AnimatePresence>
                  {openModalIdx === idx && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
                      <div className="bg-neutral-900 w-full max-w-lg rounded-lg shadow-lg overflow-hidden flex flex-col max-h-full">
                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-gray-700">
                          <span className="text-xs sm:text-sm text-gray-300 font-mono">{seg.lang}</span>
                          <div className="flex gap-2 items-center">
                            <button onClick={() => handleCodeCopy(idx, seg.content)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
                              <ClipboardIcon className="w-5 h-5" />
                              {codeCopy === "success" ? <span className="text-sm text-green-400">Copied!</span> : null}
                            </button>
                            <button onClick={() => setOpenModalIdx(null)} className="text-gray-100 hover:text-white transition text-sm">✕</button>
                          </div>
                        </div>
                        <div className="overflow-auto text-sm bg-[#171717]">
                          <SyntaxHighlighter
                            language={seg.lang}
                            style={coldarkDark}
                            PreTag="div"
                            wrapLongLines={true}
                            showLineNumbers={false}
                            customStyle={{
                              margin: 0,
                              padding: "1rem",
                              backgroundColor: "transparent",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              overflowX: "hidden",
                            }}
                          >
                            {seg.content}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                key={idx}
                initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.36, ease: "easeOut" }}
                className="w-full max-w-full sm:max-w-3xl bg-[#171717] rounded-xl border border-gray-700"
              >
                <div className="flex justify-between items-center px-4 py-2 bg-neutral-800/50 rounded-t-xl">
                  <span className="text-gray-300 text-xs sm:text-sm font-mono">{seg.lang}</span>
                  <div className="relative">
                    <div className="sticky top-4 right-4 z-10">
                      <button
                        onClick={() => handleCodeCopy(idx, seg.content)}
                        className="flex items-center gap-2 bg-neutral-900/60 backdrop-blur px-2 py-1 rounded-full hover:opacity-95 transition text-gray-200"
                        aria-label="Copy code"
                      >
                        <ClipboardIcon className={clsx("w-4 h-4", codeCopy === "success" && "text-green-400", codeCopy === "error" && "text-red-400")} />
                        {codeCopy === "success" && <span className="text-xs text-green-400">Copied!</span>}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 text-sm bg-transparent">
                  <div className="relative">
                    <SyntaxHighlighter
                      language={seg.lang}
                      style={coldarkDark}
                      PreTag="div"
                      wrapLongLines={true}
                      showLineNumbers={false}
                      customStyle={{
                        margin: 0,
                        padding: 0,
                        backgroundColor: "transparent",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowX: "hidden",
                      }}
                    >
                      {seg.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </motion.div>
            );
          }

          const isLast = idx === segments.length - 1;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.36, ease: "easeOut", delay: idx * 0.02 }}
              className={clsx(
                "w-full max-w-full sm:max-w-3xl rounded-2xl px-4 py-4 text-white transition-all duration-300 text-sm sm:text-base",
                isError && isLast && "bg-red-900/80 text-red-100"
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
                {normalizeMathSyntax(seg.content)}
              </ReactMarkdown>

              {isLast && (
                <div className="mt-3 flex items-center gap-3 text-gray-400 text-xs">
                  {!isGenerating && !isError && (
                    <>
                      <button onClick={() => handleCopy(content)} className="hover:text-white transition flex items-center gap-2" aria-label="Copy full response">
                        <ClipboardIcon className={clsx("w-5 h-5", copyStatus === "success" && "text-green-400", copyStatus === "error" && "text-red-400")} />
                        {copyStatus === "success" && <span className="text-xs text-green-400">Copied!</span>}
                      </button>
                      <button onClick={handleRegenerate} className="hover:text-white transition" title="Regenerate">
                        <ArrowPathIcon className={clsx("w-5 h-5", loading && "animate-spin")} />
                      </button>
                    </>
                  )}
                  {isError && (
                    <button onClick={() => location.reload()} className="bg-white text-black px-3 py-1 rounded-full hover:bg-gray-200 transition text-xs sm:text-sm">
                      Refresh Page
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
