"use client";

import React, { useState, useEffect } from "react";
import NavigationWrapper from "@/components/NavigationWrapper";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import PartialReasonModal from "@/components/PartialReasonModal";
import { 
  ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, 
  Clock, AlertCircle, CheckCircle2, AlertTriangle, Trash2, Check, AlertOctagon 
} from "lucide-react";

interface Task {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string;
  due_time: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "done" | "partial" | "missed";
  repeat: "none" | "daily" | "weekly";
  note: string | null;
  partial_reason: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [sessionLoading, setSessionLoading] = useState(true);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize and verify client session with Supabase
  useEffect(() => {
    const verifySession = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const isMockEnv = !url || !anonKey || url.includes("your-project.supabase.co") || anonKey.includes("your-anon-key-here");

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if ((error || !session) && !isMockEnv) {
          showToast("Access denied. Please log in first.", "error");
          router.push("/login");
        } else {
          setSupabaseSession(session || { user: { email: "mock@example.com" } });
          setSessionLoading(false);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        router.push("/login");
      }
    };
    verifySession();
  }, []);

  // Modal / Side Panel states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Partial reason modal
  const [partialModalOpen, setPartialModalOpen] = useState(false);
  const [partialTargetTaskId, setPartialTargetTaskId] = useState<string | null>(null);

  // Add form fields (simplified experience)
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDueTime, setNewDueTime] = useState("");

  // Sync newDueDate when selectedDate or modal open state changes
  useEffect(() => {
    if (selectedDate) {
      setNewDueDate(formatDateStr(selectedDate));
    }
  }, [selectedDate, isAddFormOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Supabase fetch error:", error);
      } else if (data) {
        setTasks(data as Task[]);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();

      // Setup Realtime listener
      const channel = supabase
        .channel("tasks-db-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks" },
          (payload) => {
            console.log("Realtime tasks change:", payload);
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Calendar calculations
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = formatDateStr(date);
    return tasks.filter((t) => t.due_date === dateStr);
  };

  const getDayStatus = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return "GREY";

    const doneCount = dayTasks.filter((t) => t.status === "done").length;
    const partialCount = dayTasks.filter((t) => t.status === "partial").length;

    if (doneCount === dayTasks.length) {
      return "GREEN"; // All tasks completed
    } else if (doneCount > 0 || partialCount > 0) {
      return "AMBER"; // Partial completion
    } else {
      return "RED"; // None completed (pending or missed)
    }
  };

  // Stats calculation
  const getMonthStats = () => {
    const monthTasks = tasks.filter((t) => {
      const taskDate = new Date(t.due_date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });

    const done = monthTasks.filter((t) => t.status === "done").length;
    const partial = monthTasks.filter((t) => t.status === "partial").length;
    const missed = monthTasks.filter((t) => t.status === "missed").length;

    return { done, partial, missed };
  };

  const stats = getMonthStats();

  // Add Task submit (simplified to Title, Due Date & Time, Description)
  const [addingTask, setAddingTask] = useState(false);
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate || !user) return;

    // ── Date / Time Validation ──────────────────────────────────────────────
    const now = new Date();
    const todayStr = formatDateStr(now);
    const taskDateStr = newDueDate; // "YYYY-MM-DD"

    // Rule 1 — due_date is strictly in the past
    if (taskDateStr < todayStr) {
      showToast("Cannot add task — due date is in the past.", "error");
      return;
    }

    // Rule 2 — due_date is today AND due_time is already past
    if (taskDateStr === todayStr && newDueTime) {
      const [hours, minutes] = newDueTime.split(":").map(Number);
      const taskDateTime = new Date();
      taskDateTime.setHours(hours, minutes, 0, 0);

      if (taskDateTime < now) {
        showToast("Cannot add task — the time has already passed today.", "error");
        return;
      }
    }
    // ── End Validation ──────────────────────────────────────────────────────

    setAddingTask(true);
    const newTaskObj = {
      user_id: user.id,
      title: newTitle.trim(),
      subject: "Other", // default fallback
      description: newDescription.trim() || null,
      due_date: newDueDate,
      due_time: newDueTime || null,
      priority: "medium" as const, // default fallback
      status: "pending" as const,
      repeat: "none" as const, // default fallback
      note: null, // merged into description
    };

    const { error } = await supabase.from("tasks").insert(newTaskObj);

    setAddingTask(false);
    if (error) {
      showToast("Failed to add task", "error");
    } else {
      showToast("Task added successfully ✓", "success");
      // Reset form
      setNewTitle("");
      setNewDescription("");
      setNewDueTime("");
      setIsAddFormOpen(false);
    }
  };

  // Mark task as Done (locked — irreversible in UI)
  const handleMarkDone = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "done",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user!.id);

    if (error) {
      console.error("Mark done failed:", error.message);
      showToast("Failed to mark as done", "error");
    } else {
      showToast("Task marked as done ✓", "success");
    }
  };

  // Open partial modal for a task
  const openPartialModal = (taskId: string) => {
    setPartialTargetTaskId(taskId);
    setPartialModalOpen(true);
  };

  // Mark task as Partial with optional reason (called by modal)
  const handleMarkPartial = async (reason: string | null) => {
    if (!partialTargetTaskId) return;
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "partial",
        partial_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", partialTargetTaskId)
      .eq("user_id", user!.id);

    if (error) {
      console.error("Mark partial failed:", error.message);
      showToast("Failed to mark as partial", "error");
    } else {
      showToast("Task marked as partial", "success");
    }
    setPartialTargetTaskId(null);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      showToast("Failed to delete task", "error");
    } else {
      showToast("Task deleted ✓", "success");
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const subjectColors: Record<string, string> = {
    Math: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Science: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    English: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    History: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Other: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };

  if (sessionLoading) {
    return (
      <NavigationWrapper>
        <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto relative min-h-screen animate-pulse">
          {/* Header toolbar skeleton */}
          <header className="flex justify-between items-center z-20">
            <div>
              <div className="h-8 w-48 bg-white/10 rounded-xl mb-2" />
              <div className="h-3 w-36 bg-emerald-500/20 rounded-md" />
            </div>
          </header>

          {/* Calendar Grid Container skeleton */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Grid skeleton */}
            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-xl">
              {/* Month Navigation skeleton */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-7 w-40 bg-white/10 rounded-xl" />
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-white/5 rounded-xl" />
                  <div className="h-9 w-9 bg-white/5 rounded-xl" />
                </div>
              </div>

              {/* Statistics strip skeleton */}
              <div className="flex gap-4 p-3 bg-white/[0.03] border border-white/[0.04] rounded-2xl mb-6 justify-around">
                <div className="h-4 w-16 bg-white/10 rounded-lg" />
                <div className="h-4 w-16 bg-white/10 rounded-lg" />
                <div className="h-4 w-16 bg-white/10 rounded-lg" />
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-2 text-center">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="flex justify-center py-2">
                    <div className="h-3 w-8 bg-white/5 rounded" />
                  </div>
                ))}
              </div>

              {/* Calendar Cells 7x5 grid */}
              <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
                {Array.from({ length: 35 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square w-[44px] h-[44px] md:w-[64px] md:h-[64px] bg-white/5 border border-white/[0.03] rounded-xl mx-auto"
                  />
                ))}
              </div>
            </div>

            {/* Right Side Panel skeleton */}
            <div className="w-full lg:w-96 flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl shrink-0">
              <div className="border-b border-white/5 pb-4 space-y-2">
                <div className="h-6 w-32 bg-white/10 rounded-lg" />
                <div className="h-3.5 w-48 bg-white/5 rounded-md" />
              </div>

              {/* Task list container skeleton */}
              <div className="flex-1 space-y-3 py-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="h-4.5 w-14 bg-white/10 rounded-full" />
                      <div className="h-4.5 w-20 bg-white/10 rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-4.5 w-3/4 bg-white/10 rounded" />
                      <div className="h-3.5 w-5/6 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task Button skeleton */}
              <div className="h-10 w-full bg-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </NavigationWrapper>
    );
  }

  return (
    <NavigationWrapper>
      <div className="p-4 md:p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto relative min-h-screen">
        {/* Header toolbar */}
        <header className="flex justify-between items-center z-20">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Calendar Planner
            </h1>
            <p className="text-[11px] text-[#00D4AA] tracking-wider font-semibold uppercase mt-0.5">
              Organize your academic routine
            </p>
          </div>
        </header>

        {/* Calendar Grid Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Grid */}
          <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-xl overflow-y-auto">
            {/* Month & Arrow Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#00D4AA]" />
                {currentDate.toLocaleString("default", { month: "long" })} {year}
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Summary statistics strip */}
            <div className="flex gap-4 p-3 bg-white/[0.03] border border-white/[0.04] rounded-2xl mb-6 text-xs justify-around">
              <span className="flex items-center gap-1.5 text-[#00D4AA] font-semibold">
                <CheckCircle2 className="h-4 w-4" /> {stats.done} Done
              </span>
              <span className="flex items-center gap-1.5 text-[#FFB347] font-semibold">
                <AlertTriangle className="h-4 w-4" /> {stats.partial} Partial
              </span>
              <span className="flex items-center gap-1.5 text-[#FF4D6D] font-semibold">
                <AlertCircle className="h-4 w-4" /> {stats.missed} Missed
              </span>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-2 text-center text-xs font-semibold text-white/40 min-w-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 truncate">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 min-w-0">
              {/* Empty offsets */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`offset-${idx}`} className="w-full aspect-square min-w-0" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDate = new Date(year, month, dayNum);
                const status = getDayStatus(cellDate);
                const todayCheck = isToday(cellDate);

                // Colors from specification
                const statusColors = {
                  RED: "bg-[#FF4D6D]/15 text-[#FF4D6D] hover:bg-[#FF4D6D]/25 border border-[#FF4D6D]/30",
                  GREEN: "bg-[#00D4AA]/15 text-[#00D4AA] hover:bg-[#00D4AA]/25 border border-[#00D4AA]/30",
                  AMBER: "bg-[#FFB347]/15 text-[#FFB347] hover:bg-[#FFB347]/25 border border-[#FFB347]/30",
                  GREY: "bg-[#2A3042]/40 text-white/50 hover:bg-[#2A3042]/70 border border-white/5",
                };

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => {
                      setSelectedDate(cellDate);
                      setIsPanelOpen(true);
                    }}
                    className={`w-full aspect-square relative flex items-center justify-center font-bold transition-all rounded-xl cursor-pointer min-w-0 gap-1
                      text-xs md:text-sm
                      ${statusColors[status]}
                      ${todayCheck ? "ring-2 ring-[#00D4AA] ring-offset-2 ring-offset-[#0A0F1E] z-10" : ""}
                    `}
                  >
                    <span>{dayNum}</span>
                    
                    {/* Floating little dot count if tasks exist */}
                    {getTasksForDate(cellDate).length > 0 && (
                      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-white/60 md:h-2 md:w-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side Panel */}
          {selectedDate && (
            <div className={`w-full lg:w-96 flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl shrink-0 z-20 ${
              isPanelOpen ? "flex" : "hidden lg:flex"
            }`}>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedDate.toLocaleDateString("default", { 
                      weekday: "short", 
                      month: "short", 
                      day: "numeric" 
                    })}
                  </h3>
                  <p className="text-xs text-white/40">Tasks scheduled for today</p>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Task list container */}
              <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[400px] flex flex-col gap-3 py-2">
                {getTasksForDate(selectedDate).length > 0 ? (
                  getTasksForDate(selectedDate).map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2.5 transition-all hover:bg-white/[0.05]"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${subjectColors[task.subject] || subjectColors.Other}`}>
                          {task.subject}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${priorityColors[task.priority]}`}>
                          {task.priority} Priority
                        </span>
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold text-white ${task.status === "done" ? "line-through text-white/40" : ""}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">{task.description}</p>
                        )}
                      </div>

                      {task.due_time && (
                        <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-semibold uppercase tracking-wider">
                          <Clock className="h-3 w-3 text-[#00D4AA]" />
                          Due {task.due_time.substring(0, 5)}
                        </div>
                      )}

                      {task.note && (
                        <div className="p-2 rounded-lg bg-black/20 border border-white/[0.03] text-[10px] text-white/40 italic">
                          Note: {task.note}
                        </div>
                      )}

                      {/* ── Action buttons — status-aware ── */}
                      <div className="flex gap-1.5 pt-1.5 border-t border-white/[0.04] mt-1.5">

                        {/* DONE — fully locked */}
                        {task.status === "done" && (
                          <span
                            className="flex items-center justify-center gap-1.5 font-bold text-[13px] px-4 w-full"
                            style={{
                              height: "34px",
                              borderRadius: "999px",
                              background: "rgba(0,212,170,0.15)",
                              border: "1px solid #00D4AA",
                              color: "#00D4AA",
                            }}
                          >
                            ✅ Completed
                          </span>
                        )}

                        {/* PARTIAL — locked with amber badge */}
                        {task.status === "partial" && (
                          <span
                            className="flex items-center justify-center gap-1.5 font-bold text-[13px] px-4 w-full"
                            style={{
                              height: "34px",
                              borderRadius: "999px",
                              background: "rgba(255,179,71,0.15)",
                              border: "1px solid #FFB347",
                              color: "#FFB347",
                            }}
                          >
                            ⚠️ Partial
                          </span>
                        )}

                        {/* PENDING or MISSED — show all three action buttons */}
                        {(task.status === "pending" || task.status === "missed") && (
                          <>
                            <button
                              onClick={() => handleMarkDone(task.id)}
                              className="flex-1 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer bg-[#00D4AA]/10 text-[#00D4AA] hover:bg-[#00D4AA]/20 border border-[#00D4AA]/20"
                            >
                              <Check className="h-3 w-3" /> Done
                            </button>

                            <button
                              onClick={() => openPartialModal(task.id)}
                              className="flex-1 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer bg-[#FFB347]/10 text-[#FFB347] hover:bg-[#FFB347]/20 border border-[#FFB347]/20"
                            >
                              <AlertTriangle className="h-3 w-3" /> Partial
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-[#FF4D6D] flex items-center justify-center cursor-pointer transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-white/30">
                    <CalendarIcon className="h-10 w-10 text-white/10 mb-2" />
                    <p className="text-xs">No tasks listed for this date</p>
                  </div>
                )}
              </div>

              {/* Add Task Button inside sheet */}
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-[#00D4AA]/10"
              >
                <Plus className="h-4 w-4 stroke-[3]" /> Add Task
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Form Sheet Modal */}
        {isAddFormOpen && selectedDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0A0F1E] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">Add Task</h3>
                  <p className="text-[11px] text-[#00D4AA] font-semibold mt-0.5">
                    Plan for {selectedDate.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white text-white/60 cursor-pointer transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form fields */}
              <form onSubmit={handleAddTask} className="p-5 flex flex-col gap-4">
                {/* Task Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/15 focus:outline-none transition-all duration-300"
                  />
                </div>

                {/* Due Date & Time */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/15 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={newDueTime}
                      onChange={(e) => setNewDueTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/15 focus:outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Notes / Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider">
                    Notes / Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add details, links, or notes..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/15 focus:outline-none transition-all duration-300 resize-none h-24"
                  />
                </div>

                {/* Create Task Button */}
                <button
                  type="submit"
                  disabled={addingTask}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase mt-2 hover:scale-[1.01] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-[#00D4AA]/10 flex items-center justify-center gap-2"
                >
                  {addingTask ? "Creating..." : "Create Task"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Partial Reason Modal */}
      <PartialReasonModal
        isOpen={partialModalOpen}
        onClose={() => {
          setPartialModalOpen(false);
          setPartialTargetTaskId(null);
        }}
        onSubmit={handleMarkPartial}
      />
    </NavigationWrapper>
  );
}
