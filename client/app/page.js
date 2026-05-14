"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Circle, Microphone, Plus, WarningCircle, Fire } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAPI } from "@/lib/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [friendsTasks, setFriendsTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    loadTasks();
    loadFriendsTasks();
    
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      // 'continuous = true' sometimes prevents immediate network drops on localhost
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          handleVoiceSubmit(transcript);
        }
        stopListening();
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
        if (event.error === 'network') {
          setErrorMsg("Voice search unavailable locally without HTTPS. Try typing instead.");
        } else if (event.error === 'not-allowed') {
          setErrorMsg("Microphone access denied.");
        } else {
          setErrorMsg(`Voice recognition failed: ${event.error}`);
        }
        setTimeout(() => setErrorMsg(""), 5000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;

      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
      
      setTimeLeft(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTasks = async () => {
    const { status, data } = await fetchAPI("/tasks/today");
    if (status === 200 && data.success) {
      setTasks(data.tasks);
    }
  };

  const loadFriendsTasks = async () => {
    const { status, data } = await fetchAPI("/tasks/friends/today");
    if (status === 200 && data.success) {
      setFriendsTasks(data.tasks);
    }
  };

  const handleVoiceSubmit = async (text) => {
    const { status, data } = await fetchAPI("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: text })
    });
    if (status === 201 && data.success) {
      setTasks(prev => [data.task, ...prev]);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { status, data } = await fetchAPI("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: newTaskTitle })
    });
    if (status === 201 && data.success) {
      setTasks(prev => [data.task, ...prev]);
      setNewTaskTitle("");
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    await fetchAPI(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setErrorMsg("Voice recognition not supported in this browser.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      try {
        // Trigger permission prompt explicitly to help with local network errors
        if (navigator.mediaDevices) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMsg("");
      } catch (err) {
        console.error(err);
        setErrorMsg("Microphone access denied or unavailable.");
        setTimeout(() => setErrorMsg(""), 5000);
      }
    }
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  // Group friends' tasks by friend
  const groupedFriendsTasks = friendsTasks.reduce((acc, task) => {
    if (!task.userId) return acc;
    const friendId = task.userId._id;
    if (!acc[friendId]) {
      acc[friendId] = {
        friend: task.userId,
        tasks: []
      };
    }
    acc[friendId].tasks.push(task);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-screen relative grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border border-red-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-sm shadow-2xl"
          >
            <WarningCircle size={20} weight="fill" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tasks Area */}
      <div className="lg:col-span-2">
        <header className="mb-10">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-4">
            <p className="text-neutral-500 font-medium tracking-wide uppercase text-xs">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="glass-panel text-red-400 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="tabular-nums">{timeLeft}</span>
            </div>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-2">
            Today's <span className="text-gradient font-medium">Momentum</span>
          </h1>
        </header>

        {/* Progress */}
        {tasks.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10">
            <div className="flex justify-between text-xs mb-3 font-medium uppercase tracking-widest">
              <span className="text-neutral-500">Your Progress</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-linear-to-r from-primary/50 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Manual Input */}
        <form onSubmit={handleManualSubmit} className="mb-10 relative group">
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-surface/50 border border-border rounded-2xl py-4 pl-6 pr-14 text-white placeholder-neutral-600 focus:outline-none focus:border-primary/50 focus:bg-surface transition-all text-lg font-light"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary/10 text-primary rounded-xl disabled:opacity-0 transition-all hover:bg-primary/20"
          >
            <Plus weight="bold" />
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-20 text-neutral-600 font-light glass-panel rounded-3xl"
              >
                No tasks yet. Hold the mic and speak.
              </motion.div>
            ) : (
              tasks.map(task => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTask(task._id, task.status)}
                  className={`group flex items-center p-5 rounded-2xl cursor-pointer transition-all ${
                    task.status === "completed" 
                      ? "bg-surface/30 border border-transparent opacity-60" 
                      : "glass-panel hover:bg-surface-hover"
                  }`}
                >
                  <div className="mr-5 shrink-0 transition-transform group-hover:scale-110">
                    {task.status === "completed" ? (
                      <CheckCircle size={28} weight="fill" className="text-primary" />
                    ) : (
                      <Circle size={28} weight="duotone" className="text-neutral-500 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className={`flex-1 text-lg font-light transition-all duration-300 ${task.status === "completed" ? "text-neutral-500 line-through decoration-neutral-600" : "text-white"}`}>
                    {task.title}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Friends Sidebar (Desktop) / Bottom section (Mobile) */}
      <div className="lg:border-l lg:border-border lg:pl-8 pt-12 lg:pt-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
          <Fire weight="fill" className="text-orange-500" size={16} />
          Squad Activity
        </h2>
        
        <div className="space-y-6">
          {Object.values(groupedFriendsTasks).length === 0 ? (
            <div className="text-neutral-600 font-light text-sm p-6 bg-surface/30 rounded-2xl border border-border/50 text-center">
              Your friends are slacking. No tasks created today.
            </div>
          ) : (
            Object.values(groupedFriendsTasks).map(({ friend, tasks }) => {
              const friendCompleted = tasks.filter(t => t.status === "completed").length;
              const friendTotal = tasks.length;
              const friendProgress = friendTotal === 0 ? 0 : (friendCompleted / friendTotal) * 100;
              
              return (
                <div key={friend._id} className="glass-panel p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-hover border border-border shrink-0">
                      {friend.profilePicture ? (
                        <img src={friend.profilePicture} alt={friend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-medium">{friend.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm leading-tight">{friend.name}</h3>
                      <div className="w-full h-1 bg-surface-hover rounded-full mt-1.5 overflow-hidden flex">
                         <div className="h-full bg-primary/80 transition-all" style={{ width: `${friendProgress}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task._id} className="flex items-start gap-2 text-sm">
                        {task.status === "completed" ? (
                           <CheckCircle className="text-primary mt-0.5 shrink-0" weight="fill" size={16} />
                        ) : (
                           <Circle className="text-neutral-600 mt-0.5 shrink-0" weight="duotone" size={16} />
                        )}
                        <span className={`font-light truncate ${task.status === "completed" ? "text-neutral-500 line-through decoration-neutral-700" : "text-neutral-300"}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <div className="text-xs text-neutral-500 font-medium pl-6 pt-1">
                        +{tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Voice FAB */}
      <div className="fixed bottom-28 right-6 md:bottom-12 md:right-12 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(157,78,221,0.3)] backdrop-blur-xl transition-all border ${
            isListening ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "bg-surface/80 border-primary/30 text-primary hover:bg-primary/10"
          }`}
        >
          <Microphone size={28} weight={isListening ? "fill" : "duotone"} />
        </motion.button>
      </div>
    </div>
  );
}
