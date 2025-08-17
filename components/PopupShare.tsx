/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { XMarkIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface PopupShareProps {
  onClose: () => void;
  chatId?: string;
}

export default function PopupShare({ onClose, chatId }: PopupShareProps) {
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  async function handleCreateLink() {
    if (!chatId) {
      setError("You need to be in a chat to use the share feature.");
      return;
    }
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/chat/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create share link");
      }
      const data = await res.json();
      setShareUrl(data.shareUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          ref={popupRef}
          className="relative bg-[#232327] border border-gray-700 rounded-xl p-6 w-96 text-center shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700 transition"
          >
            <XMarkIcon className="w-5 h-5 text-gray-300" />
          </button>
          <h2 className="text-white font-medium text-lg mb-2">
            Share public link to chat
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            This conversation may include personal information. Take a moment to
            check before sharing.
          </p>
          {error && (
            <p className="text-red-400 text-sm mb-3">{error}</p>
          )}
          {shareUrl ? (
            <div className="flex items-center gap-2 bg-gray-800 rounded-md px-2 py-2 mb-3">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-gray-200 text-sm outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-gray-700 rounded transition"
                title="Copy link"
              >
                <ClipboardIcon className="w-5 h-5 text-gray-300" />
              </button>
              {copied && (
                <span className="text-xs text-green-400">Copied!</span>
              )}
            </div>
          ) : (
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium text-white transition w-full flex items-center justify-center"
            >
              {loading && (
                <svg
                  className="animate-spin mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Creating..." : "Create link"}
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
