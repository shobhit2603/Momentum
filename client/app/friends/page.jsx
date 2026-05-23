"use client";

import { useState, useEffect } from "react";
import { UserPlus, ChatTeardropText, PaperPlaneRight, Fire, Smiley, Check, CaretDown, Target } from "@phosphor-icons/react";
import { fetchAPI } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { renderTaskItem } from "@/lib/taskRenderer";
import Link from "next/link";

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getFriendStatus = (friend, completedCount, totalCount) => {
  const lastActiveLabel = formatTimeAgo(friend.lastActive);
  const lastActiveDate = friend.lastActive ? new Date(friend.lastActive) : null;
  const hoursSinceActive = lastActiveDate && !Number.isNaN(lastActiveDate.getTime())
    ? (Date.now() - lastActiveDate.getTime()) / 3600000
    : null;

  if (totalCount > 0 && completedCount === totalCount) {
    return {
      label: "All tasks done",
      tone: "text-emerald-400",
      dot: "bg-emerald-400",
      detail: "Crushing today's goals",
    };
  }

  if (totalCount > 0 && completedCount > 0) {
    return {
      label: "In the zone",
      tone: "text-primary",
      dot: "bg-primary",
      detail: "Momentum is building",
    };
  }

  if (hoursSinceActive !== null && hoursSinceActive <= 2) {
    return {
      label: "Active now",
      tone: "text-emerald-400",
      dot: "bg-emerald-400",
      detail: lastActiveLabel ? `Active ${lastActiveLabel}` : "Recently active",
    };
  }

  if (hoursSinceActive !== null && hoursSinceActive <= 24) {
    return {
      label: "Taking a break",
      tone: "text-yellow-400",
      dot: "bg-yellow-400",
      detail: lastActiveLabel ? `Last active ${lastActiveLabel}` : "Away for a bit",
    };
  }

  return {
    label: "Offline",
    tone: "text-neutral-400",
    dot: "bg-neutral-500",
    detail: lastActiveLabel ? `Last active ${lastActiveLabel}` : "No recent activity",
  };
};

export default function FriendsFeed() {
  const [friends, setFriends] = useState([]);
  const [friendsTasks, setFriendsTasks] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [activeReviewFriend, setActiveReviewFriend] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [expandedFriends, setExpandedFriends] = useState(new Set());

  const loadPendingRequests = async () => {
    const { status, data } = await fetchAPI("/users/friend-requests");
    if (status === 200 && data.success) {
      setPendingRequests(data.requests || []);
    }
  };

  const loadFriends = async () => {
    const { status, data } = await fetchAPI("/users/friends");
    if (status === 200 && data.success) {
      setFriends(data.friends || []);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const [friendsRes, requestsRes, tasksRes] = await Promise.all([
          fetchAPI("/users/friends"),
          fetchAPI("/users/friend-requests"),
          fetchAPI("/tasks/friends/today")
        ]);

        if (!isMounted) return;

        if (friendsRes.status === 200 && friendsRes.data.success) {
          setFriends(friendsRes.data.friends || []);
        }

        if (requestsRes.status === 200 && requestsRes.data.success) {
          setPendingRequests(requestsRes.data.requests || []);
        }

        if (tasksRes.status === 200 && tasksRes.data.success) {
          const grouped = {};
          tasksRes.data.tasks.forEach(task => {
            const friendId = task.userId?._id;
            if (friendId) {
              if (!grouped[friendId]) {
                grouped[friendId] = [];
              }
              grouped[friendId].push(task);
            }
          });
          setFriendsTasks(grouped);
        }
      } catch (err) {
        console.error("Error fetching friends data:", err);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const { status, data } = await fetchAPI(`/users/search?query=${searchQuery}`);
    if (status === 200 && data.success) {
      setSearchResults(data.users);
    }
  };

  const handleAddFriend = async (userId) => {
    const { status, data } = await fetchAPI("/users/friend-request", {
      method: "POST",
      body: JSON.stringify({ targetUserId: userId })
    });
    if (status === 200) {
      setSentRequests(prev => new Set(prev).add(userId));
    } else {
      alert(data?.message || "Failed to send request.");
    }
  };

  const handleAcceptFriend = async (requesterId) => {
    const { status, data } = await fetchAPI("/users/friend-request/accept", {
      method: "POST",
      body: JSON.stringify({ requesterId })
    });
    if (status === 200) {
      // Refresh both lists manually
      const [friendsRes, requestsRes] = await Promise.all([
        fetchAPI("/users/friends"),
        fetchAPI("/users/friend-requests")
      ]);
      if (friendsRes.status === 200 && friendsRes.data.success) {
        setFriends(friendsRes.data.friends || []);
      }
      if (requestsRes.status === 200 && requestsRes.data.success) {
        setPendingRequests(requestsRes.data.requests || []);
      }
    } else {
      alert(data?.message || "Failed to accept request.");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim() || !activeReviewFriend) return;
    
    const { status } = await fetchAPI("/reviews", {
      method: "POST",
      body: JSON.stringify({
        revieweeId: activeReviewFriend,
        content: reviewContent
      })
    });
    
    if (status === 201 || status === 200) {
      setReviewContent("");
      setActiveReviewFriend(null);
      // Optional toast
    }
  };

  const toggleFriendExpanded = (friendId) => {
    setExpandedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  };



  return (
    <div className="max-w-2xl mx-auto px-6 py-12 min-h-screen">
      <header className="mb-12">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-light text-white mb-2 tracking-tight">
          Your <span className="text-gradient font-medium">Squad</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-neutral-500 font-light text-lg">
          Roast or toast their daily progress.
        </motion.p>
      </header>

      {/* Search & Add */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4 group relative">
          <input 
            type="text" 
            placeholder="Find a lazy friend..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-surface/50 border border-border rounded-2xl px-6 py-4 text-white placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-surface transition-all text-lg font-light"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all">
            <UserPlus weight="duotone" size={24} />
          </button>
        </form>
        
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              {searchResults.map((user, idx) => (
                <div key={user._id} className={`flex items-center justify-between p-4 ${idx !== searchResults.length - 1 ? 'border-b border-border' : ''} hover:bg-surface-hover transition-colors`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-primary font-medium">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-light text-white text-lg">{user.name}</span>
                  </div>
                  <button 
                    onClick={() => handleAddFriend(user._id)} 
                    disabled={sentRequests.has(user._id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      sentRequests.has(user._id) 
                        ? "bg-surface-hover text-neutral-500 cursor-not-allowed" 
                        : "text-primary bg-primary/10 hover:bg-primary/20"
                    }`}
                  >
                    {sentRequests.has(user._id) ? "Sent" : "Add"}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pending Requests */}
      <AnimatePresence>
        {pendingRequests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12"
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4 ml-2">Pending Requests</h2>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {pendingRequests.map((user, idx) => (
                <div key={user._id} className={`flex items-center justify-between p-4 ${idx !== pendingRequests.length - 1 ? 'border-b border-border' : ''} bg-surface/50`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-primary font-medium">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="font-light text-white text-lg">{user.name}</span>
                  </div>
                  <button onClick={() => handleAcceptFriend(user._id)} className="flex items-center gap-2 text-white bg-primary px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    <Check weight="bold" /> Accept
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {friends.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-neutral-600 font-light">
            <Smiley size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">You have no friends on Momentum yet.</p>
          </motion.div>
        ) : (
          friends.map((friend, i) => {
            const friendTasksList = friendsTasks[friend._id] || [];
            const completedCount = friendTasksList.filter(task => task.status === "completed").length;
            const totalCount = friendTasksList.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const safeProgress = Math.min(100, Math.max(0, progressPercent));
            const remainingCount = Math.max(totalCount - completedCount, 0);
            const statusInfo = getFriendStatus(friend, completedCount, totalCount);
            const winRate = Number.isFinite(friend.winRate) ? Math.min(100, Math.max(0, friend.winRate)) : 0;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={friend._id} 
                className="glass-panel p-6 rounded-3xl group transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,15,15,0.35)]"
              >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Link href={`/friends/${friend._id}`} className="w-14 h-14 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner hover:scale-105 hover:border-primary/50 transition-all cursor-pointer">
                    {friend.profilePicture ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-medium text-xl">{friend.name.charAt(0)}</span>
                    )}
                  </Link>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/friends/${friend._id}`} className="font-medium text-xl text-white tracking-tight hover:text-primary transition-colors cursor-pointer">{friend.name}</Link>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold ${statusInfo.tone}`}>
                        <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 text-xs font-semibold">
                        <Fire weight="fill" size={14} />
                        {friend.streak || 0} day streak
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <Target weight="duotone" size={14} />
                        {winRate}% win rate
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">{statusInfo.detail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveReviewFriend(activeReviewFriend === friend._id ? null : friend._id)}
                  className={`p-3 rounded-2xl transition-all ${activeReviewFriend === friend._id ? "bg-primary text-white shadow-[0_0_20px_rgba(157,78,221,0.4)]" : "bg-surface-hover text-neutral-400 hover:text-white"}`}
                >
                  <ChatTeardropText size={24} weight={activeReviewFriend === friend._id ? "fill" : "duotone"} />
                </button>
              </div>

              {/* Progress visual */}
              <div className="bg-surface/50 p-4 rounded-2xl border border-border/50 mb-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Today&apos;s progress</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-white font-medium text-lg">{safeProgress}%</p>
                      <span className="text-xs text-neutral-500">{completedCount}/{totalCount || 0} done</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Remaining</span>
                    <p className="text-emerald-400 font-medium text-sm mt-1">{remainingCount}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-primary/80 via-primary to-emerald-400 transition-all duration-500" style={{ width: `${safeProgress}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-neutral-500">
                  <span>{totalCount === 0 ? "No tasks logged yet" : `${completedCount} completed`}</span>
                  <span>{totalCount === 0 ? "Waiting on updates" : `${totalCount} total`}</span>
                </div>
              </div>

              {/* Tasks Section */}
              {totalCount === 0 ? (
                <div className="bg-surface/30 p-4 rounded-2xl border border-border/50 mb-4 text-sm text-neutral-500">
                  No tasks shared yet today. Nudge them with a roast or a toast.
                </div>
              ) : (
                <div className="bg-surface/30 p-4 rounded-2xl border border-border/50 mb-4">
                  <div className="space-y-2">
                    {expandedFriends.has(friend._id) ? (
                      // Show all tasks when expanded
                      friendTasksList.map(task => renderTaskItem(task))
                    ) : (
                      // Show only first 3 tasks when collapsed
                      friendTasksList.slice(0, 3).map(task => renderTaskItem(task))
                    )}
                    {friendTasksList.length > 3 && (
                      <button 
                        onClick={() => toggleFriendExpanded(friend._id)}
                        className="text-xs text-primary font-medium pl-6 pt-1 hover:opacity-80 transition-opacity flex items-center gap-1"
                      >
                        {expandedFriends.has(friend._id) ? "Show less" : `+${friendTasksList.length - 3} more`}
                        <CaretDown 
                          size={12} 
                          weight="fill" 
                          className={`transition-transform ${expandedFriends.has(friend._id) ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {activeReviewFriend === friend._id && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={submitReview}
                    className="overflow-hidden relative"
                  >
                    <div className="pt-4 flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Type a roast or toast..." 
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        className="flex-1 bg-surface-hover border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all font-light"
                        autoFocus
                      />
                      <button 
                        type="submit"
                        disabled={!reviewContent.trim()}
                        className="bg-primary text-white px-5 rounded-xl flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-primary/90"
                      >
                        <PaperPlaneRight weight="fill" size={20} />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
