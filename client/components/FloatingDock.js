"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ListChecks, Users, UserCircle } from "@phosphor-icons/react";
import { motion } from "motion/react";

const navItems = [
  { name: "Dashboard", href: "/", icon: House },
  { name: "History", href: "/history", icon: ListChecks }, // Wait, earlier I made it /profile, let's stick to these or update the href. Profile shows history now.
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export default function FloatingDock() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/auth") return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-panel px-4 py-3 rounded-full flex items-center gap-2 shadow-2xl"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group px-3 py-2 flex items-center justify-center transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="dock-indicator"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={24}
                weight={isActive ? "fill" : "regular"}
                className={`relative z-10 transition-colors duration-300 ${isActive ? "text-primary" : "text-neutral-400 group-hover:text-white"}`}
              />
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.name}
              </div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
