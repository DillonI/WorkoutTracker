import React from 'react';

interface Props {
  onComplete: () => void;
  onExit: () => void;
}

const WarmupScreen: React.FC<Props> = (props) => {
  return (
    <div>
      <h1>Warmup</h1>
      <button onClick={props.onComplete}>Complete</button>
    </div>
  );
};

export default WarmupScreen;
