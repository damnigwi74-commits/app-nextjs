// components/LoadingBar.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LoadingBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Trigger loading when pathname changes
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600); // animation duration
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`h-1 bg-blue-600 fixed top-[64px] left-0 transition-all duration-500 ${
        loading ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
