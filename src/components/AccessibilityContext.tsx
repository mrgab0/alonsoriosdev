"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type TextSize = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  textSize: "normal",
  setTextSize: () => {},
  isHighContrast: false,
  toggleHighContrast: () => {},
});

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSize] = useState<TextSize>("normal");
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const savedSize = localStorage.getItem("alonsorios_text_size") as TextSize;
    if (savedSize) setTextSize(savedSize);

    const savedContrast = localStorage.getItem("alonsorios_high_contrast");
    if (savedContrast === "true") setIsHighContrast(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (textSize === "large") {
        document.documentElement.style.fontSize = "112.5%";
      } else if (textSize === "xlarge") {
        document.documentElement.style.fontSize = "125%";
      } else {
        document.documentElement.style.fontSize = "100%";
      }
    }
  }, [textSize]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isHighContrast) {
        document.documentElement.classList.add("contrast-mode");
      } else {
        document.documentElement.classList.remove("contrast-mode");
      }
    }
  }, [isHighContrast]);

  const handleSetTextSize = (size: TextSize) => {
    setTextSize(size);
    localStorage.setItem("alonsorios_text_size", size);
  };

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem("alonsorios_high_contrast", String(next));
      return next;
    });
  };

  const getFontSizeClass = () => {
    if (textSize === "large") return "text-lg-scaling";
    if (textSize === "xlarge") return "text-xl-scaling";
    return "";
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textSize,
        setTextSize: handleSetTextSize,
        isHighContrast,
        toggleHighContrast,
      }}
    >
      <div
        className={`${getFontSizeClass()} ${
          isHighContrast ? "contrast-mode bg-black text-white" : "bg-[#0a1120] text-white"
        } transition-all duration-200 min-h-screen flex flex-col`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
