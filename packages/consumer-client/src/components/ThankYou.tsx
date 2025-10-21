import React from 'react';

interface ThankYouProps {
  recommendations: any[];
  sessionId: string;
}

export default function ThankYou({ recommendations, sessionId }: ThankYouProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Your shaft recommendation has been submitted successfully.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recommended Shafts</h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-center bg-white rounded-xl p-4 shadow-sm">
                <div className="w-2 h-12 bg-blue-600 rounded mr-4"></div>
                <span className="text-lg font-semibold text-gray-900">
                  #{index + 1} {rec.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          <p>Reference ID: {sessionId}</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
          <p className="text-gray-700">
            Our team will review your recommendation and reach out to you shortly to complete your order.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-2xl transition-colors"
        >
          Start Another Recommendation
        </button>
      </div>
    </div>
  );
}
