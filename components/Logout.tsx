/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";

import { signOut } from "next-auth/react";

interface LogoutProps {
  onClose: () => void;
}

export default function Logout({ onClose }: LogoutProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-[#1f1f23] rounded-2xl shadow-xl p-8 w-[400px] text-center text-white animate-fadeIn">
        <h2 className="text-2xl font-bold mb-3">Log Out</h2>
        <p className="text-base text-gray-400 mb-8">
          Are you sure you want to <span className="text-white font-semibold">Log out</span>?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-medium transition text-white"
          >
            Log Out
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
