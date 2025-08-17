/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import "@/app/globals.css";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-[#1e1f24] to-[#0f0f10] text-white">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
