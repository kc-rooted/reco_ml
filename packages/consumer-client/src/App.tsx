import React from 'react';
import { PredictionQuiz } from '@gears/shared-ui';

function App() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase">
        GEARS GOLF SHAFT FINDER
      </h1>

      <PredictionQuiz showPercentages={false} branding="admin" />
    </div>
  );
}

export default App;
