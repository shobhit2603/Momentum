"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import {
  SignOut,
  Fire,
  CheckCircle,
  Target,
  Users,
  ChatCircle,
  CalendarCheck,
  Lightning,
  ArrowRight
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [profileRes, historyRes, reviewsRes] = await Promise.all([
          fetchAPI("/users/profile"),
          fetchAPI("/tasks/history"),
          fetchAPI("/reviews/me/today")
        ]);

        if (!isMounted) return;

        if (profileRes.status === 200 && profileRes.data.success) {
          setUser(profileRes.data.user);
        }
        if (historyRes.status === 200 && historyRes.data.success) {
          setHistory(historyRes.data.tasks || []);
        }
        if (reviewsRes.status === 200 && reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);

  async function handleLogout() {
    localStorage.removeItem("token");
    await fetchAPI("/users/logout", { method: "POST" });
    window.location.href = "/";
  }

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

  const uniqueDays = new Set(history.map(t => new Date(t.date).toDateString())).size;
  const avgTasksPerDay = uniqueDays > 0 ? (completedTotal / uniqueDays).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 min-h-screen">
      <header className="mb-12 flex items-start justify-between">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-2">
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
          className="p-2.5 bg-surface border border-border text-red-400 hover:text-red-300 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          <SignOut size={20} weight="bold" />
        </motion.button>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* User Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-8 bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden group hover:border-primary/20 transition-all"
        >
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-surface border border-border overflow-hidden relative z-10">
              {user.profilePicture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-medium text-4xl">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>

          <div className="flex-1 z-10 flex flex-col justify-center h-full">
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mb-1">{user.name}</h2>
            <p className="text-neutral-500 font-light mb-6 text-sm">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="bg-background/50 border border-border px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <Fire weight="fill" className="text-orange-400/80" size={20} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Streak</span>
                  <span className="text-white font-medium text-sm leading-none mt-1">{user.streak || 0} Days</span>
                </div>
              </div>
              <div className="bg-background/50 border border-border px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <Users weight="fill" className="text-blue-400/80" size={20} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Squad</span>
                  <span className="text-white font-medium text-sm leading-none mt-1">{user.friends?.length || 0} Friends</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Completion Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:border-primary/20 transition-all"
        >
          <Target weight="duotone" className="text-primary/70 mb-3" size={32} />
          <h3 className="text-4xl sm:text-5xl font-light text-white mb-1">{completionRate}<span className="text-xl text-neutral-500">%</span></h3>
          <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Win Rate</p>
          <div className="w-full h-1 bg-background rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-primary/80" style={{ width: `${completionRate}%` }}></div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <CheckCircle weight="duotone" className="text-emerald-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{completedTotal}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Total Done</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <CalendarCheck weight="duotone" className="text-purple-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{uniqueDays}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Active Days</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <Lightning weight="duotone" className="text-yellow-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{avgTasksPerDay}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Daily Avg</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <ChatCircle weight="duotone" className="text-pink-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{reviews.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Today&apos;s Feedback</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Friends/Squad Snapshot */}
        <div className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
              <Users weight="fill" className="text-blue-400/70" size={16} />
              Your Squad
            </h3>
            <Link href="/friends" className="text-xs text-primary hover:text-primary/80 transition-colors">
              View All
            </Link>
          </div>
          
          {!user.friends || user.friends.length === 0 ? (
            <div className="text-neutral-500 font-light text-center py-6 text-sm bg-background/50 rounded-2xl border border-border">
              You haven&apos;t added any friends yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {user.friends.map(friend => (
                <div 
                  key={friend._id} 
                  onClick={() => router.push(`/friends/${friend._id}`)}
                  className="relative group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full border border-border bg-background overflow-hidden transition-all group-hover:scale-105 group-hover:border-primary/50">
                    {friend.profilePicture ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-medium text-sm">{friend.name.charAt(0)}</div>
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {friend.name}
                  </div>
                </div>
              ))}
              <button onClick={() => router.push("/friends")} className="w-12 h-12 rounded-full border border-dashed border-border bg-background/50 flex items-center justify-center text-neutral-500 hover:text-primary hover:border-primary/50 transition-colors">
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
            <ChatCircle weight="fill" className="text-pink-400/70" size={16} />
            Feedback Received Today
          </h3>
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="bg-background/50 rounded-2xl p-6 text-center text-neutral-500 font-light border border-border text-sm">
                No roasts or toasts today.
              </div>
            ) : (
              reviews.map((review, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={review._id}
                  className="bg-background/50 border border-border p-4 rounded-2xl flex gap-3 hover:border-primary/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 bg-surface">
                    {review.reviewerId.profilePicture ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={review.reviewerId.profilePicture} alt="Reviewer" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary text-xs font-medium">
                        {review.reviewerId.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase text-neutral-500 font-medium mb-0.5">{review.reviewerId.name || "A friend"}</p>
                    <p className="text-white font-light text-sm">&quot;{review.content}&quot;</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History CTA Banner */}
      <div className="mt-4">
        <Link href="/history">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-primary/20 transition-all"
          >
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-medium text-white tracking-tight mb-1">Your Complete Legacy</h2>
              <p className="text-neutral-500 font-light text-sm">Explore every task you&apos;ve ever completed in the timeline view.</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-background border border-border text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <ArrowRight size={18} weight="bold" />
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
