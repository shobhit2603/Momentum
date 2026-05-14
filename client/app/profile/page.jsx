"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { SignOut, CheckCircle, Circle, Fire, ChartLineUp } from "@phosphor-icons/react";
import { motion } from "motion/react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  const loadProfile = async () => {
    const { status, data } = await fetchAPI("/users/profile");
    if (status === 200 && data.success) {
      setUser(data.user);
    }
  };

  const loadHistory = async () => {
    const { status, data } = await fetchAPI("/tasks/history");
    if (status === 200 && data.success) {
      setHistory(data.tasks || []);
    }
  };

  const handleLogout = async () => {
    await fetchAPI("/users/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 font-light">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const groupedHistory = history.reduce((acc, task) => {
    const date = new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  const completedTotal = history.filter(t => t.status === "completed").length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 min-h-screen">
      <header className="mb-12 flex items-start justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-2">
            Your <span className="text-gradient font-medium">Legacy</span>
          </h1>
          <p className="text-neutral-500 font-light">Proof that you actually did something.</p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout} 
          className="p-3 bg-surface-hover border border-border text-neutral-400 hover:text-white rounded-2xl transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <SignOut size={20} weight="bold" />
        </motion.button>
      </header>

      {/* User Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-4xl p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="w-28 h-28 rounded-full bg-surface-hover border-2 border-border overflow-hidden shrink-0 shadow-xl shadow-black/50">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-medium text-4xl">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-medium text-white tracking-tight mb-1">{user.name}</h2>
          <p className="text-neutral-400 mb-6 font-light">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="bg-surface/80 border border-border px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Fire weight="fill" size={20} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Streak</span>
                <span className="text-white font-medium text-lg leading-none mt-1">{user.streak || 0} Days</span>
              </div>
            </div>
            <div className="bg-surface/80 border border-border px-5 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ChartLineUp weight="fill" size={20} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Total Done</span>
                <span className="text-white font-medium text-lg leading-none mt-1">{completedTotal} Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => window.location.href = '/history'}
          className="glass-panel px-6 py-3 rounded-full text-white font-medium hover:bg-surface-hover transition-colors flex items-center gap-2"
        >
          View Full History
        </button>
      </div>
    </div>
  );
}
