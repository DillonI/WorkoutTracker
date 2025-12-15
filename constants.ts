
import { Exercise, WorkoutRoutine } from './types';

export const WARMUP_EXERCISES: Exercise[] = [
  { id: 'wu1', name: 'Cat-Camel', defaultSets: 1, defaultReps: '8', notes: 'Focus on moving upper back, not lower.', isWarmup: true, hideWeight: true },
  { id: 'wu2', name: 'Quadruped T-Spine Rotations', defaultSets: 1, defaultReps: '8/side', notes: 'Hand behind head, rotate elbow to sky.', isWarmup: true, hideWeight: true },
  { id: 'wu3', name: 'McGill Big 3 Primer', defaultSets: 1, defaultReps: '10s holds', notes: 'Curl-up, Side Plank, Bird Dog (1 round).', isWarmup: true, hideWeight: true },
];

export const CORE_CIRCUIT: Exercise[] = [
  { id: 'cc1', name: 'McGill Curl-Up', defaultSets: 1, defaultReps: '6x10s', notes: 'Maintain neutral spine.', isWarmup: false, hideWeight: true },
  { id: 'cc2', name: 'Side Planks', defaultSets: 1, defaultReps: '30-45s', notes: 'Per side.', isWarmup: false, hideWeight: true },
  { id: 'cc3', name: 'Bird Dogs', defaultSets: 1, defaultReps: '6x10s', notes: 'Reach long, not high. Fist tight.', isWarmup: false, hideWeight: true },
  { id: 'cc4', name: 'Suitcase Carry', defaultSets: 3, defaultReps: '30 steps', notes: 'Heavy load, stay upright.', isWarmup: false },
];

export const WARMUP_ROUTINE: WorkoutRoutine = {
    id: 'Warmup',
    name: 'Phase 0: Warm-Up',
    exercises: WARMUP_EXERCISES
};

export const WORKOUT_A: WorkoutRoutine = {
  id: 'A',
  name: 'Upper Body (Chest Supported)',
  exercises: [
    { id: 'b1', name: 'Chest-Supported Row', defaultSets: 3, defaultReps: '10-12', notes: 'Bench 30-45°. Pull with elbows.', isWarmup: false },
    { id: 'b2', name: 'DB Bench Press (Flat)', defaultSets: 3, defaultReps: '8-10', notes: 'Feet planted. Natural arch only.', isWarmup: false },
    { id: 'b3', name: 'Lat Pulldowns', defaultSets: 3, defaultReps: '10-12', notes: 'Lean back 10°. Decompress spine.', isWarmup: false },
    { id: 'b4', name: 'High-Incline DB Press', defaultSets: 3, defaultReps: '10-12', notes: 'Bench 70°. Safer OHP alternative.', isWarmup: false },
    { id: 'b5', name: 'Face Pulls', defaultSets: 3, defaultReps: '15-20', notes: 'Rear delts/rotator cuff health.', isWarmup: false },
  ]
};

export const WORKOUT_B: WorkoutRoutine = {
  id: 'B',
  name: 'Lower Body (Posterior Chain)',
  exercises: [
    { id: 'a1', name: 'Bulgarian Split Squats', defaultSets: 3, defaultReps: '8-10', notes: 'Torso forward to load glutes.', isWarmup: false },
    { id: 'a2', name: 'Machine Hip Thrusts', defaultSets: 3, defaultReps: '10-12', notes: 'Chin tucked. No hyperextension.', isWarmup: false },
    { id: 'a3', name: '45° Back Extensions', defaultSets: 3, defaultReps: '10-12', notes: 'Hinge at hips, stretch hams. Do not arch back.', isWarmup: false },
    { id: 'a4', name: 'Leg Extensions', defaultSets: 3, defaultReps: '15-20', notes: 'Go to failure. Safe quad volume.', isWarmup: false },
    { id: 'a5', name: 'Standing Calf Raises', defaultSets: 3, defaultReps: '15-20', notes: 'Squeeze glutes to prevent lumbar extension.', isWarmup: false },
  ]
};

export const FINISHER_WORKOUT: WorkoutRoutine = {
    id: 'Finisher',
    name: 'Finisher',
    exercises: [
        { 
            id: 'f1', 
            name: 'DB Lateral Raises', 
            defaultSets: 2, 
            defaultReps: '15', 
            notes: 'Do Set 1 here. Move immediately to Curls.', 
            isWarmup: false 
        },
        { 
            id: 'f2', 
            name: 'Incline DB Curls', 
            defaultSets: 2, 
            defaultReps: '12', 
            notes: 'Do Set 1 here. Then REST. Repeat for Round 2.', 
            isWarmup: false 
        },
        { 
            id: 'f3', 
            name: 'Tricep Pushdowns', 
            defaultSets: 2, 
            defaultReps: '15', 
            notes: 'Standard Sets. Perform after the 2 Superset Rounds.', 
            isWarmup: false 
        }
    ]
};
