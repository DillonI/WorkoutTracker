import React from 'react';
import { WorkoutSession } from '../types';

interface Props {
  history: WorkoutSession[];
  onStartWorkout: (routineId: 'A' | 'B' | 'Finisher' | 'Warmup') => void;
  onViewExercise: (exerciseId: string) => void;
  onViewHistory: () => void;
}

const Dashboard: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => props.onStartWorkout('A')}>Start A</button>
      <button onClick={props.onViewHistory}>History</button>
    </div>
  );
};

export default Dashboard;
