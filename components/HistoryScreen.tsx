import React from 'react';
import { WorkoutSession } from '../types';

interface Props {
  history: WorkoutSession[];
  onBack: () => void;
  onUpdateSession: (updatedSession: WorkoutSession) => void;
}

const HistoryScreen: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>History</h1>
      <button onClick={props.onBack}>Back</button>
    </div>
  );
};

export default HistoryScreen;
