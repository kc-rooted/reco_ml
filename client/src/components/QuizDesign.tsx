import React, { useState } from 'react';

export default function QuizDesign() {
  const [formData, setFormData] = useState({
    swing_speed: '96-105',
    current_shot_shape: 'straight',
    shot_shape_preference: 0,
    trajectory_preference: 0,
    feel_preference: 0,
    experience_level: 'intermediate',
    budget_range: 'mid',
    club_type: 'driver'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quiz submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-12 px-4 quiz-font">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#151515] mb-4">
            GET YOUR OVVIO RECOMMENDATIONS
          </h1>
          <p className="text-lg text-[#151515]">
            Answer a few questions to get personalized recommendations
          </p>
          <div className="w-24 h-1 bg-[#fa4616] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl shadow-black/10 p-8 space-y-10">
          
          {/* Question 1 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#151515] flex items-center">
              <span className="bg-[#fa4616] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
              What's your swing speed?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'under85', label: 'Under 85 mph' },
                { value: '85-95', label: '85-95 mph' },
                { value: '96-105', label: '96-105 mph' },
                { value: '106-115', label: '106-115 mph' },
                { value: 'over115', label: 'Over 115 mph' }
              ].map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="swing_speed"
                    value={option.value}
                    checked={formData.swing_speed === option.value}
                    onChange={(e) => setFormData({ ...formData, swing_speed: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.swing_speed === option.value
                      ? 'border-[#fa4616] bg-orange-50 text-[#fa4616]'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-[#151515]'
                  }`}>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#151515] flex items-center">
              <span className="bg-[#fa4616] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
              What's your current shot shape?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'fade', label: 'Fade' },
                { value: 'straight', label: 'Straight' },
                { value: 'draw', label: 'Draw' }
              ].map((option) => (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="current_shot_shape"
                    value={option.value}
                    checked={formData.current_shot_shape === option.value}
                    onChange={(e) => setFormData({ ...formData, current_shot_shape: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    formData.current_shot_shape === option.value
                      ? 'border-[#fa4616] bg-orange-50 text-[#fa4616]'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-[#151515]'
                  }`}>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3 - Sliders */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#151515] flex items-center">
              <span className="bg-[#fa4616] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
              Tell us your preferences
            </h2>
            
            {/* Shot Shape Preference */}
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-[#151515] mb-3">
                Shot Shape Preference: <span className="text-[#fa4616] font-semibold">{formData.shot_shape_preference.toFixed(1)}</span>
              </label>
              <div className="flex justify-between text-sm text-[#151515] mb-2">
                <span>Most Draw</span>
                <span>Neutral</span>
                <span>Most Fade</span>
              </div>
              <input
                type="range"
                value={formData.shot_shape_preference}
                onChange={(e) => setFormData({ ...formData, shot_shape_preference: parseFloat(e.target.value) })}
                min={-1}
                max={1}
                step={0.1}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fa4616] slider-quiz"
              />
            </div>

            {/* Trajectory Preference */}
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-[#151515] mb-3">
                Trajectory Preference: <span className="text-[#fa4616] font-semibold">{formData.trajectory_preference.toFixed(1)}</span>
              </label>
              <div className="flex justify-between text-sm text-[#151515] mb-2">
                <span>Lowest</span>
                <span>Mid</span>
                <span>Highest</span>
              </div>
              <input
                type="range"
                value={formData.trajectory_preference}
                onChange={(e) => setFormData({ ...formData, trajectory_preference: parseFloat(e.target.value) })}
                min={-1}
                max={1}
                step={0.1}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fa4616] slider-quiz"
              />
            </div>

            {/* Feel Preference */}
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="block text-sm font-medium text-[#151515] mb-3">
                Feel Preference: <span className="text-[#fa4616] font-semibold">{formData.feel_preference.toFixed(1)}</span>
              </label>
              <div className="flex justify-between text-sm text-[#151515] mb-2">
                <span>Softest</span>
                <span>Balanced</span>
                <span>Firmest</span>
              </div>
              <input
                type="range"
                value={formData.feel_preference}
                onChange={(e) => setFormData({ ...formData, feel_preference: parseFloat(e.target.value) })}
                min={-1}
                max={1}
                step={0.1}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fa4616] slider-quiz"
              />
            </div>
          </div>


          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-[#fa4616] hover:bg-[#e03d12] text-white font-semibold py-4 px-6 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa4616] focus:ring-offset-2"
            >
              Get My Recommendations
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}