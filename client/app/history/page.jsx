"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { CheckCircle, Circle, ArrowLeft } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { status, data } = await fetchAPI("/tasks/history");
    if (status === 200 && data.success) {
      setHistory(data.tasks || []);
    }
    setLoading(false);
  };

  const groupedHistory = history.reduce((acc, task) => {
    const date = new Date(task.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 min-h-screen">
      <header className="mb-12 relative">
        <Link href="/" className="absolute -left-14 top-2 hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-surface-hover text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={20} weight="bold" />
        </Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-2">
            Your <span className="text-gradient font-medium">History</span>
          </h1>
          <p className="text-neutral-500 font-light text-lg">A detailed log of your past momentum.</p>
        </motion.div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : Object.keys(groupedHistory).length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel rounded-3xl border border-dashed border-border/50">
          <p className="text-neutral-500 font-light text-lg">No history found. Complete some tasks today!</p>
        </motion.div>
      ) : (
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[1.1rem] md:before:ml-9 before:w-px before:bg-linear-to-b before:from-border before:via-border/50 before:to-transparent z-0">
          {Object.keys(groupedHistory).map((date, idx) => {
            const dayTasks = groupedHistory[date];
            const completedCount = dayTasks.filter(t => t.status === "completed").length;
            const progress = dayTasks.length === 0 ? 0 : (completedCount / dayTasks.length) * 100;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={date} 
                className="relative flex flex-col md:flex-row items-start gap-4 md:gap-8 group z-10"
              >
                {/* Timeline Dot */}
                <div className="flex items-center justify-center w-9 h-9 md:w-16 md:h-16 rounded-full border-4 border-background bg-surface-hover text-neutral-500 group-hover:text-primary transition-colors shrink-0 shadow-xl mt-1 md:mt-0 z-10">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-current rounded-full transition-transform group-hover:scale-150"></div>
                </div>
                
                {/* Content Card */}
                <div className="flex-1 glass-panel rounded-3xl overflow-hidden transition-all hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(157,78,221,0.05)] w-full">
                  <div className="p-5 md:p-6 bg-surface/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="font-medium text-white tracking-wide text-lg">{date}</h4>
                    
                    <div className="flex items-center gap-4 bg-background/50 px-4 py-2 rounded-full border border-border/50">
                      <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Score</span>
                      <div className="flex items-center gap-2">
                         <span className="text-white font-medium">{completedCount}/{dayTasks.length}</span>
                         <div className="w-16 h-1.5 bg-surface-hover rounded-full overflow-hidden flex">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 md:p-6 space-y-4 bg-surface/10">
                    {dayTasks.map(task => (
                      <div key={task._id} className="flex items-start gap-4">
                        {task.status === "completed" ? (
                           <CheckCircle className="text-primary mt-1 shrink-0" weight="fill" size={24} />
                        ) : (
                           <Circle className="text-neutral-600 mt-1 shrink-0" weight="duotone" size={24} />
                        )}
                        <span className={`font-light text-lg ${task.status === "completed" ? "text-neutral-500 line-through decoration-neutral-700/50" : "text-neutral-200"}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
