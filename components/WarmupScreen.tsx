import React, { useState } from 'react';
import { WARMUP_EXERCISES } from '../constants';
import { Check, ArrowRight, Play, ChevronDown } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onExit: () => void;
}

const WarmupScreen: React.FC<Props> = ({ onComplete, onExit }) => {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCompletedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllComplete = WARMUP_EXERCISES.every(ex => completedItems.includes(ex.id));

  return (
    <div className="flex flex-col h-screen bg-[#0b1120] text-white p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="pt-safe mt-4 relative z-10 flex justify-between items-start mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Phase 0: Warm-up</h1>
            <p className="text-slate-500 font-medium">Mobilize the Thoracic spine. Protect the Lumbar.</p>
        </div>
        <button onClick={onExit} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <ChevronDown size={24} />
        </button>
      </div>

      <div className="flex-1 space-y-4 relative z-10">
        {WARMUP_EXERCISES.map((ex, index) => {
          const isDone = completedItems.includes(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() => toggleItem(ex.id)}
              className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 group
                ${isDone 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-[#1e293b]/40 border-white/5 hover:bg-[#1e293b]/60'}
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all
                  ${isDone ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-700 text-transparent'}
                `}>
                  <Check size={16} strokeWidth={3} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg transition-colors ${isDone ? 'text-blue-400' : 'text-zinc-200'}`}>
                    {ex.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {ex.defaultReps}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 leading-snug">
                    {ex.notes}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-6 pb-safe relative z-10">
        <button
          onClick={onComplete}
          className={`w-full h-16 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300
            ${isAllComplete 
              ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
              : 'bg-[#1e293b] text-slate-400 hover:bg-[#1e293b]/80 border border-white/5'}
          `}
        >
          {isAllComplete ? (
            <>Start Workout <Play size={20} fill="currentColor" /></>
          ) : (
            <>Skip Warm-up <ArrowRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default WarmupScreen;