import React, { useState, useEffect, useRef } from 'react';
import { Exercise, SetLog } from '../types';
import { Bot, ChevronDown, ChevronLeft, ChevronRight, Check, Plus, Undo2, Ban, Timer, Zap } from 'lucide-react';

interface Props {
  exercise: Exercise;
  initialSets: SetLog[];
  recommendation: {
    recommendedWeight: number;
    coachNote: string;
    status: 'increase' | 'maintain' | 'deload' | 'calibration';
  };
  onUpdate: (sets: SetLog[]) => void;
  onSkip: () => void;
  onExit: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  // New props for the main action button
  onComplete?: () => void;
  actionLabel?: React.ReactNode;
  
  canPrev?: boolean;
  canNext?: boolean;
  theme?: 'default' | 'amber';
}

const ExerciseLogger: React.FC<Props> = ({ 
  exercise, 
  initialSets, 
  recommendation, 
  onUpdate, 
  onSkip, 
  onExit,
  onPrev,
  onNext,
  onComplete,
  actionLabel = "Next Exercise",
  canPrev,
  canNext,
  theme = 'default' 
}) => {
  const [sets, setSets] = useState<SetLog[]>(initialSets);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Standardized on Blue (Minimalist Theme)
  const primaryColor = 'text-blue-500';
  const primaryBg = 'bg-blue-500';
  const primaryBorder = 'border-blue-500';

  useEffect(() => {
    // If no sets exist, populate defaults
    if (initialSets.length === 0 && exercise.defaultSets > 0) {
      const defaults: SetLog[] = Array.from({ length: exercise.defaultSets }).map((_, i) => ({
        id: crypto.randomUUID(),
        setNumber: i + 1,
        weight: recommendation.recommendedWeight, 
        reps: '', 
        targetReps: parseInt(exercise.defaultReps.split('-')[1] || exercise.defaultReps.split('x')[0]) || 10,
        completed: false,
        isDropSet: false,
      }));
      setSets(defaults);
      onUpdate(defaults);
    } else {
      setSets(initialSets);
    }
  }, [exercise.id, initialSets.length]); // Re-run when exercise changes

  // Auto-scroll to active set
  useEffect(() => {
    // Optional: add smooth scroll logic here if needed
  }, [sets]);

  const updateSet = (id: string, field: keyof SetLog, value: number | string | boolean) => {
    const newSets = sets.map(s => s.id === id ? { ...s, [field]: value } : s);
    setSets(newSets);
    onUpdate(newSets);
  };

  const toggleComplete = (id: string) => {
    const s = sets.find(x => x.id === id);
    if(s) {
      updateSet(id, 'completed', !s.completed);
    }
  };

  const addDropSet = (parentId: string) => {
    const parentIndex = sets.findIndex(s => s.id === parentId);
    if (parentIndex === -1) return;
    const parentSet = sets[parentIndex];
    const newDropSet: SetLog = {
      id: crypto.randomUUID(),
      setNumber: parentSet.setNumber,
      weight: Math.max(0, Math.round((parentSet.weight - (parentSet.weight * 0.2)) / 5) * 5),
      reps: '',
      targetReps: parentSet.targetReps,
      completed: false,
      isDropSet: true,
      parentSetId: parentId
    };
    const newSets = [...sets];
    newSets.splice(parentIndex + 1, 0, newDropSet);
    setSets(newSets);
    onUpdate(newSets);
  };

  const addStandardSet = () => {
    // FIX: Look for the last STANDARD set to copy weight from.
    // If the last set was a drop set, we don't want to copy that light weight for a new standard set.
    const lastStandardSet = [...sets].reverse().find(s => !s.isDropSet);
    const lastSetNumber = sets[sets.length - 1]?.setNumber || 0;
    
    const newSet: SetLog = {
        id: crypto.randomUUID(),
        setNumber: lastSetNumber + 1,
        weight: lastStandardSet?.weight || recommendation.recommendedWeight,
        reps: '',
        targetReps: lastStandardSet?.targetReps || 10,
        completed: false,
        isDropSet: false
    };
    const newSets = [...sets, newSet];
    setSets(newSets);
    onUpdate(newSets);
  };

  const handleUndo = () => {
    // Logic: Remove the *Active* set if it's an "Added" set (Drop set or Extra Standard set)
    // Otherwise, just clear the input values.
    
    const activeIndex = sets.findIndex(s => !s.completed);
    
    // CASE 1: All sets marked complete.
    // If we have more than default sets, assume user added one and wants to remove it.
    if (activeIndex === -1) {
        if (sets.length > exercise.defaultSets) {
            const newSets = [...sets];
            newSets.pop();
            setSets(newSets);
            onUpdate(newSets);
            return;
        } else {
             // If only default sets remain and all complete, uncheck the last one
             const lastIndex = sets.length - 1;
             updateSet(sets[lastIndex].id, 'completed', false);
             return;
        }
    }

    // CASE 2: Active Set exists
    if (activeIndex !== -1) {
        const activeSet = sets[activeIndex];
        
        // If it's a Drop Set OR if it's a Standard Set beyond the defaults
        // We delete it entirely.
        if (activeSet.isDropSet || sets.length > exercise.defaultSets) {
            const newSets = sets.filter(s => s.id !== activeSet.id);
            setSets(newSets);
            onUpdate(newSets);
        } else {
            // It's a default/required set, just clear the values
            const newSets = [...sets];
            newSets[activeIndex] = {
                ...newSets[activeIndex],
                weight: recommendation.recommendedWeight,
                reps: ''
            };
            setSets(newSets);
            onUpdate(newSets);
        }
    }
  };

  const activeSetId = sets.find(s => !s.completed)?.id;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f0f4f8] dark:bg-[#0b1120] text-white font-sans">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-[#0b1120]/95 backdrop-blur-md border-b border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#1e293b]">
             {/* Fake Progress Line */}
             <div className={`h-full w-1/3 ${primaryBg} shadow-[0_0_15px_#3b82f6] transition-all duration-500 ease-out`}></div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 pt-4">
            <button 
                onClick={onExit}
                className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
                <ChevronDown size={24} />
            </button>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e293b] rounded-full border border-white/5 shadow-sm">
                <Timer size={18} className={`${primaryColor} animate-pulse`} />
                <span className="text-base font-mono font-medium text-slate-200 tracking-wide">00:00</span>
            </div>
            {/* Small skip button removed from header as requested, moved to footer */}
            <div className="w-10"></div>
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      {/* Added pb-40 to ensure content clears the tall footer */}
      <div className="flex-1 overflow-y-auto pb-40">
          
          {/* Exercise Title & Navigation */}
          <div className="flex flex-col items-center px-6 pt-6 pb-2">
            <div className="w-full flex items-center justify-between mb-2">
                <button 
                    onClick={onPrev}
                    disabled={!canPrev}
                    className={`p-3 -ml-2 transition-colors active:scale-90 ${!canPrev ? 'text-slate-800 cursor-not-allowed' : 'text-slate-500 hover:text-white'}`}
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-1">Current Exercise</span>
                    <h1 className="text-2xl font-bold text-white tracking-tight text-center">{exercise.name}</h1>
                </div>
                <button 
                    onClick={onNext}
                    disabled={!canNext}
                    className={`p-3 -mr-2 transition-colors active:scale-90 rounded-full ${!canNext ? 'text-slate-800 cursor-not-allowed' : `${primaryColor} hover:text-white shadow-[0_0_15px_rgba(59,130,246,0)] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]`}`}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
            <div className="w-full mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3 p-3 bg-[#1e293b]/40 rounded-xl border border-white/5">
                    <Bot size={18} className={`${primaryColor} shrink-0 mt-0.5`} />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        <span className={`${primaryColor} font-bold`}>Coach Note:</span> {recommendation.coachNote}
                    </p>
                </div>
            </div>
          </div>

          {/* Logger Grid */}
          <div className="px-4 mt-4 space-y-1">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-3 px-2 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center select-none">
                  <div className="col-span-1 pt-1">#</div>
                  <div className="col-span-3 pt-1 text-left pl-1">History</div>
                  <div className="col-span-3 pt-1">Lbs</div>
                  <div className="col-span-3 pt-1">Reps</div>
                  <div className="col-span-2"></div>
              </div>

              {/* Sets */}
              {sets.map((set, index) => {
                  const isActive = set.id === activeSetId;
                  const isCompleted = set.completed;
                  const isDropSet = set.isDropSet;

                  // Render Completed Set
                  if (isCompleted && !isActive) {
                    return (
                        <div key={set.id} className={`group grid grid-cols-12 gap-3 items-center ${isDropSet ? 'bg-[#1e293b]/20 border-l-2 border-blue-500/30 pl-3 ml-4 rounded-r-2xl mb-2' : 'bg-[#1e293b]/30 rounded-2xl'} p-3 border border-transparent transition-all`}>
                            <div className={`col-span-1 text-center font-bold ${isDropSet ? 'text-blue-500 text-xs' : 'text-slate-500'}`}>
                                {isDropSet ? 'DS' : set.setNumber}
                            </div>
                            <div className="col-span-3 flex flex-col items-start justify-center">
                                <span className="text-xs text-slate-500 font-medium">{isDropSet ? 'Metabolic' : 'Previous'}</span>
                            </div>
                            <div className="col-span-3 text-center">
                                <span className="text-lg font-bold text-slate-400">{set.weight}</span>
                            </div>
                            <div className="col-span-3 text-center">
                                <span className="text-lg font-bold text-slate-400">{set.reps}</span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <div className={`h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-white/5`}>
                                    <Check size={16} />
                                </div>
                            </div>
                        </div>
                    );
                  }

                  // Render Active Set (The Big Card)
                  if (isActive) {
                      return (
                        <div key={set.id} className={`relative grid grid-cols-12 gap-3 items-center p-4 rounded-2xl border shadow-[0_4px_20px_rgba(59,130,246,0.15)] my-2 z-10 
                            ${isDropSet ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#0b1120] border-blue-500'}`}>
                            
                            {/* Drop Set Visual Badge */}
                            {isDropSet && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 z-20">
                                    <Zap size={10} fill="currentColor" />
                                    Metabolic Drop Set
                                </div>
                            )}

                            <div className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 ${primaryBg} rounded-r-full shadow-[0_0_8px_#3b82f6]`}></div>
                            <div className={`col-span-1 text-center font-black ${primaryColor} text-xl`}>
                                {isDropSet ? 'DS' : set.setNumber}
                            </div>
                            <div className="col-span-3 flex flex-col justify-center text-left">
                                <span className="text-[11px] text-slate-400 font-medium">Target</span>
                                <span className={`text-[9px] font-bold ${primaryColor} mt-0.5`}>{recommendation.recommendedWeight}lbs</span>
                            </div>
                            <div className="col-span-3">
                                <input 
                                    className={`w-full bg-[#1e293b] text-center text-white font-bold text-2xl py-3 rounded-xl border border-white/10 focus:${primaryBorder} focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-white/20 shadow-inner`}
                                    inputMode="decimal"
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => updateSet(set.id, 'weight', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="col-span-3">
                                <input 
                                    className={`w-full bg-[#1e293b] text-center text-white font-bold text-2xl py-3 rounded-xl border border-white/10 focus:${primaryBorder} focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-white/20 shadow-inner`}
                                    inputMode="decimal"
                                    placeholder="-"
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => updateSet(set.id, 'reps', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <button 
                                    onClick={() => toggleComplete(set.id)}
                                    className={`h-12 w-12 rounded-xl bg-[#1e293b] border border-white/10 hover:${primaryBg} hover:${primaryBorder} hover:text-white text-slate-500 transition-all flex items-center justify-center active:scale-95 shadow-lg`}
                                >
                                    <Check size={24} />
                                </button>
                            </div>
                            
                            {!isDropSet && (
                                <div className="col-span-12 flex justify-end pt-1 pb-1">
                                    <button 
                                        onClick={() => addDropSet(set.id)}
                                        className="group flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-all active:scale-95"
                                    >
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Plus size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold tracking-widest">SPLIT / DROP SET</span>
                                    </button>
                                </div>
                            )}
                        </div>
                      );
                  }

                  // Render Pending/Future Set
                  return (
                    <div key={set.id} className="grid grid-cols-12 gap-3 items-center bg-transparent p-3 rounded-2xl border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                        <div className="col-span-1 text-center font-bold text-slate-600">{set.setNumber}</div>
                        <div className="col-span-3 text-xs text-slate-500 text-left font-medium">Pending</div>
                        <div className="col-span-3 text-center text-slate-600 font-bold text-xl">-</div>
                        <div className="col-span-3 text-center text-slate-600 font-bold text-xl">-</div>
                        <div className="col-span-2"></div>
                    </div>
                  );
              })}

              <button 
                onClick={addStandardSet}
                className="w-full py-4 mt-2 rounded-2xl border border-dashed border-white/10 text-xs font-bold text-slate-500 hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                Add Standard Set
              </button>
          </div>
      </div>

      {/* Footer Controls - Fixed to Bottom */}
      {/* Redesigned to have Main Action between Reset and Skip */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0b1120]/90 backdrop-blur-lg border-t border-white/5 p-4 z-30 pb-safe">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
            
            {/* Undo (Previously Reset) */}
            <button 
                onClick={handleUndo}
                className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#1e293b] text-slate-500 hover:text-white border border-white/5 active:scale-95 transition-all"
                title="Undo last action"
            >
                <Undo2 size={20} />
            </button>

            {/* Main Action (Next/Finish) */}
            <button 
                onClick={onComplete}
                className="flex-1 h-14 bg-blue-600 text-white font-bold rounded-2xl text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {actionLabel}
                <Check size={20} strokeWidth={3} />
            </button>

            {/* Skip */}
            <button 
                onClick={onSkip} 
                className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-[#1e293b] text-slate-500 hover:text-red-400 border border-white/5 active:scale-95 transition-all"
                title="Skip this exercise"
            >
                <Ban size={20} />
            </button>
        </div>
      </div>

    </div>
  );
};

export default ExerciseLogger;