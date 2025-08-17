/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useEffect, useRef, useState } from "react";
import { PencilIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { motion } from "framer-motion";

interface Props {
  id: string;
  content: string;
  onEdit: (newContent: string) => Promise<void>;
  align?: "left" | "right";
}
export default function UserMessage({
  id,
  content = "",
  onEdit,
  align = "right",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [hover, setHover] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setValue(content ?? "");
  }, [content]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [editing]);
  const safeValue = value ?? "";
  const safeContent = content ?? "";
  const hasChanges = safeValue.trim() !== safeContent.trim();
  const wrapStyles: React.CSSProperties = {
    overflowWrap: "anywhere",
    wordBreak: "break-all",
  };

  const handleSubmitEdit = async () => {
    if (!hasChanges || isSaving) return;
    const trimmed = safeValue.trim();

    setIsSaving(true);
    try {
      await onEdit(trimmed);
      setValue(trimmed);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save edit:", err);
      setValue(safeContent);
      setEditing(false);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setValue(safeContent);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeContent);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
    setTimeout(() => setCopyStatus("idle"), 3000);
  };

  return (
    <div
      data-id={id}
      className={clsx(
        "group flex w-full flex-col max-w-full sm:max-w-3xl mx-auto",
        align === "right" ? "items-end" : "items-start"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={clsx(
          "relative bg-[#303030] rounded-2xl px-5 py-3 text-base shadow-md transition-all text-left",
          editing
            ?
              "w-full md:max-w-2xl"
            :
              "inline-block max-w-[90%] md:max-w-2xl",
          "break-all md:break-normal",
          align === "right" ? "rounded-tr-none" : "rounded-tl-none",
          editing && "pb-14"
        )}
        style={wrapStyles}
      >
        {editing ? (
          <>
            <textarea
              ref={textareaRef}
              className={clsx(
                "w-full h-36 bg-transparent outline-none resize-none text-white placeholder-gray-400 pr-32 pb-4 text-base leading-relaxed overflow-y-auto",
                "whitespace-pre-wrap break-all md:break-normal",
                "focus:ring-0 focus:outline-none"
              )}
              rows={5}
              value={safeValue}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Edit message"
              style={wrapStyles}
            />
            <div className="absolute bottom-3 right-4 flex gap-2">
              <button
                onClick={handleCancel}
                className="bg-[#1c1c1c] text-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-[#2d2d2d] transition-colors"
                type="button"
                aria-label="Cancel edit"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={!hasChanges || isSaving}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  hasChanges && !isSaving
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-500/50 text-gray-300 cursor-not-allowed"
                )}
                type="button"
                aria-label="Save edit"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <p
            className={clsx(
              "whitespace-pre-wrap break-all md:break-normal font-normal leading-relaxed text-white",
            )}
            style={wrapStyles}
          >
            {safeValue}
          </p>
        )}
      </div>

      <motion.div
        className="flex items-center gap-3 mt-1"
        animate={{
          opacity: !editing && (hover || copyStatus !== "idle") ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={handleCopy}
          className="transition hover:text-white"
          title="Copy message"
          aria-label="Copy message"
        >
          <ClipboardIcon
            className={clsx(
              "w-5 h-5",
              copyStatus === "success" && "text-green-400",
              copyStatus === "error" && "text-red-400",
              "text-gray-400"
            )}
          />
        </button>
        <button
          onClick={() => setEditing(true)}
          className="transition hover:text-white"
          title="Edit message"
          aria-label="Edit message"
        >
          <PencilIcon className="w-5 h-5 text-gray-400" />
        </button>
      </motion.div>
    </div>
  );
}
