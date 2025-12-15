import React, { useMemo } from 'react';
import { WorkoutSession } from '../types';
import {
  User,
  Activity,
  Download,
  FileText,
  Dumbbell,
  Flame,
  Timer,
  Zap,
  ChevronRight
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

  // Date String
  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120] text-white font-sans">

      {/* --- Header --- */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-start">
        <div>
          <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
            {dateString}
          </h2>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Good Morning
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <User size={20} className="text-zinc-400" />
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 overflow-y-auto">

        {/* --- Main Stat (Total Volume) --- */}
        <div className="mb-8 text-center py-8">
          <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600 tracking-tighter">
            {formattedVolume}
          </div>
          <div className="text-zinc-500 font-medium tracking-widest text-xs uppercase mt-2">
            Total Volume (lbs)
          </div>
        </div>

        {/* --- Weekly Goal --- */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-zinc-100 font-semibold">Weekly Goal</span>
            <span className="text-zinc-400 text-sm">{weeklyProgress}/4 Workouts</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
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
            className="group relative flex flex-col items-start justify-between p-5 h-40 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all active:scale-[0.98]"
          >
            <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Dumbbell size={24} />
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-0.5">Workout A</div>
              <div className="text-xs text-zinc-500">Strength Focus</div>
            </div>
          </button>

          {/* Workout B */}
          <button
            onClick={() => onStartWorkout('B')}
            className="group relative flex flex-col items-start justify-between p-5 h-40 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all active:scale-[0.98]"
          >
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Dumbbell size={24} />
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-0.5">Workout B</div>
              <div className="text-xs text-zinc-500">Hypertrophy</div>
            </div>
          </button>

          {/* Finisher */}
          <button
            onClick={() => onStartWorkout('Finisher')}
            className="group relative flex flex-col items-start justify-between p-5 h-40 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800/80 transition-all active:scale-[0.98]"
          >
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Flame size={24} />
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-0.5">Finisher</div>
              <div className="text-xs text-zinc-500">Burnout</div>
            </div>
          </button>

          {/* Warmup */}
          <button
            onClick={() => onStartWorkout('Warmup')}
            className="group relative flex flex-col items-start justify-between p-5 h-40 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all active:scale-[0.98]"
          >
            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-lg font-bold text-white mb-0.5">Warm-Up</div>
              <div className="text-xs text-zinc-500">Activation</div>
            </div>
          </button>

        </div>
      </main>

      {/* --- Bottom Navigation --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0b1120]/90 backdrop-blur-lg border-t border-zinc-800 pb-safe pt-2 px-6">
        <div className="flex justify-between items-center h-16">

          <button className="flex flex-col items-center gap-1 w-16 group">
            <Activity size={24} className="text-blue-500" />
            <span className="text-[10px] font-medium text-blue-500">Stats</span>
          </button>

          <button className="flex flex-col items-center gap-1 w-16 group" onClick={() => {}}>
            <Download size={24} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-300 transition-colors">Export</span>
          </button>

          <button className="flex flex-col items-center gap-1 w-16 group" onClick={onViewHistory}>
            <FileText size={24} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            <span className="text-[10px] font-medium text-zinc-600 group-hover:text-zinc-300 transition-colors">Logbook</span>
          </button>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
