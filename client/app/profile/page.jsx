"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { 
  SignOut, 
  Fire, 
  ChartLineUp, 
  Target, 
  Users, 
  ChatCircle,
  CalendarCheck,
  Lightning,
  ArrowRight
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadProfile(),
      loadHistory(),
      loadReviews()
    ]).finally(() => setLoading(false));
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

  const loadReviews = async () => {
    const { status, data } = await fetchAPI("/reviews/me/today");
    if (status === 200 && data.success) {
      setReviews(data.reviews || []);
    }
  };

  const handleLogout = async () => {
    await fetchAPI("/users/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Calculations ---
  const completedTotal = history.filter(t => t.status === "completed").length;
  const totalTasks = history.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTotal / totalTasks) * 100) : 0;
  
  // Calculate average tasks per day from history
  const uniqueDays = new Set(history.map(t => new Date(t.date).toDateString())).size;
  const avgTasksPerDay = uniqueDays > 0 ? (completedTotal / uniqueDays).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-32 min-h-screen">
      <header className="mb-12 flex items-start justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-2">
            Your <span className="text-gradient font-medium">Profile</span>
          </h1>
          <p className="text-neutral-500 font-light text-lg">Your momentum at a glance.</p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout} 
          className="p-3 bg-surface-hover border border-border text-red-400 hover:text-red-300 rounded-2xl transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <SignOut size={20} weight="bold" />
        </motion.button>
      </header>

      {/* Main Top Section: Identity & Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 glass-panel rounded-4xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-surface-hover border-[3px] border-surface overflow-hidden shrink-0 shadow-2xl shadow-primary/20 relative z-10 transition-transform duration-500 group-hover:scale-105">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-medium text-4xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            {/* Pulsing ring behind avatar */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-20"></div>
          </div>
          
          <div className="flex-1 z-10">
            <h2 className="text-3xl font-medium text-white tracking-tight mb-1">{user.name}</h2>
            <p className="text-neutral-400 font-light mb-6 bg-surface/50 inline-block px-3 py-1 rounded-full text-sm border border-border/50">{user.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
                <Fire weight="fill" className="text-orange-400" size={24} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Streak</span>
                  <span className="text-white font-medium text-lg leading-none mt-0.5">{user.streak || 0} Days</span>
                </div>
              </div>
              <div className="bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
                <Users weight="fill" className="text-blue-400" size={24} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Squad</span>
                  <span className="text-white font-medium text-lg leading-none mt-0.5">{user.friends?.length || 0} Friends</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completion Rate Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-4xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none"></div>
          <Target weight="duotone" className="text-primary mb-4" size={48} />
          <h3 className="text-5xl font-light text-white mb-2">{completionRate}<span className="text-2xl text-neutral-500">%</span></h3>
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Win Rate</p>
          <div className="w-full h-1.5 bg-surface rounded-full mt-6 overflow-hidden">
             <div className="h-full bg-primary" style={{ width: `${completionRate}%` }}></div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="glass-panel p-6 rounded-3xl flex flex-col hover:bg-surface-hover transition-colors">
          <ChartLineUp weight="duotone" className="text-emerald-400 mb-3" size={28} />
          <span className="text-2xl font-medium text-white mb-1">{completedTotal}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Total Done</span>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl flex flex-col hover:bg-surface-hover transition-colors">
          <CalendarCheck weight="duotone" className="text-purple-400 mb-3" size={28} />
          <span className="text-2xl font-medium text-white mb-1">{uniqueDays}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Active Days</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="glass-panel p-6 rounded-3xl flex flex-col hover:bg-surface-hover transition-colors">
          <Lightning weight="duotone" className="text-yellow-400 mb-3" size={28} />
          <span className="text-2xl font-medium text-white mb-1">{avgTasksPerDay}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Daily Avg</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl flex flex-col hover:bg-surface-hover transition-colors">
          <ChatCircle weight="duotone" className="text-pink-400 mb-3" size={28} />
          <span className="text-2xl font-medium text-white mb-1">{reviews.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Today's Roasts</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Friends/Squad Snapshot */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
            <Users weight="fill" className="text-blue-400" />
            Your Squad
          </h3>
          <div className="glass-panel rounded-3xl p-6">
            {!user.friends || user.friends.length === 0 ? (
              <p className="text-neutral-500 font-light text-center py-6">You haven't added any friends yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {user.friends.map(friend => (
                  <div key={friend._id} className="relative group cursor-pointer">
                    <div className="w-14 h-14 rounded-full border-2 border-border bg-surface overflow-hidden transition-transform group-hover:scale-110 group-hover:border-primary/50 shadow-md">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-medium">{friend.name.charAt(0)}</div>
                      )}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {friend.name}
                    </div>
                  </div>
                ))}
                <Link href="/friends" className="w-14 h-14 rounded-full border-2 border-dashed border-border bg-surface-hover flex items-center justify-center text-neutral-500 hover:text-primary hover:border-primary/50 transition-colors">
                  <ArrowRight size={20} weight="bold" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
            <ChatCircle weight="fill" className="text-pink-400" />
            Feedback Received Today
          </h3>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="glass-panel rounded-3xl p-8 text-center text-neutral-500 font-light border border-dashed border-border/50">
                No roasts or toasts today. They're watching you.
              </div>
            ) : (
              reviews.map((review, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={review._id} 
                  className="glass-panel p-5 rounded-3xl flex gap-4 hover:bg-surface-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border shrink-0 bg-surface">
                    {review.reviewerId.profilePicture ? (
                      <img src={review.reviewerId.profilePicture} alt="Reviewer" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-sm font-medium">
                        {review.reviewerId.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 font-medium mb-1">{review.reviewerId.name || "A friend"} said:</p>
                    <p className="text-white font-light italic">"{review.content}"</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History CTA Banner */}
      <Link href="/history">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-4xl group cursor-pointer border border-primary/20 shadow-[0_0_40px_rgba(157,78,221,0.1)] hover:shadow-[0_0_60px_rgba(157,78,221,0.2)] transition-all"
        >
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-surface to-primary/5 z-0"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/30 transition-colors"></div>
          
          <div className="relative z-10 p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-light text-white mb-2 tracking-tight">Your Complete <span className="text-gradient font-medium">Legacy</span></h2>
              <p className="text-neutral-400 font-light">Explore every task you've ever completed in the timeline view.</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg">
              <ArrowRight size={24} weight="bold" />
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
