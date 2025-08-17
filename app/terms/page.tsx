/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import yaml from "js-yaml";

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

export default function TermsOfService() {
  const [lights, setLights] = useState<JSX.Element[]>([]);
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot AI", iconPath: "/favicon.ico" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/config.yml", { cache: "no-store" });
        if (!res.ok) return;
        const txt = await res.text();
        const parsed = yaml.load(txt) as SiteConfig | undefined;
        if (mounted && parsed) setConfig((prev) => ({ ...prev, ...(parsed || {}) }));
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const arr: JSX.Element[] = [];
    for (let i = 0; i < 7; i++) {
      const size = 200 + Math.random() * 400;
      const colors = ["#1e3a8a", "#3b82f6", "#4338ca", "#2563eb"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const dur = 12 + Math.random() * 12;
      const del = Math.random() * 6;
      arr.push(
        <div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            background: color,
            width: `${size}px`,
            height: `${size}px`,
            top: `${top}%`,
            left: `${left}%`,
            animation: `lightMove ${dur}s ease-in-out ${del}s infinite`,
            pointerEvents: "none",
            zIndex: -10,
          }}
        />
      );
    }
    setLights(arr);
  }, []);

  const displayName = config.siteName ?? "AdmiBot AI";
  const icon = config.iconPath ?? "/favicon.ico";

  return (
    <main className="relative flex min-h-screen items-start text-white overflow-hidden px-6 py-12 lg:px-24 lg:py-16 bg-[#141414]">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-gray-900">
        {lights}
        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />
      </div>
      <aside className="hidden lg:block w-64 pr-10 sticky top-16">
        <div className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Sections</div>
        <ul className="space-y-3 text-sm text-gray-300">
          <li><a href="#1" className="hover:text-white">1. Acceptance of Terms</a></li>
          <li><a href="#2" className="hover:text-white">2. Description of Service</a></li>
          <li><a href="#3" className="hover:text-white">3. User Responsibilities</a></li>
          <li><a href="#4" className="hover:text-white">4. Prohibited Activities</a></li>
          <li><a href="#5" className="hover:text-white">5. AI Use & Limitations</a></li>
          <li><a href="#6" className="hover:text-white">6. Intellectual Property</a></li>
          <li><a href="#7" className="hover:text-white">7. Termination</a></li>
          <li><a href="#8" className="hover:text-white">8. Modifications</a></li>
          <li><a href="#9" className="hover:text-white">9. Disclaimer & Liability</a></li>
          <li><a href="#10" className="hover:text-white">10. Governing Law</a></li>
          <li><a href="#11" className="hover:text-white">11. Contact</a></li>
        </ul>
      </aside>
      <div className="max-w-3xl space-y-8">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
            <Image src={icon} alt={`${displayName} Logo`} width={48} height={48} className="object-cover w-full h-full rounded-full" style={{ border: "none" }} />
          </div>
          <h1 className="text-3xl font-bold">{displayName} Terms of Service</h1>
        </header>
        <section id="1">
          <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {displayName}, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.
          </p>
        </section>
        <section id="2">
          <h2 className="text-2xl font-semibold mb-2">2. Description of Service</h2>
          <p>
            {displayName} is an AI-powered assistant designed to provide automated support, conversation, moderation, and utilities as permitted. The service operator maintains and operates the platform.
          </p>
        </section>
        <section id="3">
          <h2 className="text-2xl font-semibold mb-2">3. User Responsibilities</h2>
          <p>
            Users must use the service respectfully and lawfully. You may not use {displayName} to harass, abuse, or deceive others. You are responsible for content you generate or request via the AI.
          </p>
        </section>
        <section id="4">
          <h2 className="text-2xl font-semibold mb-2">4. Prohibited Activities</h2>
          <p>
            You may not:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Attempt to exploit, reverse-engineer, or manipulate the service.</li>
              <li>Use the service to generate harmful, hateful, or illegal content.</li>
              <li>Bypass moderation, filters, or safety systems.</li>
              <li>Impersonate staff or claim to be the creator without authorization.</li>
            </ul>
          </p>
        </section>
        <section id="5">
          <h2 className="text-2xl font-semibold mb-2">5. AI Use & Limitations</h2>
          <p>
            {displayName} is an AI assistant that does not provide professional legal, medical, or financial advice. Responses are generated content and may not always be accurate.
          </p>
        </section>
        <section id="6">
          <h2 className="text-2xl font-semibold mb-2">6. Intellectual Property</h2>
          <p>
            Branding and AI behavior logic are the property of the service operator. Users may not replicate or redistribute the service without permission. Generated content belongs to users unless it violates these Terms.
          </p>
        </section>
        <section id="7">
          <h2 className="text-2xl font-semibold mb-2">7. Termination</h2>
          <p>
            The operator may suspend or terminate access for violations of these Terms. Misuse may result in warnings, suspensions, or other actions.
          </p>
        </section>
        <section id="8">
          <h2 className="text-2xl font-semibold mb-2">8. Modifications</h2>
          <p>
            The operator may update these Terms. Continued use after updates constitutes acceptance of the new Terms.
          </p>
        </section>
        <section id="9">
          <h2 className="text-2xl font-semibold mb-2">9. Disclaimer & Liability</h2>
          <p>
            {displayName} is provided "as-is" without warranties. The operator is not liable for damages arising from use or inability to use the service.
          </p>
        </section>
        <section id="10">
          <h2 className="text-2xl font-semibold mb-2">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws applicable to the operator's jurisdiction. Legal disputes must be resolved in accordance with those laws.
          </p>
        </section>
        <section id="11">
          <h2 className="text-2xl font-semibold mb-2">11. Contact</h2>
          <p>
            For questions regarding these Terms, visit the support page at <Link href="/support" className="text-blue-400 hover:underline">{displayName} Support</Link> or use the in-app support channels.
          </p>
        </section>
        <footer className="mt-12 text-sm text-gray-400 select-none">Last updated: August 2025</footer>
      </div>
    </main>
  );
}
