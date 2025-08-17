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
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  ChevronDownIcon,
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PopupShare from "./PopupShare";
import PopupDeleteChat from "./PopupDeleteChat";
import { useModel, ModelType } from "@/context/ModelContext";

export interface ModelMeta {
  id: ModelType;
  name: string;
  desc: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const models: ModelMeta[] = [
  { id: "gemini-pro-2-5", name: "Gemini Pro 2.5", desc: "Our smartest and best model by Google Inc.", icon: SparklesIcon },
  { id: "openai/gpt-oss-120b", name: "ChatGPT 4o", desc: "One of the smartest models We have. (Not supported for long prompts).", icon: CodeBracketIcon },
  { id: "llama-4-scout", name: "LLAMA 4.0 Scout", desc: "Great for everyday tasks by Meta", icon: BoltIcon },
  { id: "deepseek-r1", name: "DeepSeek R1", desc: "Optimized for reasoning tasks and speed.", icon: MagnifyingGlassIcon },
];

interface HeaderProps {
  setMobileOpen: (val: boolean) => void;
  onModelChange?: (modelId: ModelType) => void;
}

export default function Header({ setMobileOpen, onModelChange }: HeaderProps) {
  const { selectedModel, setSelectedModel } = useModel();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const current = models.find((m) => m.id === selectedModel)!;
  const chatId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (onModelChange) onModelChange(selectedModel);
  }, [selectedModel, onModelChange]);

  return (
    <>
      <header className="flex items-center justify-between px-5 py-3 border-gray-700 relative" style={{ height: "69px" }}>
        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-md hover:bg-gray-800 transition">
          <Bars3Icon className="w-6 h-6 text-gray-300" />
        </button>
        <div className="flex-1 flex justify-center md:justify-start">
  <div className="relative" ref={dropdownRef}>
    <motion.button
      onClick={() => setDropdownOpen((o) => !o)}
      className="flex items-center gap-2 text-white text-sm font-medium px-3 py-2 transition"
      animate={dropdownOpen ? { backgroundColor: "#333", borderRadius: 12 } : {}}
      whileHover={{ backgroundColor: "#333", borderRadius: 12 }}
    >
      {current.name}
      <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </motion.div>
    </motion.button>

    <AnimatePresence>
      {dropdownOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block absolute mt-2 w-64 rounded-xl bg-[#232327] border border-gray-700 shadow-lg overflow-hidden z-50"
          >
            {models.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-300" />
                    <div className="flex flex-col text-left">
                      <span className="text-white font-medium text-sm">{m.name}</span>
                      <span className="text-xs text-gray-400">{m.desc}</span>
                    </div>
                  </div>
                  {selectedModel === m.id && <CheckIcon className="w-4 h-4 text-gray-400" />}
                </button>
              );
            })}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 z-50 flex md:hidden"
          >
            <div className="relative bg-[#1f1f23] w-full h-full flex flex-col items-center justify-center px-4">
              <button
                onClick={() => setDropdownOpen(false)}
                className="absolute top-5 right-5 text-white text-2xl p-2 rounded-full hover:bg-white/10 transition"
              >
                ×
              </button>
              <h2 className="text-white text-xl font-semibold mb-6">Select a Model</h2>
              <div className="w-full max-w-sm space-y-3">
                {models.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setDropdownOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-5 py-4 rounded-xl bg-[#2e2e31] hover:bg-[#3a3a3d] transition"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-300" />
                        <div className="flex flex-col text-left">
                          <span className="text-white font-medium text-sm">{m.name}</span>
                          <span className="text-xs text-gray-400">{m.desc}</span>
                        </div>
                      </div>
                      {selectedModel === m.id && <CheckIcon className="w-4 h-4 text-gray-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
</div>

        {chatId && (
          <div className="relative">
            <button
              onClick={() => setOptionsOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-gray-800 transition"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-white font-bold" />
            </button>
            <AnimatePresence>
              {optionsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-[#2b2b2b] border border-gray-700 shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={() => {
                      setOptionsOpen(false);
                      setShowDeletePopup(true);
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2 text-left text-red-400 hover:bg-red-500/20 transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>
      {showSharePopup && <PopupShare chatId={chatId} onClose={() => setShowSharePopup(false)} />}
      {showDeletePopup && chatId && <PopupDeleteChat chatId={chatId} onClose={() => setShowDeletePopup(false)} />}
    </>
  );
}
