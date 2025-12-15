import React from 'react';
import { Exercise, ExerciseLog, SetLog, WorkoutSession } from '../types';

interface Props {
  exercise: Exercise;
  initialSets: SetLog[];
  recommendation?: string;
  onUpdate: (sets: SetLog[]) => void;
  onSkip: () => void;
  onExit: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  actionLabel?: string;
  canPrev?: boolean;
  canNext?: boolean;
}

const ExerciseLogger: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>Exercise Logger</h1>
      <button onClick={props.onComplete}>{props.actionLabel}</button>
    </div>
  );
};

export default ExerciseLogger;
