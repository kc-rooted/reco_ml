import React from 'react';

interface ThankYouProps {
  recommendations: any[];
  sessionId: string;
}

export default function ThankYou({ recommendations, sessionId }: ThankYouProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#222222] rounded-3xl p-12 text-center">
        <div className="w-20 h-20 bg-[#DAF612]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-[#DAF612]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 uppercase">
          Thank You!
        </h1>

        <p className="text-xl text-[#b0b0b0] mb-8">
          Your shaft recommendation has been submitted successfully.
        </p>

        <div className="bg-[#333333] rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 uppercase">Your Recommended Shafts</h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-center bg-[#444444] rounded-xl p-4">
                <div
                  className="w-3 h-12 rounded-xl mr-4"
                  style={{
                    backgroundColor: rec.name.toLowerCase().includes('blue') ? '#9dc1d0' :
                                   rec.name.toLowerCase().includes('red') ? '#f65d4a' :
                                   rec.name.toLowerCase().includes('green') ? '#0c8919' :
                                   '#6b7280'
                  }}
                ></div>
                <span className="text-lg font-semibold text-white">
                  #{index + 1} {rec.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-[#b0b0b0] mb-8">
          <p>Reference ID: {sessionId}</p>
        </div>

        <div className="bg-[#333333] border-2 border-[#444444] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 uppercase">What's Next?</h3>
          <p className="text-[#b0b0b0]">
            Our team will review your recommendation and reach out to you shortly to complete your order.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-[#DAF612] hover:bg-[#c5e010] text-gray-900 font-medium py-3 px-8 rounded-2xl transition-colors uppercase"
        >
          Start Another Recommendation
        </button>
      </div>
    </div>
  );
}
