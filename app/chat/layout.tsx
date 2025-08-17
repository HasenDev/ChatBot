/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ModelProvider } from "@/context/ModelContext";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const checkingAuth = status === "loading";
  useEffect(() => {
    if (status === "authenticated") {
    } else if (status === "unauthenticated") {
      if (pathname !== "/") {
        router.replace("/");
      }
    }
  }, [status, pathname, router]);
  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <style>
        {`
          html, body, #__next {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            background-color: #212121;
            overflow: hidden;
          }

          .layout-container {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
          }

          .main-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            background-color: #212121;
            height: 100%;
            width: 100%;
          }
        `}
      </style>

      <ModelProvider>
        <Head>
          <title>AdmiBot AI</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
        </Head>

        <div className="layout-container">
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <div className="main-content">
            <Header setMobileOpen={setMobileOpen} />

            {checkingAuth ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-gray-600 animate-spin" />
                  <div className="text-sm text-gray-400">Checking authentication...</div>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </ModelProvider>
    </>
  );
}
