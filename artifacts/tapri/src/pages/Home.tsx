import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, Hourglass, Thermometer, BarChart2, 
  Sun, Moon, Plus, CheckCircle2, Circle, Trash2, 
  Menu, X, Heart
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";
import { Steam } from "@/components/Steam";
import { ProgressRing } from "@/components/ProgressRing";

// --- Types ---
type Goal = { id: string; text: string; done: boolean };
type Mode = "decoction" | "steep" | "infusion" | "counter";

const MODES: Record<Mode, { name: string; duration: number; icon: React.ElementType; desc: string }> = {
  decoction: { name: "Decoction", duration: 25 * 60, icon: Coffee, desc: "Deep focus ritual. Brew your best work." },
  steep: { name: "Steep", duration: 5 * 60, icon: Hourglass, desc: "Brief steep. Let your mind breathe." },
  infusion: { name: "Infusion", duration: 15 * 60, icon: Thermometer, desc: "Gentle infusion ritual. Rest deeply." },
  counter: { name: "Counter", duration: 0, icon: BarChart2, desc: "Open-ended session. Flow without limits." }
};

export default function Home() {
  // --- State ---
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("tapri_theme", "dark");
  const [goals, setGoals] = useLocalStorage<Goal[]>("tapri_goals", []);
  
  const [activeMode, setActiveMode] = useState<Mode>("decoction");
  const [timeLeft, setTimeLeft] = useState(MODES.decoction.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [now, setNow] = useState(new Date());
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const { playChime } = useAudio();

  // --- Effects ---
  
  // Theme effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Live clock
  useEffect(() => {
    const clockInt = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockInt);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      const tick = () => {
        if (!endTimeRef.current) return;
        
        const currentMs = Date.now();
        
        if (activeMode === "counter") {
          // Count up
          const elapsed = Math.floor((currentMs - endTimeRef.current) / 1000);
          setTimeLeft(elapsed);
        } else {
          // Count down
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - currentMs) / 1000));
          setTimeLeft(remaining);
          
          if (remaining <= 0) {
            setIsRunning(false);
            playChime();
          }
        }
      };

      timerRef.current = window.setInterval(tick, 200); // 200ms for smooth updates
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, activeMode, playChime]);

  // --- Handlers ---
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  
  const handleModeSwitch = (mode: Mode) => {
    setActiveMode(mode);
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
    endTimeRef.current = null;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (activeMode === "counter") {
        // Start counting up from current timeLeft
        endTimeRef.current = Date.now() - (timeLeft * 1000);
      } else {
        // Start counting down
        if (timeLeft <= 0) {
          setTimeLeft(MODES[activeMode].duration);
          endTimeRef.current = Date.now() + (MODES[activeMode].duration * 1000);
        } else {
          endTimeRef.current = Date.now() + (timeLeft * 1000);
        }
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[activeMode].duration);
    endTimeRef.current = null;
  };

  // Goal handlers
  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals(prev => [{ id: Math.random().toString(36).substring(7), text: newGoalText.trim(), done: false }, ...prev]);
    setNewGoalText("");
    setIsAddingGoal(false);
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // --- Formatting ---
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (activeMode === "counter") return 100; // Full ring for counter
    const total = MODES[activeMode].duration;
    if (total === 0) return 0;
    return (timeLeft / total) * 100;
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 bg-background/60 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="font-serif text-2xl font-bold tracking-wide text-foreground">
            tapri<span className="text-primary">.dev</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{format(now, "hh:mm:ss a")}</span>
            <span className="text-xs text-muted-foreground">{format(now, "EEEE | dd MMM ''yy")}</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-foreground/5 text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 pt-16">
        
        {/* SIDEBAR */}
        <aside className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-card-border transform transition-transform duration-300 ease-in-out flex flex-col pt-16 md:pt-4 shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-6 flex-1 overflow-y-auto">
            
            {/* Auth Placeholder */}
            <div className="mb-8">
              <div className="flex gap-3 mb-2">
                <button className="flex-1 py-2 text-sm font-medium rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors">Sign Up</button>
                <button className="flex-1 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-foreground/5 transition-colors">Login</button>
              </div>
              <p className="text-xs text-center text-muted-foreground">Login to sync across devices</p>
            </div>

            {/* Focus / Goals */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Today's Focus</h2>
              </div>
              <button 
                onClick={() => setIsAddingGoal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 mb-3 text-sm text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/40 rounded-lg transition-colors"
              >
                <Plus size={14} />
                <span>+ Add Goal</span>
              </button>

              {isAddingGoal && (
                <form onSubmit={addGoal} className="mb-3">
                  <input
                    type="text"
                    autoFocus
                    placeholder="What will you brew?"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onBlur={() => { if(!newGoalText) setIsAddingGoal(false) }}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                  />
                </form>
              )}

              <ul className="space-y-2">
                <AnimatePresence>
                  {goals.map(goal => (
                    <motion.li 
                      key={goal.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-foreground/5 transition-colors"
                    >
                      <button 
                        onClick={() => toggleGoal(goal.id)}
                        className="mt-0.5 text-muted-foreground hover:text-primary shrink-0 transition-colors"
                      >
                        {goal.done ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} />}
                      </button>
                      <span className={cn(
                        "text-sm flex-1 break-words transition-all duration-300",
                        goal.done ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {goal.text}
                      </span>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {goals.length === 0 && !isAddingGoal && (
                  <li className="text-sm text-muted-foreground italic text-center py-4">No focus set for today.</li>
                )}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Rituals</h2>
              <ul className="space-y-1">
                {(Object.keys(MODES) as Mode[]).map((key) => {
                  const mode = MODES[key];
                  const Icon = mode.icon;
                  return (
                    <li key={key}>
                      <button 
                        onClick={() => { handleModeSwitch(key); setSidebarOpen(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          activeMode === key 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        )}
                      >
                        <Icon size={16} />
                        {mode.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN AREA */}
        <main className="flex-1 relative flex flex-col bg-cozy-room">
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
            
            {/* Timer Card */}
            <div className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-lg relative flex flex-col items-center">
              
              {/* Tabs */}
              <div className="flex w-full justify-between sm:justify-center sm:gap-6 mb-12 relative z-10">
                {(Object.keys(MODES) as Mode[]).map((key) => {
                  const mode = MODES[key];
                  const Icon = mode.icon;
                  const isActive = activeMode === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleModeSwitch(key)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-2 sm:px-4 rounded-xl transition-all duration-300",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      )}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-xs font-medium hidden sm:block">{mode.name}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute -bottom-2 left-1/4 right-1/4 h-1 bg-primary rounded-t-md"
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Timer Display Area */}
              <div className="relative mb-12 flex justify-center items-center">
                
                {/* Steam behind the numbers */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-0 opacity-80 mix-blend-screen">
                  <Steam active={isRunning} />
                </div>

                {/* Progress Ring */}
                <ProgressRing 
                  progress={getProgress()} 
                  size={280} 
                  strokeWidth={6}
                  className="absolute z-0 scale-75 sm:scale-100" 
                />

                {/* Digits */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="font-mono text-6xl sm:text-7xl md:text-8xl font-medium tracking-tighter text-foreground drop-shadow-md">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-8 mt-2 opacity-50 uppercase tracking-widest text-[10px] sm:text-xs font-bold font-sans">
                    {timeLeft >= 3600 && <span>HR</span>}
                    <span>MIN</span>
                    <span>SEC</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-center text-sm text-muted-foreground mb-10 h-6">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeMode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="block"
                  >
                    {MODES[activeMode].desc}
                  </motion.span>
                </AnimatePresence>
              </p>

              {/* Controls */}
              <div className="flex flex-col items-center gap-4 w-full">
                <button
                  onClick={toggleTimer}
                  className={cn(
                    "w-full sm:w-64 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 transform active:scale-95 shadow-lg",
                    isRunning 
                      ? "bg-transparent border-2 border-primary text-primary hover:bg-primary/5" 
                      : "bg-primary text-primary-foreground hover:bg-primary-hover shadow-glow hover:shadow-primary/30"
                  )}
                >
                  {isRunning ? "PAUSE RITUAL" : "START RITUAL"}
                </button>
                
                <button 
                  onClick={resetTimer}
                  className={cn(
                    "text-sm font-medium text-muted-foreground hover:text-foreground transition-all",
                    (!isRunning && timeLeft === MODES[activeMode].duration && activeMode !== "counter") || (!isRunning && timeLeft === 0 && activeMode === "counter")
                      ? "opacity-0 pointer-events-none" 
                      : "opacity-100"
                  )}
                >
                  Reset
                </button>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <footer className="relative z-20 py-6 px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground border-t border-border/50 bg-background/30 backdrop-blur-sm mt-auto">
            <p className="mb-4 sm:mb-0">© 2026 Tapri.dev Corp. Brewed with care.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Community</a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                Blog <Heart size={10} className="text-primary" />
              </a>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
