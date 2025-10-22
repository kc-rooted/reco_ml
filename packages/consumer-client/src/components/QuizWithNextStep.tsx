import React, { useState, useRef, useEffect } from 'react';
import { PredictionQuiz, PredictionResult, UserAnswers } from '@gears/shared-ui';
import { ArrowRight } from 'lucide-react';

interface QuizWithNextStepProps {
  onNextStep: (userAnswers: UserAnswers, predictions: PredictionResult) => void;
}

export default function QuizWithNextStep({ onNextStep }: QuizWithNextStepProps) {
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers | null>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);

  const handleComplete = (answers: UserAnswers, results: PredictionResult) => {
    setUserAnswers(answers);
    setPredictions(results);
  };

  // Scroll to recommendations when they appear
  useEffect(() => {
    if (predictions && recommendationsRef.current) {
      setTimeout(() => {
        // Scroll to show recommendations card (which appears above the footer marker)
        // Use negative offset to scroll up from the footer marker position
        const rect = recommendationsRef.current?.getBoundingClientRect();
        if (rect) {
          const scrollTarget = window.scrollY + rect.top - 400; // Large offset to show recommendations above
          window.scrollTo({
            top: Math.max(0, scrollTarget), // Ensure we don't scroll past top
            behavior: 'smooth'
          });
        }
      }, 300); // Slight delay to ensure DOM is updated
    }
  }, [predictions]);

  const handleNextStep = () => {
    if (userAnswers && predictions) {
      // Scroll to top before transitioning to next step
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Small delay to let scroll start before page transition
      setTimeout(() => {
        onNextStep(userAnswers, predictions);
      }, 100);
    }
  };

  const renderFooter = () => {
    if (!predictions || !predictions.recommendations || predictions.recommendations.length === 0) {
      return null;
    }

    return (
      <>
        <div ref={recommendationsRef} className="mt-6" />
        <div className="pt-6 border-t border-[#555555]">
          <button
            onClick={handleNextStep}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#DAF612] text-[#DAF612] font-semibold rounded-2xl hover:bg-[#DAF612] hover:text-gray-900 transition-all duration-200 uppercase text-sm md:text-base"
          >
            <span>Next Step</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </>
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
