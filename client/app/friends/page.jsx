"use client";

import { useState, useEffect } from "react";
import { UserPlus, ChatTeardropText, PaperPlaneRight, Fire, Smiley, Check } from "@phosphor-icons/react";
import { fetchAPI } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

export default function FriendsFeed() {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [activeReviewFriend, setActiveReviewFriend] = useState(null);
  const [reviewContent, setReviewContent] = useState("");

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

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
      // Refresh both lists
      loadFriends();
      loadPendingRequests();
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
                      {user.profilePicture ? <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" /> : <span className="text-primary font-medium">{user.name.charAt(0)}</span>}
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
                      {user.profilePicture ? <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" /> : <span className="text-primary font-medium">{user.name.charAt(0)}</span>}
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
          friends.map((friend, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={friend._id} 
              className="glass-panel p-6 rounded-3xl group transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {friend.profilePicture ? <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <span className="text-primary font-medium text-xl">{friend.name.charAt(0)}</span>}
                  </div>
                  <div>
                    <h3 className="font-medium text-xl text-white tracking-tight">{friend.name}</h3>
                    <div className="flex items-center gap-1.5 text-orange-400/80 text-sm mt-0.5 font-medium">
                      <Fire weight="fill" />
                      <span>{friend.streak || 0} Day Streak</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveReviewFriend(activeReviewFriend === friend._id ? null : friend._id)}
                  className={`p-3 rounded-2xl transition-all ${activeReviewFriend === friend._id ? "bg-primary text-white shadow-[0_0_20px_rgba(157,78,221,0.4)]" : "bg-surface-hover text-neutral-400 hover:text-white"}`}
                >
                  <ChatTeardropText size={24} weight={activeReviewFriend === friend._id ? "fill" : "duotone"} />
                </button>
              </div>

              {/* Minimal Progress visual */}
              <div className="bg-surface/50 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                 <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Status</span>
                    <p className="text-white font-light text-sm">Working hard...</p>
                 </div>
                 <div className="text-right flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Tasks</span>
                    <p className="text-primary font-medium text-sm">Active</p>
                 </div>
              </div>

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
          ))
        )}
      </div>
    </div>
  );
}
