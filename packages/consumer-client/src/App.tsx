import React, { useState } from 'react';
import { PredictionResult, UserAnswers } from '@gears/shared-ui';
import QuizWithNextStep from './components/QuizWithNextStep';
import CheckoutForm from './components/CheckoutForm';
import gearsLogo from './assets/gears_logo_white.svg';

type Step = 'quiz' | 'checkout';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('quiz');
  const [quizData, setQuizData] = useState<{
    userAnswers: UserAnswers | null;
    predictions: PredictionResult | null;
  }>({
    userAnswers: null,
    predictions: null
  });

  const handleNextStep = (userAnswers: UserAnswers, predictions: PredictionResult) => {
    setQuizData({ userAnswers, predictions });
    setCurrentStep('checkout');
  };

  const handleBack = () => {
    setCurrentStep('quiz');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8 flex justify-center">
        <img src={gearsLogo} alt="GEARS Golf" className="h-12 md:h-16" />
      </div>

      {currentStep === 'quiz' && (
        <QuizWithNextStep onNextStep={handleNextStep} />
      )}

      {currentStep === 'checkout' && quizData.predictions && quizData.userAnswers && (
        <CheckoutForm
          recommendations={quizData.predictions.recommendations}
          quizAnswers={quizData.userAnswers}
          allProbabilities={quizData.predictions.allProbabilities}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
