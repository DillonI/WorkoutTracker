import React from 'react';
import { Exercise, WorkoutSession } from '../types';

interface Props {
  exercise: Exercise;
  history: WorkoutSession[];
  onBack: () => void;
}

const ExerciseDetail: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>Exercise Detail</h1>
      <button onClick={props.onBack}>Back</button>
    </div>
  );
};

export default ExerciseDetail;
