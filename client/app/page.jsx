"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle, Circle, Microphone, Plus, WarningCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";
import { fetchAPI } from "@/lib/api";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    loadTasks();
    
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleVoiceSubmit(transcript);
        }
        setIsListening(false);
        setErrorMsg("");
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'network') {
          setErrorMsg("Voice search unavailable (network/HTTPS issue). Try typing instead.");
        } else if (event.error === 'not-allowed') {
          setErrorMsg("Microphone access denied.");
        } else {
          setErrorMsg("Voice recognition failed.");
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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Voice recognition not supported in this browser.");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMsg("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const progress = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 min-h-screen relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-panel border-red-500/20 px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-sm"
          >
            <WarningCircle size={20} weight="fill" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-12">
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
            <span className="text-neutral-500">Progress</span>
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
              className="text-center py-20 text-neutral-600 font-light"
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
