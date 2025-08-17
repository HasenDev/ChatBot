/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import yaml from "js-yaml";

type SiteConfig = {
  siteName?: string;
  iconPath?: string;
};
export default function SignUpPage() {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({ siteName: "AdmiBot", iconPath: "/favicon.ico" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/config.yml", { cache: "no-store" });
        if (!res.ok) throw new Error("config fetch failed");
        const text = await res.text();
        const parsed = yaml.load(text) as SiteConfig | undefined;
        if (mounted && parsed) setConfig((prev) => ({ ...prev, ...(parsed || {}) }));
      } catch {
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace("/chat");
  }, [status, router]);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (error) {
      hideTimeout.current = setTimeout(() => setError(null), 5000);
    }
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [error]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  const emailValid = emailRegex.test(email);
  const usernameValid = usernameRegex.test(username);
  const passwordsMatch = password === confirmPassword && password !== "";

  const handleNextStep = () => {
    setLoading(true);
    stepTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setStep((s) => s + 1);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !accepted) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          password,
          acceptTermsAndPrivacyPolicy: true
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Signup failed");
        setLoading(false);
        return;
      }
      const signInRes: any = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (signInRes?.error) {
        setError("Signup succeeded but auto-login failed.");
        setLoading(false);
        return;
      }
      router.replace("/chat");
    } catch {
      setError("Unexpected error. Please try again.");
      setLoading(false);
    }
  };

  const handleDiscordSignUp = () => signIn("discord");

  return (
    <AnimatePresence>
      <motion.main
        key="signup-page"
        className="min-h-screen bg-[#0b0b0f] text-white flex flex-col px-6 sm:px-8 md:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <header className="flex items-center py-6 pl-4 sm:pl-8">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-transparent flex items-center justify-center">
              <Image
                src={config.iconPath ?? "/favicon.ico"}
                alt={`${config.siteName ?? "Site"} Logo`}
                width={36}
                height={36}
                className="object-cover w-full h-full rounded-full"
                style={{ border: "none" }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight">{config.siteName ?? "AdmiBot"}</span>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
          <h1 className="text-3xl md:text-4xl font-extrabold">Sign Up</h1>

          <AnimatePresence>
            {error && (
              <motion.div
                className="w-full bg-red-800/90 border border-red-600 text-white rounded-md p-3 mb-4 flex items-center justify-center font-semibold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ExclamationTriangleIcon className="w-5 h-5 text-red-300 mr-2" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col w-full space-y-5 transition-all duration-300">
            {step === 1 && (
              <>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 border ${!email || emailValid ? "border-gray-700 focus:ring-blue-500" : "border-red-500 focus:ring-red-500"} focus:outline-none focus:ring-2 placeholder-gray-400 text-white transition`}
                  />
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {!emailValid && email && <p className="text-red-500 text-xs -mt-4">Invalid email address.</p>}
                <button
                  type="button"
                  disabled={!emailValid || loading}
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition shadow-lg shadow-blue-500/30 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin className="w-5 h-5" /> : "Next"}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 border ${!username || usernameValid ? "border-gray-700 focus:ring-blue-500" : "border-red-500 focus:ring-red-500"} focus:outline-none focus:ring-2 placeholder-gray-400 text-white transition`}
                  />
                  <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {username && !usernameValid && <p className="text-red-500 text-xs -mt-4">3–30 chars: letters, numbers, underscores only.</p>}
                <button
                  type="button"
                  disabled={!usernameValid || loading}
                  onClick={handleNextStep}
                  className="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition shadow-lg shadow-blue-500/30 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin className="w-5 h-5" /> : "Next"}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-white transition"
                  />
                  <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 border ${!confirmPassword || passwordsMatch ? "border-gray-700 focus:ring-blue-500" : "border-red-500 focus:ring-red-500"} focus:outline-none focus:ring-2 placeholder-gray-400 text-white transition`}
                  />
                  <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                {!passwordsMatch && confirmPassword && <p className="text-red-500 text-xs -mt-4">Passwords must match.</p>}
                <label className="flex items-start space-x-2 mt-2">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 focus:ring-blue-500 text-blue-500" />
                  <span className="text-gray-300 text-sm">
                    I accept the{" "}
                    <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                    .
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={!passwordsMatch || !accepted || loading}
                  className="w-full py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition shadow-lg shadow-blue-500/30 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin className="w-5 h-5" /> : "Sign Up"}
                </button>
              </>
            )}
          </form>

          <p className="text-gray-400 text-sm text-center">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-400 hover:underline">Sign In</Link>
          </p>

          <div className="w-full max-w-md space-y-4">
            <div className="relative w-full flex items-center">
              <div className="flex-grow border-t border-gray-700" />
              <span className="px-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-700" />
            </div>
            <button onClick={handleDiscordSignUp} className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-700 hover:border-gray-500 transition text-white bg-gray-900 hover:bg-gray-800">
              <FontAwesomeIcon icon={faDiscord} className="w-5 h-5 text-indigo-400" />
              Sign up with Discord
            </button>
          </div>
        </section>

        <footer className="py-6 text-center text-gray-500 text-xs">
          <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>{" "}|{" "}
          <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
        </footer>
      </motion.main>
    </AnimatePresence>
  );
}
