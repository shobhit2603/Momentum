import "./globals.css";
import { Suspense } from "react";

export const metadata = {
  title: "Momentum",
  description: "A Productivity App",
};

import AuthWrapper from "@/components/AuthWrapper";
import FloatingDock from "@/components/FloatingDock";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        }>
          <AuthWrapper>
            <main className="flex-1 pb-24">
              {children}
            </main>
            <FloatingDock />
          </AuthWrapper>
        </Suspense>
      </body>
    </html>
  );
}
