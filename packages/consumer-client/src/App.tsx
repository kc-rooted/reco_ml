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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GEARS GOLF SHAFT FINDER
          </h1>
          <p className="text-xl text-gray-600">
            Find your perfect shaft in 3 easy steps
          </p>
        </header>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'quiz' ? 'text-blue-600' : currentStep === 'details' || currentStep === 'thankyou' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'quiz' ? 'bg-blue-600 text-white' : currentStep === 'details' || currentStep === 'thankyou' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Quiz</span>
            </div>

            <div className={`w-16 h-1 ${currentStep === 'details' || currentStep === 'thankyou' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${currentStep === 'details' ? 'text-blue-600' : currentStep === 'thankyou' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'details' ? 'bg-blue-600 text-white' : currentStep === 'thankyou' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Your Info</span>
            </div>

            <div className={`w-16 h-1 ${currentStep === 'thankyou' ? 'bg-green-600' : 'bg-gray-300'}`}></div>

            <div className={`flex items-center ${currentStep === 'thankyou' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'thankyou' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'quiz' && (
          <PredictionQuiz
            showPercentages={false}
            branding="consumer"
            onComplete={handleQuizComplete}
            submitButtonText="See My Recommendations"
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
    </div>
  );
}

export default App;
