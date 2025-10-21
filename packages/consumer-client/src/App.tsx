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
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white uppercase">
            GEARS GOLF SHAFT FINDER
          </h1>
        </header>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#222222] rounded-3xl p-4 flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'quiz' ? 'text-[#DAF612]' : currentStep === 'details' || currentStep === 'thankyou' ? 'text-[#DAF612]' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'quiz' ? 'bg-[#DAF612] text-gray-900' : currentStep === 'details' || currentStep === 'thankyou' ? 'bg-[#DAF612] text-gray-900' : 'bg-[#444444] text-white'}`}>
                1
              </div>
              <span className="ml-2 font-medium uppercase">Quiz</span>
            </div>

            <div className={`w-16 h-1 ${currentStep === 'details' || currentStep === 'thankyou' ? 'bg-[#DAF612]' : 'bg-[#444444]'}`}></div>

            <div className={`flex items-center ${currentStep === 'details' ? 'text-[#DAF612]' : currentStep === 'thankyou' ? 'text-[#DAF612]' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'details' ? 'bg-[#DAF612] text-gray-900' : currentStep === 'thankyou' ? 'bg-[#DAF612] text-gray-900' : 'bg-[#444444] text-white'}`}>
                2
              </div>
              <span className="ml-2 font-medium uppercase">Your Info</span>
            </div>

            <div className={`w-16 h-1 ${currentStep === 'thankyou' ? 'bg-[#DAF612]' : 'bg-[#444444]'}`}></div>

            <div className={`flex items-center ${currentStep === 'thankyou' ? 'text-[#DAF612]' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 'thankyou' ? 'bg-[#DAF612] text-gray-900' : 'bg-[#444444] text-white'}`}>
                3
              </div>
              <span className="ml-2 font-medium uppercase">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
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
    </div>
  );
}

export default App;
