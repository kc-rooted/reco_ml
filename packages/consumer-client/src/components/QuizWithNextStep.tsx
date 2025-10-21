import React, { useState } from 'react';
import { PredictionQuiz, PredictionResult, UserAnswers } from '@gears/shared-ui';
import { ArrowRight } from 'lucide-react';

interface QuizWithNextStepProps {
  onNextStep: (userAnswers: UserAnswers, predictions: PredictionResult) => void;
}

export default function QuizWithNextStep({ onNextStep }: QuizWithNextStepProps) {
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);

  const handleComplete = (answers: UserAnswers, results: PredictionResult) => {
    setUserAnswers(answers);
    setPredictions(results);
  };

  const handleNextStep = () => {
    if (userAnswers && predictions) {
      onNextStep(userAnswers, predictions);
    }
  };

  const renderFooter = () => {
    if (!predictions || !predictions.recommendations || predictions.recommendations.length === 0) {
      return null;
    }

    return (
      <div className="mt-6 pt-6 border-t border-[#555555]">
        <button
          onClick={handleNextStep}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#DAF612] text-[#DAF612] font-semibold rounded-2xl hover:bg-[#DAF612] hover:text-gray-900 transition-all duration-200 uppercase text-sm md:text-base"
        >
          <span>Next Step</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <PredictionQuiz
      showPercentages={false}
      branding="admin"
      maxRecommendations={2}
      onComplete={handleComplete}
      renderFooter={renderFooter}
    />
  );
}
