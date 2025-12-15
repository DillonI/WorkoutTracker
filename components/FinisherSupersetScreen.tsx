import React, { useEffect } from 'react';
import { Exercise, ExerciseLog, SetLog, WorkoutSession } from '../types';
import { ArrowRight, X, MoreHorizontal } from 'lucide-react';
import { calculateProgression } from '../utils/progression';

interface Props {
  exercises: Exercise[]; 
  logs: ExerciseLog[]; 
  round: number; 
  history: WorkoutSession[]; 
  onUpdateLog: (exerciseId: string, sets: SetLog[]) => void;
  onNext: () => void;
  onExit: () => void;
}

const FinisherSupersetScreen: React.FC<Props> = ({ exercises, logs, round, history, onUpdateLog, onNext, onExit }) => {
  
  // Initialize sets
  useEffect(() => {
    exercises.forEach(ex => {
      const log = logs.find(l => l.exerciseId === ex.id);
      const existingSet = log?.sets.find(s => s.setNumber === round);
      if (!existingSet) {
        const progression = calculateProgression(ex.id, history);
        const defaultWeight = progression.recommendedWeight > 0 ? progression.recommendedWeight : 0;
        const newSet: SetLog = {
          id: crypto.randomUUID(),
          setNumber: round,
          weight: defaultWeight,
          reps: '',
          targetReps: parseInt(ex.defaultReps) || 15,
          completed: false,
          isDropSet: false
        };
        const currentSets = log?.sets || [];
        if (!currentSets.some(s => s.setNumber === round)) {
           onUpdateLog(ex.id, [...currentSets, newSet]);
        }
      }
    });
  }, [round, exercises, logs, history]);

  const updateSet = (exerciseId: string, field: 'weight' | 'reps', value: number | string) => {
    const log = logs.find(l => l.exerciseId === exerciseId);
    if (!log) return;
    const currentSets = log.sets;
    const updatedSets = currentSets.map(s => {
      if (s.setNumber === round) return { ...s, [field]: value };
      return s;
    });
    onUpdateLog(exerciseId, updatedSets);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-safe bg-[#0b1120] text-white font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 z-10">
        <button 
            onClick={onExit}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b]/50 text-slate-400 hover:text-white transition-colors border border-white/5"
        >
            <X size={20} />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Finisher Mode</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-blue-500 tracking-wide uppercase">Metabolic Stress</span>
            </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b]/50 text-slate-400 hover:text-white transition-colors border border-white/5">
            <MoreHorizontal size={20} />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col px-6 pb-32">
          <div className="mb-10 mt-2 flex items-end justify-between">
            <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Round {round} <span className="text-slate-600 text-xl font-bold">/ 2</span></h2>
                <p className="text-sm font-medium text-blue-500 mt-1">Keep rest periods &lt; 30s</p>
            </div>
            <div className="flex gap-1 pb-1.5">
                <div className="h-1.5 w-8 rounded-full bg-blue-500/80"></div>
                <div className={`h-1.5 w-8 rounded-full ${round > 1 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-[#1e293b] border border-white/10'}`}></div>
                <div className="h-1.5 w-8 rounded-full bg-[#1e293b] border border-white/10"></div>
            </div>
          </div>

          <div className="relative flex flex-col gap-8">
             <div className="absolute left-[19px] top-6 bottom-16 w-0.5 bg-gradient-to-b from-blue-500 via-blue-500/50 to-transparent opacity-30"></div>
             
             {exercises.map((ex, idx) => {
                 const log = logs.find(l => l.exerciseId === ex.id);
                 const set = log?.sets.find(s => s.setNumber === round);
                 const isIntensity = idx === 1; // Second exercise is intensity biased

                 return (
                    <div key={ex.id} className="relative z-10 group">
                        <div className="flex items-center justify-between mb-4 pl-12 relative">
                            <div className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-[#0b1120] font-bold z-10`}>
                                {isIntensity ? 'A2' : 'A1'}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight">{ex.name}</h3>
                                    {isIntensity && <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider text-blue-500">Failure</span>}
                                </div>
                                <span className="text-xs font-semibold text-slate-400">Target: {ex.defaultReps} reps</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pl-12">
                            <div className="relative group-focus-within:scale-[1.02] transition-transform duration-300">
                                <div className="absolute inset-0 bg-[#1e293b] rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)]"></div>
                                <input 
                                    className={`relative z-10 w-full bg-transparent border-2 border-transparent focus:border-blue-500 focus:ring-0 rounded-2xl py-5 text-3xl font-bold text-center text-white placeholder-slate-700 transition-all outline-none`}
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="-"
                                    value={set?.weight || ''}
                                    onChange={(e) => updateSet(ex.id, 'weight', e.target.value)}
                                />
                                <span className="absolute top-2 left-0 w-full text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider pointer-events-none z-20">Lbs</span>
                            </div>
                            <div className="relative group-focus-within:scale-[1.02] transition-transform duration-300">
                                <div className="absolute inset-0 bg-[#1e293b] rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)]"></div>
                                <input 
                                    className={`relative z-10 w-full bg-transparent border-2 ${isIntensity ? 'border-blue-500/30' : 'border-transparent'} focus:border-blue-500 focus:ring-0 rounded-2xl py-5 text-3xl font-bold text-center ${isIntensity ? 'text-blue-500' : 'text-white'} placeholder-slate-700 transition-all outline-none`}
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="-"
                                    value={set?.reps || ''}
                                    onChange={(e) => updateSet(ex.id, 'reps', e.target.value)}
                                />
                                <span className="absolute top-2 left-0 w-full text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider pointer-events-none z-20">Reps</span>
                            </div>
                        </div>
                    </div>
                 );
             })}
          </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0b1120]/80 backdrop-blur-xl border-t border-white/5 p-6 pb-8 z-20">
          <div className="flex items-center gap-4 max-w-lg mx-auto">
              <div className="flex flex-col gap-1 pr-2">
                 <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estimated Volume</span>
                 <span className="text-xl font-bold text-white tracking-tight">-- <span className="text-sm text-slate-500 font-medium">lbs</span></span>
              </div>
              <button 
                onClick={onNext}
                className="flex-1 group relative flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-4 transition-all active:scale-[0.98] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
              >
                  <span className="text-base font-bold uppercase tracking-wider text-white">Next Round</span>
                  <ArrowRight size={20} className="text-white font-bold group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30 pointer-events-none"></div>
              </button>
          </div>
      </div>

    </div>
  );
};

export default FinisherSupersetScreen;