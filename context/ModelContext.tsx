"use client";
import React, { createContext, useContext, useState } from "react";
export type ModelType = "gemini-pro-2-5" | "llama-4-scout" | "deepseek-r1";

interface ModelContextType {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}
const ModelContext = createContext<ModelContextType | null>(null);
export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelType>(
    "gemini-pro-2-5"
  );
  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}
export function useModel() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used within ModelProvider");
  return ctx;
}
