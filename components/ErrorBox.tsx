/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
interface ErrorBoxProps {
  onRefresh: () => void;
}
export default function ErrorBox({ onRefresh }: ErrorBoxProps) {
  return (
    <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 mx-4 sm:mx-8 md:mx-16 lg:mx-60 mb-4 flex items-center justify-between">
      <p className="text-white">
        An unexpected issue occurred while generating the response.
      </p>
      <button
        onClick={onRefresh}
        className="bg-white text-black rounded-md px-4 py-2 hover:bg-gray-200 transition-colors"
      >
        Refresh Chat
      </button>
    </div>
  );
}