"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Allow access to login page without checking
      if (pathname === "/login" || pathname === "/auth") {
        setIsAuthenticated(false);
        return;
      }

      const { status } = await fetchAPI("/users/me");
      if (status === 200) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Loading state
  if (isAuthenticated === null && pathname !== "/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // If on login page or authenticated, render children
  return children;
}
