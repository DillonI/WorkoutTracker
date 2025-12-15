
export interface Exercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: string; // e.g. "8-10"
  notes: string;
  isWarmup?: boolean;
  hideWeight?: boolean; // New flag to hide weight input
}

export interface WorkoutRoutine {
  id: 'A' | 'B' | 'Finisher' | 'Warmup';
  name: string;
  exercises: Exercise[];
}

export interface SetLog {
  id: string;
  setNumber: number;
  weight: number;
  reps: number | ''; // Allow empty string for "ghost" state
  targetReps: number;
  completed: boolean;
  isDropSet: boolean;
  parentSetId?: string; // Links a drop set to its main set
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  skipped?: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO String
  routineId: 'A' | 'B' | 'Finisher' | 'Warmup';
  logs: ExerciseLog[];
  feedback?: string; // AI Feedback
}

// Stats for charts
export interface ExerciseStat {
  date: string;
  topWeight: number;
  volumeLoad: number; // (weight * reps) + (dropWeight * dropReps)
}
