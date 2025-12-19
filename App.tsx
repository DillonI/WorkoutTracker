import React, { useState, useEffect } from 'react';
import { WORKOUT_A, WORKOUT_B, FINISHER_WORKOUT, CORE_CIRCUIT, WARMUP_EXERCISES, WARMUP_ROUTINE } from './constants';
import { WorkoutSession, ExerciseLog, SetLog, WorkoutRoutine } from './types';
import ExerciseLogger from './components/ExerciseLogger';
import Dashboard from './components/Dashboard';
import ExerciseDetail from './components/ExerciseDetail';
import WarmupScreen from './components/WarmupScreen';
import HistoryScreen from './components/HistoryScreen';
import FinisherSupersetScreen from './components/FinisherSupersetScreen';
import { generateWorkoutAnalysis } from './services/geminiService';
import { calculateProgression } from './utils/progression';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'dashboard' | 'workout' | 'exercise-detail' | 'history'>('dashboard');
  const [activeExerciseDetailId, setActiveExerciseDetailId] = useState<string | null>(null);
  
  // Workout State
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [sessionLogs, setSessionLogs] = useState<ExerciseLog[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isWarmupComplete, setIsWarmupComplete] = useState(false);
  const [finisherStep, setFinisherStep] = useState(0); // 0=Round1, 1=Round2, 2=Pushdowns
  const [workoutStartTimeOfDay, setWorkoutStartTimeOfDay] = useState<'Morning' | 'Afternoon' | 'Night' | null>(null);

  // Data State
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem('spine_sparing_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: WorkoutSession[]) => {
    setHistory(newHistory);
    localStorage.setItem('spine_sparing_history', JSON.stringify(newHistory));
  };

  const startWorkout = (routineId: 'A' | 'B' | 'Finisher' | 'Warmup') => {
    // RESUME LOGIC: If we are already in this routine and have logs, just go back to view
    if (activeRoutine?.id === routineId && sessionLogs.length > 0) {
        setView('workout');
        return;
    }

    let routine: WorkoutRoutine;
    if (routineId === 'A') routine = WORKOUT_A;
    else if (routineId === 'B') routine = WORKOUT_B;
    else if (routineId === 'Finisher') routine = FINISHER_WORKOUT;
    else routine = WARMUP_ROUTINE;

    setActiveRoutine(routine);
    
    // Logic: REMOVED Core Circuit from A & B based on user feedback.
    const isStandardWorkout = routineId === 'A' || routineId === 'B';
    const isWarmupOnly = routineId === 'Warmup';
    
    const allExercises = routine.exercises;

    const initialLogs: ExerciseLog[] = allExercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [],
      skipped: false
    }));

    setSessionLogs(initialLogs);
    setCurrentExerciseIndex(0);
    setFinisherStep(0);
    
    // Logic: Disabled forced warmup prompt for A/B.
    setIsWarmupComplete(true);

    // Determine Time of Day
    const currentHour = new Date().getHours();
    let timeOfDay: 'Morning' | 'Afternoon' | 'Night' = 'Morning';
    if (currentHour >= 5 && currentHour < 12) {
        timeOfDay = 'Morning';
    } else if (currentHour >= 12 && currentHour < 17) {
        timeOfDay = 'Afternoon';
    } else {
        timeOfDay = 'Night';
    }
    setWorkoutStartTimeOfDay(timeOfDay);

    setView('workout');
  };

  // Exit without saving (State held in activeRoutine/sessionLogs)
  const exitWorkoutToDashboard = () => {
    setView('dashboard');
  };

  const updateExerciseLog = (exerciseId: string, sets: SetLog[]) => {
    setSessionLogs(prev => prev.map(log => 
      log.exerciseId === exerciseId ? { ...log, sets } : log
    ));
  };

  const skipExercise = (exerciseId: string) => {
    setSessionLogs(prev => prev.map(log => 
      log.exerciseId === exerciseId ? { ...log, skipped: true } : log
    ));
    if (currentExerciseIndex < sessionLogs.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  // Navigation Logic
  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
        setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const nextExercise = () => {
      if (activeRoutine && currentExerciseIndex < activeRoutine.exercises.length - 1) {
          setCurrentExerciseIndex(prev => prev + 1);
      }
  };

  const finishWorkout = async () => {
    if (!activeRoutine) return;
    
    if (activeRoutine.id === 'Warmup') {
        setActiveRoutine(null);
        setSessionLogs([]);
        setView('dashboard');
        return;
    }

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      routineId: activeRoutine.id,
      timeOfDay: workoutStartTimeOfDay || 'Morning', // Default fallback
      logs: sessionLogs
    };

    const updatedHistory = [...history, newSession];
    saveHistory(updatedHistory);

    generateWorkoutAnalysis(newSession).then(feedback => {
        const historyWithFeedback = [...updatedHistory];
        historyWithFeedback[historyWithFeedback.length - 1].feedback = feedback;
        saveHistory(historyWithFeedback);
    });

    setActiveRoutine(null);
    setSessionLogs([]);
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  const viewExercise = (exerciseId: string) => {
    setActiveExerciseDetailId(exerciseId);
    setView('exercise-detail');
  };

  const handleUpdateSession = (updatedSession: WorkoutSession) => {
    const updatedHistory = history.map(s => s.id === updatedSession.id ? updatedSession : s);
    saveHistory(updatedHistory);
  };

  // --- Render Views ---

  const renderWorkout = () => {
    if (!activeRoutine) return null;

    // Phase 0: Warmup Check
    // Only show if routine is explicitly 'Warmup'. Logic changed to not force it for A/B.
    if (!isWarmupComplete && activeRoutine.id === 'Warmup') {
        return <WarmupScreen 
            onComplete={() => finishWorkout()} 
            onExit={exitWorkoutToDashboard}
        />;
    }
    
    // Explicit Warmup Routine View
    if (activeRoutine.id === 'Warmup') {
         return <WarmupScreen 
            onComplete={() => finishWorkout()} 
            onExit={exitWorkoutToDashboard}
        />;
    }

    // SPECIAL HANDLING FOR FINISHER
    if (activeRoutine.id === 'Finisher') {
        // Step 0 & 1: Superset Rounds (Raises + Curls)
        // Step 2: Pushdowns (Standard)
        if (finisherStep < 2) {
            const exercises = activeRoutine.exercises.slice(0, 2); // Raises and Curls
            return <FinisherSupersetScreen 
                exercises={exercises}
                logs={sessionLogs}
                round={finisherStep + 1}
                history={history} // Pass history for smart pre-fill
                onUpdateLog={updateExerciseLog}
                onNext={() => setFinisherStep(prev => prev + 1)}
                onExit={exitWorkoutToDashboard}
            />;
        } else {
             // Pushdowns (Index 2 in constants)
             const pushdownExercise = activeRoutine.exercises[2];
             const currentLog = sessionLogs.find(l => l.exerciseId === pushdownExercise.id);
             const recommendation = calculateProgression(pushdownExercise.id, history);
             
             return (
                <div className="flex flex-col flex-1 bg-[#0b1120] text-white">
                    <div className="flex justify-between items-center p-4 pt-4 shrink-0 z-20 bg-[#0b1120]/80 backdrop-blur-md border-b border-white/5">
                        <button onClick={exitWorkoutToDashboard} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                            Finisher Finale
                        </div>
                        <div className="w-6"></div> 
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                         <ExerciseLogger 
                           key={pushdownExercise.id}
                           exercise={pushdownExercise}
                           initialSets={currentLog?.sets || []}
                           recommendation={recommendation}
                           onUpdate={(sets) => updateExerciseLog(pushdownExercise.id, sets)}
                           onSkip={() => {}} // Can't skip final
                           onExit={exitWorkoutToDashboard}
                           onComplete={finishWorkout}
                           actionLabel="Finish Workout"
                         />
                    </div>
                </div>
             );
        }
    }

    // STANDARD WORKOUT RENDER
    const allExercises = activeRoutine.exercises;
    
    const currentExercise = allExercises[currentExerciseIndex];
    if (!currentExercise) return null; 

    const currentLog = sessionLogs.find(l => l.exerciseId === currentExercise.id);
    const recommendation = calculateProgression(currentExercise.id, history);
    const progress = ((currentExerciseIndex + 1) / allExercises.length) * 100;
    
    // Navigation logic
    const isLastExercise = currentExerciseIndex === allExercises.length - 1;
    const handleComplete = isLastExercise ? finishWorkout : nextExercise;
    const actionLabel = isLastExercise ? "Finish Workout" : "Next Exercise";

    return (
      <div className="flex flex-col flex-1 bg-[#0b1120] text-white">
        {/* Minimal Header */}
        <div className="hidden"></div> 

        {/* Focus Area */}
        <div className="flex-1 overflow-hidden relative">
             <ExerciseLogger 
               key={currentExercise.id}
               exercise={currentExercise}
               initialSets={currentLog?.sets || []}
               recommendation={recommendation}
               onUpdate={(sets) => updateExerciseLog(currentExercise.id, sets)}
               onSkip={() => skipExercise(currentExercise.id)}
               onExit={exitWorkoutToDashboard}
               
               onPrev={prevExercise}
               onNext={nextExercise}
               
               onComplete={handleComplete}
               actionLabel={actionLabel}
               
               canPrev={currentExerciseIndex > 0}
               canNext={currentExerciseIndex < allExercises.length - 1}
             />
        </div>
        
        {/* Bottom Navigation is now handled inside ExerciseLogger */}
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${view === 'workout' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-[#0b1120] text-white selection:bg-blue-600 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]`}>
      {view === 'dashboard' && (
          <Dashboard 
            history={history} 
            onStartWorkout={startWorkout} 
            onViewExercise={viewExercise} 
            onViewHistory={() => setView('history')}
          />
      )}
      {view === 'workout' && renderWorkout()}
      {view === 'exercise-detail' && activeExerciseDetailId && (
          <ExerciseDetail 
            exercise={[
                ...WARMUP_EXERCISES, 
                ...WORKOUT_A.exercises, 
                ...WORKOUT_B.exercises, 
                ...FINISHER_WORKOUT.exercises,
                ...CORE_CIRCUIT // Core circuit still exists in constants if needed, just removed from active routines
            ].find(e => e.id === activeExerciseDetailId)!}
            history={history}
            onBack={() => setView('dashboard')}
          />
      )}
      {view === 'history' && (
        <HistoryScreen 
            history={history}
            onBack={() => setView('dashboard')}
            onUpdateSession={handleUpdateSession}
        />
      )}
    </div>
  );
};

export default App;