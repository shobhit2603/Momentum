"use client";

import { motion } from "motion/react";
import { CheckCircle, GoogleLogo } from "@phosphor-icons/react";

export default function Login() {
  const handleGoogleLogin = () => {
    // Redirect to the backend OAuth route
    window.location.href = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/google`
      : "http://localhost:8080/api/users/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_40px_rgba(157,78,221,0.3)]"
          >
            <CheckCircle weight="fill" className="text-primary text-3xl" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-tight">
            Meet <span className="text-gradient font-medium">Momentum</span>
          </h1>
          <p className="text-neutral-400 font-light">The minimal task tracker for lazy people who actually want to get things done.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          className="w-full glass-panel py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-white font-medium hover:bg-surface-hover transition-colors shadow-lg border border-neutral-800"
        >
          <GoogleLogo weight="bold" className="text-xl" />
          <span>Continue with Google</span>
        </motion.button>
        
        <p className="text-center text-xs text-neutral-600 mt-6">
          By continuing, you agree to actually finish your tasks today.
        </p>
      </motion.div>
    </div>
  );
}
