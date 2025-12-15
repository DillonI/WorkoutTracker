import { WorkoutSession, SetLog, Exercise } from '../types';

interface ProgressionResult {
  recommendedWeight: number;
  coachNote: string;
  status: 'increase' | 'maintain' | 'deload' | 'calibration';
}

export const calculateProgression = (
  exerciseId: string,
  history: WorkoutSession[]
): ProgressionResult => {
  // 1. Get all sessions containing this exercise, sorted newest to oldest
  const relevantSessions = [...history]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(session => session.logs.some(log => log.exerciseId === exerciseId && !log.skipped));

  const lastSession = relevantSessions[0];

  // NEW USER / CALIBRATION
  if (!lastSession) {
    return {
      recommendedWeight: 0,
      coachNote: "Find your baseline weight.",
      status: 'calibration'
    };
  }

  const lastLog = lastSession.logs.find(log => log.exerciseId === exerciseId);
  if (!lastLog || !lastLog.sets.length) {
    return {
      recommendedWeight: 0,
      coachNote: "Find your baseline weight.",
      status: 'calibration'
    };
  }

  // --- ANALYZE LAST SESSION ---
  
  // Filter for Main Sets (ignore drop sets for progression decision)
  const mainSets = lastLog.sets.filter(s => !s.isDropSet);
  const topWeight = Math.max(...mainSets.map(s => s.weight));
  
  // Target Reps Logic: Use the target defined in the log, default to 10 if missing
  const targetReps = mainSets[0]?.targetReps || 10;
  
  // Did we hit reps on ALL main sets?
  const allMainSetsSuccessful = mainSets.every(s => {
    const reps = typeof s.reps === 'number' ? s.reps : 0;
    return reps >= targetReps; // Strict success
  });

  const usedDropSet = lastLog.sets.some(s => s.isDropSet);

  // --- THE ALGORITHM ---

  // 1. SUCCESS: All straight sets hit target reps -> Increase Weight (Progressive Overload)
  if (allMainSetsSuccessful && !usedDropSet) {
    return {
      recommendedWeight: topWeight + 5,
      coachNote: `Hit target reps. Increase weight.`,
      status: 'increase'
    };
  }

  // 2. VOLUME SAVE: Missed reps but used Drop Set -> Maintain
  // The drop set counts as "saving" the workout volume, so we don't deload, but we don't increase.
  if (usedDropSet) {
    return {
      recommendedWeight: topWeight,
      coachNote: "Volume saved via Drop Set. Keep weight.",
      status: 'maintain'
    };
  }

  // 3. FAILURE / STALL DETECTION
  // Check the session BEFORE the last one to see if this is a pattern.
  const previousSession = relevantSessions[1];
  
  if (previousSession) {
      const prevLog = previousSession.logs.find(l => l.exerciseId === exerciseId);
      if (prevLog) {
          const prevMainSets = prevLog.sets.filter(s => !s.isDropSet);
          const prevAllSuccess = prevMainSets.every(s => (typeof s.reps === 'number' ? s.reps : 0) >= s.targetReps);
          
          // If we failed LAST time AND THIS time -> DELOAD
          if (!prevAllSuccess && !allMainSetsSuccessful) {
              const deloadWeight = Math.max(5, Math.floor((topWeight * 0.9) / 5) * 5); // 10% drop, rounded to 5
              return {
                  recommendedWeight: deloadWeight,
                  coachNote: "Stalled twice. Deload -10% to reset CNS.",
                  status: 'deload'
              };
          }
      }
  }

  // 4. FIRST FAILURE: Just missed reps this time -> Retry (Maintain)
  return {
    recommendedWeight: topWeight,
    coachNote: "Missed reps. Retry this weight.",
    status: 'maintain'
  };
};

// --- ANALYTICS HELPERS ---

export const getWeeklyConsistency = (history: WorkoutSession[]) => {
  // Returns array of booleans for last 7 days (today to 6 days ago)
  const days = [];
  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const hasWorkout = history.some(h => {
        const hDate = new Date(h.date);
        hDate.setHours(0,0,0,0);
        return hDate.getTime() === d.getTime();
    });
    days.push({ date: d, active: hasWorkout });
  }
  return days;
};

export const getTotalVolumeData = (history: WorkoutSession[]) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const calculateVolume = (sessions: WorkoutSession[]) => {
    return sessions.reduce((total, session) => {
      return total + session.logs.reduce((sessTotal, log) => {
        return sessTotal + log.sets.reduce((setTotal, set) => {
          const w = set.weight || 0;
          const r = typeof set.reps === 'number' ? set.reps : 0;
          return setTotal + (w * r);
        }, 0);
      }, 0);
    }, 0);
  };

  const thisWeekSessions = history.filter(h => new Date(h.date) >= oneWeekAgo);
  const lastWeekSessions = history.filter(h => new Date(h.date) >= twoWeeksAgo && new Date(h.date) < oneWeekAgo);

  const thisWeekVol = calculateVolume(thisWeekSessions);
  const lastWeekVol = calculateVolume(lastWeekSessions);

  let trend = 0;
  if (lastWeekVol > 0) {
    trend = ((thisWeekVol - lastWeekVol) / lastWeekVol) * 100;
  }

  return { volume: thisWeekVol, trend: Math.round(trend) };
};

export const getRecentPRs = (history: WorkoutSession[], exercises: Exercise[]) => {
  // Find exercises where the most recent max weight is higher than any previous max weight
  const prs: { exerciseName: string; weight: number; date: string }[] = [];

  exercises.forEach(ex => {
    // Get all sessions for this exercise, sorted by date
    const sessions = history
        .filter(h => h.logs.some(l => l.exerciseId === ex.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sessions.length < 2) return;

    const latestSession = sessions[sessions.length - 1];
    const previousSessions = sessions.slice(0, sessions.length - 1);

    const getMax = (s: WorkoutSession) => {
        const log = s.logs.find(l => l.exerciseId === ex.id);
        if (!log) return 0;
        return Math.max(...log.sets.filter(set => !set.isDropSet).map(set => set.weight || 0), 0);
    };

    const currentMax = getMax(latestSession);
    const previousMax = Math.max(...previousSessions.map(getMax), 0);

    if (currentMax > previousMax && currentMax > 0) {
        prs.push({
            exerciseName: ex.name,
            weight: currentMax,
            date: latestSession.date
        });
    }
  });

  return prs;
};