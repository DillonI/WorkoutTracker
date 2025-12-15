import React from 'react';
import { WorkoutSession, Exercise } from '../types';
import ProgressCharts from './ProgressCharts';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { calculateProgression } from '../utils/progression';

interface Props {
  exercise: Exercise;
  history: WorkoutSession[];
  onBack: () => void;
}

const ExerciseDetail: React.FC<Props> = ({ exercise, history, onBack }) => {
  const sessionCount = history.filter(s => s.logs.some(l => l.exerciseId === exercise.id)).length;
  const progression = calculateProgression(exercise.id, history);

  return (
    <div className="min-h-screen bg-black p-4 pb-12 animate-in slide-in-from-right duration-300">
        <header className="flex items-center gap-4 mb-8 pt-safe">
            <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white truncate">{exercise.name}</h1>
        </header>

        {/* Status Card */}
        <div className="mb-8 p-6 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-md">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Next Session Target</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tighter">
                    {progression.recommendedWeight > 0 ? progression.recommendedWeight : 'Find Baseline'}
                </span>
                {progression.recommendedWeight > 0 && <span className="text-zinc-500 font-bold">lbs</span>}
            </div>
            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold
                ${progression.status === 'increase' ? 'bg-blue-600/10 text-blue-400' : 'bg-zinc-800 text-zinc-400'}
            `}>
                {progression.coachNote}
            </div>
        </div>

        {/* Charts or Empty State */}
        {sessionCount < 2 ? (
            <div className="p-8 rounded-3xl border border-zinc-800 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Baseline Established</h3>
                    <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto">
                        Complete 1 more session to unlock advanced trend analysis and volume tracking for this exercise.
                    </p>
                </div>
            </div>
        ) : (
            <div className="bg-zinc-900/30 rounded-3xl p-4 border border-white/5">
                <ProgressCharts exerciseId={exercise.id} history={history} />
            </div>
        )}

        <div className="mt-8">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Technique Notes</h3>
            <div className="p-5 rounded-3xl bg-zinc-900 text-zinc-300 text-sm leading-relaxed border border-zinc-800">
                {exercise.notes}
            </div>
        </div>
    </div>
  );
};

export default ExerciseDetail;