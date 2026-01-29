"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface InspectionContextType {
  isInspectionMode: boolean;
  setInspectionMode: (value: boolean) => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export function InspectionProvider({ children }: { children: ReactNode }) {
  // За замовчуванням TRUE (Безпечний режим / Око закрите)
  const [isInspectionMode, setInspectionMode] = useState(true);

  return (
    <InspectionContext.Provider value={{ isInspectionMode, setInspectionMode }}>
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error("useInspection must be used within an InspectionProvider");
  }
  return context;
}