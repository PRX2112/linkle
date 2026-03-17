"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { UserProfile } from "@/lib/types";

interface PreviewContextType {
  previewUser: UserProfile | null;
  setPreviewUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updatePreviewUser: (updates: Partial<UserProfile>) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export function PreviewProvider({ children, initialUser }: { children: ReactNode, initialUser: any }) {
  const [previewUser, setPreviewUser] = useState<UserProfile | null>(initialUser);

  const updatePreviewUser = useCallback((updates: Partial<UserProfile>) => {
    setPreviewUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <PreviewContext.Provider value={{ previewUser, setPreviewUser, updatePreviewUser }}>
      {children}
    </PreviewContext.Provider>
  );
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider");
  }
  return context;
}
