import React, { useState } from 'react';
import { WorkoutSession } from '../types';
import { getWeeklyConsistency, getTotalVolumeData, getRecentPRs, calculateProgression } from '../utils/progression';
import { Bot, X, ArrowUp, Dumbbell, Calendar, PenTool, Timer, TrendingUp, ChevronDown, Trophy, BarChart, Share, Settings, Play } from 'lucide-react';
import { WORKOUT_A, WORKOUT_B } from '../constants';

interface Props {
  history: WorkoutSession[];
  onStartWorkout: (routineId: 'A' | 'B' | 'Finisher' | 'Warmup') => void;
  onViewExercise: (exerciseId: string) => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<Props> = ({ history, onStartWorkout, onViewExercise, onViewHistory }) => {
  const [showInsight, setShowInsight] = useState(true);
  const consistency = getWeeklyConsistency(history);
  const volumeData = getTotalVolumeData(history);
  const allExercises = [...WORKOUT_A.exercises, ...WORKOUT_B.exercises];
  const lastSession = history[history.length - 1];

  // Logic to suggest next workout (Toggle A/B)
  const lastRoutineId = lastSession?.routineId;
  const suggestedRoutine = lastRoutineId === 'A' ? 'B' : 'A';

  // Calculate Weekly Goal
  const workoutsThisWeek = consistency.filter(d => d.active).length;
  const weeklyTarget = 4;
  const progressPercent = Math.min((workoutsThisWeek / weeklyTarget) * 100, 100);

  const getExerciseStatus = (exerciseId: string) => {
    const progression = calculateProgression(exerciseId, history);
    const lastSession = [...history]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .find(s => s.logs.some(l => l.exerciseId === exerciseId));
    const lastLog = lastSession?.logs.find(l => l.exerciseId === exerciseId);
    const currentMax = lastLog ? Math.max(...lastLog.sets.map(s => s.weight || 0)) : 0;
    
    // Check sets completed
    const setsCompleted = lastLog?.sets.filter(s => s.completed).length || 0;
    const totalSets = lastLog?.sets.length || 3;

    return { 
        currentMax, 
        status: progression.status,
        targetWeight: progression.recommendedWeight,
        setsInfo: `${setsCompleted}/${totalSets} sets completed`
    };
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "spine_sparing_backup_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-12 bg-[#0b1120] text-white font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-safe pb-4 mt-4">
        <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-blue-300 uppercase tracking-wide">{dateString}</span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Good Morning</h1>
        </div>
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-transparent ring-2 ring-blue-500/20 bg-slate-800 flex items-center justify-center">
             <span className="text-xl font-bold text-blue-500">{suggestedRoutine}</span>
        </div>
      </header>

      {/* Insight Card */}
      {lastSession?.feedback && showInsight && (
        <div className="px-6 pb-2 animate-in fade-in slide-in-from-top-2">
            <div className="group relative overflow-hidden rounded-lg bg-[#1e293b] border border-blue-500/20 p-4 pr-10 shadow-sm">
                <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                        <Bot size={18} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-blue-500">AI Coach Insight</p>
                        <p className="text-sm font-medium text-blue-200/90 leading-snug">
                            {lastSession.feedback.replace(/\*\*/g, '').split('\n').slice(0, 3).join(' ')}...
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowInsight(false)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
      )}

      {/* Hero Volume */}
      <div className="mt-4 flex flex-col items-center justify-center py-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300/50">Total Volume</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h2 className="text-7xl font-extrabold tracking-tighter text-white leading-none">
                     {volumeData.volume > 1000 ? `${(volumeData.volume / 1000).toFixed(1)}k` : volumeData.volume}
                </h2>
            </div>
            {volumeData.trend !== 0 && (
                <div className="mt-3 flex items-center gap-1.5 rounded-full bg-blue-500/10 pl-2 pr-3 py-1 text-sm font-bold text-blue-500">
                    <ArrowUp size={16} className={volumeData.trend < 0 ? "rotate-180" : ""} />
                    <span>{Math.abs(volumeData.trend)}%</span>
                </div>
            )}
      </div>

      {/* Progress Bar */}
      <div className="px-8 py-6">
            <div className="mb-3 flex items-end justify-between">
                <span className="text-sm font-semibold text-white">Weekly Goal</span>
                <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{workoutsThisWeek}/{weeklyTarget} Workouts</span>
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                    className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
      </div>

      {/* 2x2 Grid Actions */}
      <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => onStartWorkout('A')}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-6 transition-all active:scale-95 border border-white/5 hover:border-blue-500/30 hover:bg-white/10"
                >
                    {suggestedRoutine === 'A' && (
                        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></div>
                    )}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-110
                        ${suggestedRoutine === 'A' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-[#1e293b] text-slate-300 border border-white/10'}
                    `}>
                        <Dumbbell size={28} />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${suggestedRoutine === 'A' ? 'text-white' : 'text-slate-300'}`}>Workout A</span>
                </button>

                <button 
                    onClick={() => onStartWorkout('B')}
                    className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-6 transition-all active:scale-95 border border-white/5 hover:border-blue-500/30 hover:bg-white/10"
                >
                    {suggestedRoutine === 'B' && (
                        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></div>
                    )}
                     <div className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-110
                        ${suggestedRoutine === 'B' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-[#1e293b] text-slate-300 border border-white/10'}
                    `}>
                        <Dumbbell size={24} />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${suggestedRoutine === 'B' ? 'text-white' : 'text-slate-300'}`}>Workout B</span>
                </button>

                <button 
                    onClick={() => onStartWorkout('Finisher')}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-6 transition-all active:scale-95 border border-white/5 hover:border-blue-500/30 hover:bg-white/10"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e293b] border border-white/10 text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors duration-300">
                        <TrendingUp size={24} />
                    </div>
                    <span className="text-sm font-semibold tracking-wide text-slate-300 group-hover:text-white">Finisher</span>
                </button>

                <button 
                    onClick={() => onStartWorkout('Warmup')}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-6 transition-all active:scale-95 border border-white/5 hover:border-blue-500/30 hover:bg-white/10"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e293b] border border-white/10 text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors duration-300">
                        <Timer size={24} />
                    </div>
                    <span className="text-sm font-semibold tracking-wide text-slate-300 group-hover:text-white">Warm-Up</span>
                </button>
            </div>
      </div>

      {/* Accordions */}
      <div className="flex flex-col gap-2 px-6 py-6 pb-24">
         {/* Progression Updates */}
         <div className="group rounded-xl bg-transparent">
             <div className="flex items-center justify-between py-4 outline-none select-none">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-blue-500">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white">Double Progression Updates</h3>
                </div>
             </div>
             <div className="pl-3 border-l-2 border-white/5 ml-4 pb-2 space-y-3">
                 {allExercises.slice(0, 3).map(ex => {
                     const status = getExerciseStatus(ex.id);
                     return (
                        <div key={ex.id} onClick={() => onViewExercise(ex.id)} className="flex items-center justify-between rounded-r-lg hover:bg-white/5 p-3 transition-colors cursor-pointer">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-white">{ex.name}</span>
                                <span className="text-xs text-blue-300">{status.setsInfo}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {status.status === 'increase' ? (
                                    <>
                                        <span className="text-sm text-slate-400 line-through opacity-50">{status.currentMax}lb</span>
                                        <ArrowUp size={12} className="text-blue-500 animate-pulse rotate-45" />
                                        <span className="text-base font-bold text-blue-500">{status.targetWeight}lb</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-slate-400 px-2 py-0.5 bg-white/5 rounded">Hold {status.currentMax}</span>
                                )}
                            </div>
                        </div>
                     );
                 })}
             </div>
         </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 w-full backdrop-blur-md bg-[#0b1120]/90 border-t border-white/5 py-4 px-6 z-10">
        <div className="flex justify-between max-w-sm mx-auto">
            <button onClick={onViewHistory} className="flex flex-col items-center gap-1 group">
                <BarChart size={20} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-500 transition-colors">Analytics</span>
            </button>
            <button onClick={exportData} className="flex flex-col items-center gap-1 group">
                <Share size={20} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-500 transition-colors">Export</span>
            </button>
            <button onClick={onViewHistory} className="flex flex-col items-center gap-1 group">
                <Calendar size={20} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-500 transition-colors">Logbook</span>
            </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;