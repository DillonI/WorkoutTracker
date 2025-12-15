import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import {
  BarChart2,
  Share,
  Calendar,
  Dumbbell,
  TrendingUp,
  Timer
} from 'lucide-react';

interface Props {
  history: WorkoutSession[];
  onStartWorkout: (routineId: 'A' | 'B' | 'Finisher' | 'Warmup') => void;
  onViewExercise: (exerciseId: string) => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<Props> = ({ history, onStartWorkout, onViewHistory }) => {
  // --- Calculations ---

  // 1. Total Volume
  const totalVolume = useMemo(() => {
    return history.reduce((acc, session) => {
      const sessionVol = session.logs.reduce((sAcc, log) => {
        const exerciseVol = log.sets.reduce((eAcc, set) => {
          if (!set.completed || !set.weight || set.reps === '') return eAcc;
          return eAcc + (set.weight * Number(set.reps));
        }, 0);
        return sAcc + exerciseVol;
      }, 0);
      return acc + sessionVol;
    }, 0);
  }, [history]);

  // Format volume (e.g. 12.5k)
  const formattedVolume = useMemo(() => {
    if (totalVolume >= 1000000) return (totalVolume / 1000000).toFixed(1) + 'M';
    if (totalVolume >= 1000) return (totalVolume / 1000).toFixed(1) + 'k';
    return totalVolume.toLocaleString();
  }, [totalVolume]);

  // 2. Weekly Goal Progress
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = history.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek;
    }).length;

    return Math.min(workoutsThisWeek, 4); // Cap at 4 for UI
  }, [history]);

  // Date String: SUNDAY, DEC 14
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white font-sans">

      {/* --- Header --- */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-start">
        <div>
          <h2 className="text-blue-400/80 text-xs font-bold uppercase tracking-wide mb-1">
            {dateString}
          </h2>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Good Morning
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-blue-500/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold">A</span>
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 overflow-y-auto">

        {/* --- Main Stat (Total Volume) --- */}
        <div className="mb-8 text-center py-4">
          <div className="text-blue-400/60 font-bold tracking-widest text-[10px] uppercase mb-2">
            TOTAL VOLUME
          </div>
          <div className="text-6xl font-extrabold text-white tracking-tighter">
            {formattedVolume}
          </div>
        </div>

        {/* --- Weekly Goal --- */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-bold text-sm">Weekly Goal</span>
            <div className="bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full text-xs font-bold">
               {weeklyProgress}/4 Workouts
            </div>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(weeklyProgress / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* --- Action Grid --- */}
        <div className="grid grid-cols-2 gap-4">

          {/* Workout A */}
          <button
            onClick={() => onStartWorkout('A')}
            className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-2xl bg-[#1e293b] border border-transparent hover:border-blue-500/50 transition-all active:scale-[0.98]"
          >
             <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>

            <div className="mb-4 p-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white">
              <Dumbbell size={28} />
            </div>
            <div className="text-sm font-bold text-white">Workout A</div>
          </button>

          {/* Workout B */}
          <button
            onClick={() => onStartWorkout('B')}
            className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-2xl bg-[#1e293b] border border-transparent hover:border-zinc-600 transition-all active:scale-[0.98]"
          >
            <div className="mb-4 p-4 rounded-full bg-[#0f172a] border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">
              <Dumbbell size={28} />
            </div>
            <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Workout B</div>
          </button>

          {/* Finisher */}
          <button
            onClick={() => onStartWorkout('Finisher')}
            className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-2xl bg-[#1e293b] border border-transparent hover:border-zinc-600 transition-all active:scale-[0.98]"
          >
            <div className="mb-4 p-4 rounded-full bg-[#0f172a] border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">
              <TrendingUp size={28} />
            </div>
            <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Finisher</div>
          </button>

          {/* Warmup */}
          <button
            onClick={() => onStartWorkout('Warmup')}
            className="group relative flex flex-col items-center justify-center p-6 h-40 rounded-2xl bg-[#1e293b] border border-transparent hover:border-zinc-600 transition-all active:scale-[0.98]"
          >
            <div className="mb-4 p-4 rounded-full bg-[#0f172a] border border-zinc-700 text-zinc-400 group-hover:text-white transition-colors">
              <Timer size={28} />
            </div>
            <div className="text-sm font-bold text-zinc-200 group-hover:text-white">Warm-Up</div>
          </button>

        </div>
      </main>

      {/* --- Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-lg border-t border-zinc-800/50 pb-safe pt-2 px-6">
        <div className="flex justify-between items-center h-16">

          <button className="flex flex-col items-center gap-1.5 w-16 group opacity-100">
            <BarChart2 size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium text-zinc-500 group-hover:text-white transition-colors">Analytics</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 w-16 group" onClick={() => {}}>
            <Share size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium text-zinc-500 group-hover:text-white transition-colors">Export</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 w-16 group" onClick={onViewHistory}>
            <Calendar size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-medium text-zinc-500 group-hover:text-white transition-colors">Logbook</span>
          </button>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
