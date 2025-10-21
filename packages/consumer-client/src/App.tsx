import React, { useState } from 'react';
import { PredictionQuiz, UserAnswers, PredictionResult } from '@gears/shared-ui';
import UserDetailsForm from './components/UserDetailsForm';
import ThankYou from './components/ThankYou';
import axios from 'axios';

type Step = 'quiz' | 'details' | 'thankyou';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<UserAnswers | null>(null);
  const [recommendations, setRecommendations] = useState<PredictionResult | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const handleQuizComplete = (answers: UserAnswers, predictions: PredictionResult) => {
    setQuizAnswers(answers);
    setRecommendations(predictions);
    setCurrentStep('details');
  };

  const handleDetailsSubmit = async (userDetails: any) => {
    try {
      const response = await axios.post('/api/submit', {
        userDetails,
        quizAnswers,
        recommendations: recommendations?.recommendations,
        allProbabilities: recommendations?.allProbabilities
      });

      setSessionId(response.data.sessionId);
      setCurrentStep('thankyou');
    } catch (error) {
      console.error('Error submitting details:', error);
      alert('Failed to submit your information. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase">
        GEARS GOLF SHAFT FINDER
      </h1>

      {currentStep === 'quiz' && (
        <PredictionQuiz
          showPercentages={false}
          branding="admin"
          onComplete={handleQuizComplete}
          submitButtonText="Get Recommendations"
        />
      )}

      {currentStep === 'details' && recommendations && (
        <UserDetailsForm
          recommendations={recommendations.recommendations}
          onSubmit={handleDetailsSubmit}
          onBack={() => setCurrentStep('quiz')}
        />
      )}

      {currentStep === 'thankyou' && recommendations && (
        <ThankYou
          recommendations={recommendations.recommendations}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}

export default App;
