import React, { useState } from 'react';
import { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { ArrowLeft, Edit2, Save, X, Calendar, Sparkles } from 'lucide-react';
import { WORKOUT_A, WORKOUT_B, FINISHER_WORKOUT } from '../constants';

interface Props {
  history: WorkoutSession[];
  onBack: () => void;
  onUpdateSession: (updatedSession: WorkoutSession) => void;
}

const HistoryScreen: React.FC<Props> = ({ history, onBack, onUpdateSession }) => {
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState<WorkoutSession | null>(null);

  // Reverse copy of history for list view
  const reversedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getRoutineName = (id: string) => {
    if (id === 'A') return WORKOUT_A.name;
    if (id === 'B') return WORKOUT_B.name;
    if (id === 'Finisher') return FINISHER_WORKOUT.name;
    return id;
  };

  const handleSelectSession = (session: WorkoutSession) => {
    setSelectedSession(session);
    setEditBuffer(JSON.parse(JSON.stringify(session))); // Deep copy for editing
    setIsEditing(false);
  };

  const handleSetUpdate = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => {
    if (!editBuffer) return;

    const newLogs = editBuffer.logs.map(log => {
      if (log.exerciseId === exerciseId) {
        return {
          ...log,
          sets: log.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return log;
    });

    setEditBuffer({ ...editBuffer, logs: newLogs });
  };

  const saveChanges = () => {
    if (editBuffer) {
      onUpdateSession(editBuffer);
      setSelectedSession(editBuffer);
      setIsEditing(false);
    }
  };

  if (selectedSession && editBuffer) {
    return (
      <div className="min-h-screen bg-[#0b1120] text-white p-4 pb-safe animate-in slide-in-from-right font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-safe">
            <button onClick={() => setSelectedSession(null)} className="p-2 -ml-2 text-slate-400 hover:text-white">
                <ArrowLeft size={24} />
            </button>
            <div className="text-center">
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">{new Date(selectedSession.date).toLocaleDateString()}</p>
                <h2 className="text-lg font-bold">{getRoutineName(selectedSession.routineId)}</h2>
            </div>
            <button 
                onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
                className={`p-2 rounded-full ${isEditing ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-slate-400'}`}
            >
                {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
            </button>
        </div>

        {/* Feedback Card */}
        {selectedSession.feedback && (
             <div className="mb-6 rounded-3xl bg-[#1e293b] border border-blue-500/20 p-5">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-blue-400" />
                    <h3 className="text-blue-300 text-xs font-bold uppercase tracking-wider">Coach's Insight</h3>
                </div>
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {selectedSession.feedback}
                </div>
            </div>
        )}

        {/* Logs */}
        <div className="space-y-6 pb-20">
            {editBuffer.logs.filter(l => !l.skipped && l.sets.length > 0).map(log => (
                <div key={log.exerciseId} className="bg-[#1e293b]/40 rounded-3xl p-5 border border-white/5">
                    <h3 className="font-bold text-white mb-4">{log.exerciseName}</h3>
                    <div className="space-y-3">
                        {log.sets.map(set => (
                            <div key={set.id} className="flex items-center justify-between text-sm">
                                <span className={`w-8 font-mono font-bold ${set.isDropSet ? 'text-blue-500' : 'text-slate-500'}`}>
                                    {set.isDropSet ? 'DS' : set.setNumber}
                                </span>
                                
                                <div className="flex items-center gap-6">
                                    <div className="flex items-baseline gap-1">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                inputMode="decimal"
                                                value={set.weight}
                                                onChange={(e) => handleSetUpdate(log.exerciseId, set.id, 'weight', parseFloat(e.target.value))}
                                                className="w-16 bg-black border border-slate-700 rounded px-2 py-1 text-center font-bold text-lg"
                                            />
                                        ) : (
                                            <span className="font-bold text-white text-lg">{set.weight}</span>
                                        )}
                                        <span className="text-slate-500 text-[10px] font-bold tracking-wider">LBS</span>
                                    </div>
                                    <div className="flex items-baseline gap-1 w-16 justify-end">
                                        {isEditing ? (
                                            <input 
                                                type="number"
                                                inputMode="decimal"
                                                value={set.reps === '' ? 0 : set.reps}
                                                onChange={(e) => handleSetUpdate(log.exerciseId, set.id, 'reps', parseFloat(e.target.value))}
                                                className="w-12 bg-black border border-slate-700 rounded px-2 py-1 text-center font-bold text-lg"
                                            />
                                        ) : (
                                            <span className="font-bold text-white text-lg">{set.reps}</span>
                                        )}
                                        <span className="text-slate-500 text-[10px] font-bold tracking-wider">REPS</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
        {isEditing && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-3 rounded-full text-white font-bold text-sm shadow-xl z-50">
                Editing Mode Active
            </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="min-h-screen bg-[#0b1120] text-white p-4 pb-safe animate-in slide-in-from-right font-sans">
       <header className="flex items-center gap-4 mb-8 pt-safe">
            <button onClick={onBack} className="p-2 rounded-full bg-[#1e293b] text-white hover:bg-slate-700 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">Logbook</h1>
        </header>

        <div className="space-y-3">
            {reversedHistory.length === 0 ? (
                <div className="text-center py-20 text-slate-500">No workout history yet.</div>
            ) : (
                reversedHistory.map(session => (
                    <button 
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className="w-full text-left p-6 rounded-3xl bg-[#1e293b] border border-white/5 hover:border-blue-500/30 transition-colors flex justify-between items-center group"
                    >
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">
                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <h3 className="font-bold text-white text-lg">{getRoutineName(session.routineId)}</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#0b1120] flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Calendar size={18} />
                        </div>
                    </button>
                ))
            )}
        </div>
    </div>
  );
};

export default HistoryScreen;