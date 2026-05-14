"use client";

import { motion } from "motion/react";
import { CheckCircle, GoogleLogo, Microphone, Users, Lightning, Fire, ArrowRight } from "@phosphor-icons/react";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/google`
      : "http://localhost:8080/api/users/google";
  };

  const features = [
    {
      icon: <Microphone weight="fill" className="text-purple-400" size={24} />,
      title: "Voice-First",
      desc: "Too lazy to type? Just hold the mic and speak your tasks."
    },
    {
      icon: <Users weight="fill" className="text-blue-400" size={24} />,
      title: "Squad Accountability",
      desc: "Roast or toast your friends based on their daily progress."
    },
    {
      icon: <Lightning weight="fill" className="text-yellow-400" size={24} />,
      title: "Daily Reset",
      desc: "Tasks don't roll over. Do it today, or it's marked as failed."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden selection:bg-primary/30">
      
      {/* LEFT PANEL - Branding & Login */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full mx-auto lg:mx-0 relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(157,78,221,0.2)]">
              <CheckCircle weight="fill" className="text-primary text-2xl" />
            </div>
            <span className="text-white font-bold tracking-widest uppercase text-sm">Momentum</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-light mb-6 tracking-tight text-white leading-tight">
            Get shit done. <br/>
            <span className="font-medium text-gradient">Together.</span>
          </h1>
          
          <p className="text-neutral-400 font-light text-lg mb-12 leading-relaxed">
            The minimalist task tracker designed for lazy people who need social pressure to actually finish their daily goals.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full relative group overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-r from-primary via-purple-500 to-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative glass-panel bg-surface/80 m-px rounded-[15px] py-4 px-6 flex items-center justify-center gap-3 transition-colors group-hover:bg-surface/60">
              <GoogleLogo weight="bold" className="text-white text-xl" />
              <span className="text-white font-medium text-lg">Continue with Google</span>
              <ArrowRight weight="bold" className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all ml-2" />
            </div>
          </motion.button>
          
          <p className="text-center text-xs text-neutral-600 mt-6 font-medium tracking-wide">
            BY LOGGING IN, YOU AGREE TO STOP PROCRASTINATING
          </p>
        </motion.div>
      </div>

      {/* RIGHT PANEL - Feature Showcase (Hidden on small screens) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-surface/30 border-l border-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Floating Abstract Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
        ></motion.div>
        
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
        ></motion.div>

        <div className="w-full max-w-lg relative z-10 space-y-6">
          {features.map((feature, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
              key={idx}
              className="glass-panel p-6 rounded-3xl flex gap-5 hover:bg-surface-hover hover:scale-[1.02] transition-all cursor-default border border-border/50 hover:border-primary/30 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 group-hover:shadow-[0_0_20px_rgba(157,78,221,0.2)] transition-shadow">
                {feature.icon}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-white font-medium text-lg mb-1">{feature.title}</h3>
                <p className="text-neutral-400 font-light text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Decorative Mock Task */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute -bottom-16 -right-8 glass-panel p-5 rounded-2xl flex items-center gap-4 w-72 shadow-2xl border-primary/20 rotate-[-5deg] backdrop-blur-xl"
          >
            <CheckCircle weight="fill" className="text-primary text-2xl shrink-0" />
            <span className="text-neutral-300 font-light text-sm line-through decoration-neutral-600">Let's Grow Together</span>
            <Fire weight="fill" className="text-orange-500 ml-auto" />
          </motion.div>
        </div>
      </div>
      
    </div>
  );
}
