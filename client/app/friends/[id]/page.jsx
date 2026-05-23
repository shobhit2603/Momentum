"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import {
  ArrowLeft,
  Fire,
  CheckCircle,
  Target,
  Users,
  ChatCircle,
  CalendarCheck,
  Lightning,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";

export default function FriendProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [friend, setFriend] = useState(null);
  const [friendTasks, setFriendTasks] = useState([]);
  const [friendHistory, setFriendHistory] = useState([]);
  const [friendReviews, setFriendReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!id) return;
      try {
        const [dataRes, tasksRes, historyRes, reviewsRes] = await Promise.all([
          fetchAPI("/users/friends"),
          fetchAPI(`/tasks/friend/${id}/today`),
          fetchAPI(`/tasks/friend/${id}/history`),
          fetchAPI(`/reviews/friend/${id}/today`)
        ]);

        if (!isMounted) return;

        if (dataRes.status === 200 && dataRes.data.success) {
          const foundFriend = dataRes.data.friends.find(f => f._id === id);
          if (foundFriend) setFriend(foundFriend);
        }
        if (tasksRes.status === 200 && tasksRes.data.success) {
          setFriendTasks(tasksRes.data.tasks || []);
        }
        if (historyRes.status === 200 && historyRes.data.success) {
          setFriendHistory(historyRes.data.tasks || []);
        }
        if (reviewsRes.status === 200 && reviewsRes.data.success) {
          setFriendReviews(reviewsRes.data.reviews || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <p className="text-neutral-500 mb-4">Friend not found.</p>
        <button onClick={() => router.push("/friends")} className="text-primary hover:underline">
          Go back to friends
        </button>
      </div>
    );
  }

  const completedToday = friendTasks.filter(t => t.status === "completed").length;
  const winRate = friend.winRate || 0;
  
  const completedHistoryTotal = friendHistory.filter(t => t.status === "completed").length;
  const uniqueDays = new Set(friendHistory.map(t => new Date(t.date).toDateString())).size;
  const avgTasksPerDay = uniqueDays > 0 ? (completedHistoryTotal / uniqueDays).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 min-h-screen">
      <header className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-surface border border-border text-neutral-400 hover:text-white rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight mb-2">
              {friend.name.split(' ')[0]}&apos;s <span className="text-gradient font-medium">Profile</span>
            </h1>
            <p className="text-neutral-500 font-light text-lg">Watching their momentum.</p>
          </motion.div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Friend Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-8 bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden group hover:border-primary/20 transition-all"
        >
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-surface border border-border overflow-hidden relative z-10">
              {friend.profilePicture ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-medium text-4xl">
                  {friend.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>

          <div className="flex-1 z-10 flex flex-col justify-center h-full">
            <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight mb-1">{friend.name}</h2>
            <p className="text-neutral-500 font-light mb-6 text-sm">{friend.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="bg-background/50 border border-border px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <Fire weight="fill" className="text-orange-400/80" size={20} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Streak</span>
                  <span className="text-white font-medium text-sm leading-none mt-1">{friend.streak || 0} Days</span>
                </div>
              </div>
              <div className="bg-background/50 border border-border px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <Users weight="fill" className="text-blue-400/80" size={20} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Squad</span>
                  <span className="text-white font-medium text-sm leading-none mt-1">{friend.friends?.length || 0} Friends</span>
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
          <h3 className="text-4xl sm:text-5xl font-light text-white mb-1">{winRate}<span className="text-xl text-neutral-500">%</span></h3>
          <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium">Global Win Rate</p>
          <div className="w-full h-1 bg-background rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-primary/80" style={{ width: `${winRate}%` }}></div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <CheckCircle weight="duotone" className="text-emerald-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{friendTasks.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Tasks Today</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <CalendarCheck weight="duotone" className="text-purple-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{completedToday}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Done Today</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <Lightning weight="duotone" className="text-yellow-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{avgTasksPerDay}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Daily Avg</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-surface/40 backdrop-blur-xl border border-white/5 p-5 rounded-3xl flex flex-col hover:border-primary/20 transition-all">
          <ChatCircle weight="duotone" className="text-pink-400/70 mb-2" size={24} />
          <span className="text-xl font-medium text-white mb-1">{friendReviews.length}</span>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Feedback</span>
        </motion.div>
      </div>

      <div className="mt-4">
        {/* Friend's Tasks Today Snapshot */}
        <div className="bg-surface/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
            <CheckCircle weight="fill" className="text-emerald-400/70" size={16} />
            {friend.name.split(' ')[0]}&apos;s Tasks Today
          </h3>
          
          <div className="space-y-3">
            {friendTasks.length === 0 ? (
              <div className="bg-background/50 rounded-2xl p-6 text-center text-neutral-500 font-light border border-border text-sm">
                No tasks created today.
              </div>
            ) : (
              friendTasks.map((task, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={task._id}
                  className={`bg-background/50 border border-border p-4 rounded-2xl flex items-center gap-3 hover:border-primary/20 transition-colors ${task.status === "completed" ? "opacity-60" : ""}`}
                >
                  <div className="shrink-0">
                    {task.status === "completed" ? (
                      <CheckCircle weight="fill" className="text-primary/70" size={24} />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-neutral-600"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${task.status === "completed" ? "text-neutral-500 line-through" : "text-white"}`}>
                      {task.title}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
