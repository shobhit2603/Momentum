import "./globals.css";

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
        <AuthWrapper>
          <main className="flex-1 pb-24">
            {children}
          </main>
          <FloatingDock />
        </AuthWrapper>
      </body>
    </html>
  );
}
