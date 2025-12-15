import React from 'react';
import { Exercise, ExerciseLog, SetLog, WorkoutSession } from '../types';

interface Props {
  exercises: Exercise[];
  logs: ExerciseLog[];
  round: number;
  history: WorkoutSession[];
  onUpdateLog: (exerciseId: string, sets: SetLog[]) => void;
  onNext: () => void;
  onExit: () => void;
}

const FinisherSupersetScreen: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>Finisher Superset</h1>
      <button onClick={props.onNext}>Next</button>
    </div>
  );
};

export default FinisherSupersetScreen;
