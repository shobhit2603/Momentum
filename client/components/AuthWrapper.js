"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function AuthWrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if token is in the URL (from Google redirect)
      const urlToken = searchParams.get("token")
        || (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("token")
          : null);
      if (urlToken) {
        localStorage.setItem("token", urlToken);
        window.dispatchEvent(new Event("momentum:token"));
        addToast({
          type: "success",
          title: "Login successful",
          message: "Welcome back to Momentum.",
        });
        // Clean up the URL
        router.replace(pathname);
      }

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
  }, [pathname, router, searchParams, addToast]);

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
