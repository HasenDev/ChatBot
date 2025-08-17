/*
  NOTICE:

  This file is part of AdmiBot Software (c) 2025 AdmiBot Team, maintained by Hassen.

  Usage is permitted for personal, educational, or non-commercial purposes only.
  Production or commercial use requires an explicit license key issued by Hassen.

  Redistribution or sublicensing without permission is strictly prohibited.

  For licensing requests or questions, contact Hassen via official support channels, https://discord.gg/CYE9bDJSuU
*/
"use client";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import useMediaQuery from "@/hooks/useMediaQuery";

interface Props {
  onClose: () => void;
}

interface User {
  _id: string;
  username: string;
  avatar?: string | null;
}

interface Feedback {
  type: "success" | "error";
  message: string;
}
export default function AccountSettings({ onClose }: Props) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [activeTab, setActiveTab] = useState<"general" | "terms" | "privacy">("general");
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<"discord" | "credentials">("credentials");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<"none" | "avatar" | "username" | "password">("none");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  useEffect(() => {
    (async () => {
      try {
        setInitialLoading(true);
        setFetchError(null);
        const res = await fetch("/api/me");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch user data.");
        }
        const data = await res.json();
        if (!data.user) throw new Error("Invalid server response.");
        setUser(data.user);
        setAccountType(data.accountType);
        setUsername(data.user.username);
        setAvatar(data.user.avatar ?? null);
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      return setFeedback({ type: "error", message: "Please select an image." });
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsUpdating("avatar");
      setFeedback(null);
      try {
        const res = await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");
        setAvatar(data.user.avatar);
        setFeedback({ type: "success", message: "Avatar updated!" });
      } catch (err: any) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsUpdating("none");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameUpdate = async () => {
    if (!user || username.trim() === user.username) return;
    setIsUpdating("username");
    setFeedback(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Username update failed.");
      setUser(data.user);
      setUsername(data.user.username);
      setFeedback({ type: "success", message: "Username updated!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsUpdating("none");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      return setFeedback({ type: "error", message: "Both fields required." });
    }
    setIsUpdating("password");
    setFeedback(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password change failed.");
      setOldPassword("");
      setNewPassword("");
      setFeedback({ type: "success", message: "Password changed!" });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsUpdating("none");
    }
  };
  const generateDefaultAvatar = (n: string) => (
    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-pink-500 via-indigo-500 to-orange-400 text-white">
      {n.charAt(0).toUpperCase() || "?"}
    </div>
  );
  const FeedbackBox = () => {
    if (!feedback) return null;
    const error = feedback.type === "error";
    return (
      <div
        className={`flex items-center justify-between p-3 mb-4 rounded-lg border ${
          error
            ? "bg-red-900/40 border-red-700 text-red-300"
            : "bg-green-900/40 border-green-700 text-green-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {error ? (
            <ExclamationTriangleIcon className="w-5 h-5" />
          ) : (
            <CheckCircleIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
        <button
          onClick={() => setFeedback(null)}
          className="p-1 rounded-full hover:bg-white/10"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };
  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <ArrowPathIcon className="animate-spin h-8 w-8 mb-2" />
          <span className="font-semibold">Loading Account...</span>
        </div>
      );
    }
    if (fetchError) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-red-400 text-center">
          <ExclamationTriangleIcon className="w-10 h-10 mb-2" />
          <span className="font-semibold text-lg">Load Failed</span>
          <p className="text-sm text-red-500">{fetchError}</p>
        </div>
      );
    }
    if (!user) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          Something went wrong.
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <FeedbackBox />
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            {avatar ? (
              <img
                src={avatar}
                alt="User Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              generateDefaultAvatar(username)
            )}
            {accountType === "credentials" && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                {isUpdating === "avatar" ? (
                  <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <CameraIcon className="w-6 h-6 text-white" />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUpdating !== "none"}
                />
              </label>
            )}
          </div>
          <h2 className="text-2xl font-bold">{user.username}</h2>
        </div>
        <div className="space-y-3 sm:inline-block sm:w-auto">
  <label className="block text-sm font-medium text-gray-300">
    Username
  </label>
  <div className="flex flex-col sm:flex-row items-stretch gap-3">
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      disabled={accountType === "discord" || isUpdating !== "none"}
      className="flex-grow bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
    />
    {accountType === "credentials" && (
      <button
        onClick={handleUsernameUpdate}
        disabled={
          isUpdating !== "none" ||
          username.trim() === user.username ||
          username.trim() === ""
        }
        className="bg-white text-black font-bold rounded-full px-4 py-2 transition 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   w-full sm:w-auto"
      >
        {isUpdating === "username" ? (
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
        ) : (
          "Update"
        )}
      </button>
    )}
  </div>
</div>

        {accountType === "credentials" && (
          <div className="space-y-3 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-200">
              Change Password
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={isUpdating !== "none"}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdating !== "none"}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </div>
            <button
              onClick={handlePasswordUpdate}
              disabled={
                isUpdating !== "none" || !oldPassword || !newPassword
              }
              className="w-full bg-white text-black font-bold rounded-full py-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating === "password" ? "Changing..." : "Change Password"}
            </button>
          </div>
        )}
        {accountType === "discord" && (
          <p className="text-sm text-gray-500 text-center pt-4 border-t border-gray-700">
            Your account is managed by Discord. Update your profile there.
          </p>
        )}
      </div>
    );
  };

  return (
    <Transition show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => isUpdating === "none" && onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative bg-[#1f1f23] text-white rounded-xl shadow-2xl max-w-3xl w-full flex overflow-hidden h-[85vh] max-h-[700px]">
              {!isMobile && (
                <div className="w-56 bg-[#2a2a2f] flex flex-col py-4 border-r border-gray-700/50 shrink-0">
                  <button
                    onClick={onClose}
                    className="self-end mr-4 mb-6 p-2 rounded-full hover:bg-gray-700/50 transition"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                  </button>
                  <nav className="flex flex-col space-y-1 px-3">
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition ${
                        activeTab === "general"
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Cog6ToothIcon className="w-5 h-5" /> General
                    </button>
                    <button
                      onClick={() => window.open("/terms", "_blank")}
                      className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition"
                    >
                      <DocumentTextIcon className="w-5 h-5" /> Terms of Service
                    </button>
                    <button
                      onClick={() => window.open("/privacy", "_blank")}
                      className="flex items-center gap-3 p-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/50 transition"
                    >
                      <ShieldCheckIcon className="w-5 h-5" /> Privacy Policy
                    </button>
                  </nav>
                </div>
              )}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto relative">
                {isMobile && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                )}
                {renderContent()}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
