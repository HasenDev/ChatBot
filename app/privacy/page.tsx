"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import yaml from "js-yaml";

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};

export default function PrivacyPolicy() {
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
      const colors = ["#1e293b", "#334155", "#475569", "#111827"];
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
          <li><a href="#1" className="hover:text-white">1. Introduction</a></li>
          <li><a href="#2" className="hover:text-white">2. Information We Collect</a></li>
          <li><a href="#3" className="hover:text-white">3. How We Use Your Information</a></li>
          <li><a href="#4" className="hover:text-white">4. Data Retention</a></li>
          <li><a href="#5" className="hover:text-white">5. Sharing & Disclosure</a></li>
          <li><a href="#6" className="hover:text-white">6. Data Security</a></li>
          <li><a href="#7" className="hover:text-white">7. User Rights</a></li>
          <li><a href="#8" className="hover:text-white">8. Children’s Privacy</a></li>
          <li><a href="#9" className="hover:text-white">9. Third-Party Services</a></li>
          <li><a href="#10" className="hover:text-white">10. Updates to Policy</a></li>
          <li><a href="#11" className="hover:text-white">11. Contact</a></li>
        </ul>
      </aside>
      <div className="max-w-3xl space-y-8">
        <header className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
            <Image src={icon} alt={`${displayName} Logo`} width={48} height={48} className="object-cover w-full h-full rounded-full" style={{ border: "none" }} />
          </div>
          <h1 className="text-3xl font-bold">{displayName} Privacy Policy</h1>
        </header>
        <section id="1">
          <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
          <p>
            This Privacy Policy explains how {displayName} collects, uses, and protects your data while interacting with the service on supported platforms. By using {displayName}, you agree to this policy.
          </p>
        </section>
        <section id="2">
          <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
          <p>{displayName} may collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Identifiers and content submitted for processing.</li>
            <li>Service configuration and preferences used to enable features.</li>
            <li>Error logs or usage data to improve performance.</li>
            <li>Any data voluntarily provided through interactions with the service.</li>
          </ul>
        </section>
        <section id="3">
          <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
          <p>We use collected data to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide service functionality and respond to inputs.</li>
            <li>Improve accuracy, reliability, and moderation systems.</li>
            <li>Debug, audit, and enhance the user experience.</li>
            <li>Ensure compliance with applicable terms of service and laws.</li>
          </ul>
        </section>
        <section id="4">
          <h2 className="text-2xl font-semibold mb-2">4. Data Retention</h2>
          <p>
            {displayName} does not permanently store message content unless explicitly stated. Temporary data may be held for processing or moderation but is routinely cleared. Service settings may be stored until deleted by administrators.
          </p>
        </section>
        <section id="5">
          <h2 className="text-2xl font-semibold mb-2">5. Sharing & Disclosure</h2>
          <p>
            We do not sell, rent, or share personal data with third parties except as required by law or to protect safety, rights, or property.
          </p>
        </section>
        <section id="6">
          <h2 className="text-2xl font-semibold mb-2">6. Data Security</h2>
          <p>
            Collected data is handled using industry-standard practices. Access is restricted and storage is protected. No system is completely immune to risk.
          </p>
        </section>
        <section id="7">
          <h2 className="text-2xl font-semibold mb-2">7. User Rights</h2>
          <p>
            You have the right to:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Request deletion of stored preferences or data.</li>
              <li>Opt-out of data-dependent features where applicable.</li>
              <li>Report misuse or privacy concerns via the support page.</li>
            </ul>
          </p>
        </section>
        <section id="8">
          <h2 className="text-2xl font-semibold mb-2">8. Children’s Privacy</h2>
          <p>
            {displayName} is not intended for users under the age of 13. We do not knowingly collect personal data from children. Parents or guardians who believe their child has used the service should contact support.
          </p>
        </section>
        <section id="9">
          <h2 className="text-2xl font-semibold mb-2">9. Third-Party Services</h2>
          <p>
            The service may interface with external platforms and APIs. We are not responsible for the data handling practices of third-party platforms.
          </p>
        </section>
        <section id="10">
          <h2 className="text-2xl font-semibold mb-2">10. Updates to Policy</h2>
          <p>
            This policy may be updated to reflect legal, technical, or operational changes. Significant updates will be announced on the support page or changelog.
          </p>
        </section>
        <section id="11">
          <h2 className="text-2xl font-semibold mb-2">11. Contact</h2>
          <p>
            For privacy-related questions or concerns, visit the support page at <Link href="/support" className="text-blue-400 hover:underline">{displayName} Support</Link> or send a message through the in-app support channels.
          </p>
        </section>
        <footer className="mt-12 text-sm text-gray-400 select-none">Last updated: August 2025</footer>
      </div>
    </main>
  );
}
