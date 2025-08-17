/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
interface Props {
  chatId: string;
  onClose: () => void;
}
export default function PopupDeleteChat({ chatId, onClose }: Props) {
  const handleDelete = async () => {
    try {
      await fetch(`api/chat/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      window.location.href = "/chat/";
    } catch {
      onClose();
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-[#1f1f23] rounded-2xl shadow-xl p-8 w-[400px] text-center text-white animate-fadeIn">
        <h2 className="text-2xl font-bold mb-3">Delete Chat</h2>
        <p className="text-base text-gray-400 mb-8">
          Are you sure you want to <span className="text-white font-semibold">permanently delete</span> this chat?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-medium transition text-white"
          >
            Delete Chat
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#2d2d30] hover:bg-[#242426] font-medium transition text-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
