import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import axios from 'axios';

export interface UserAnswers {
  swing_speed: string;
  current_shot_shape: string;
  shot_shape_slider: number;
  trajectory_slider: number;
  feel_slider: number;
}

export interface ShaftRecommendation {
  name: string;
  percentage: number;
}

export interface PredictionResult {
  recommendations: ShaftRecommendation[];
  chartData?: any[];
  allProbabilities?: number[];
}

export interface PredictionQuizProps {
  showPercentages?: boolean;
  branding?: 'admin' | 'consumer';
  onComplete?: (userAnswers: UserAnswers, predictions: PredictionResult) => void;
  submitButtonText?: string;
  apiEndpoint?: string;
  className?: string;
}

export default function PredictionQuiz({
  showPercentages = true,
  branding = 'admin',
  onComplete,
  submitButtonText = 'Get Recommendations',
  apiEndpoint = '/api/predict',
  className = ''
}: PredictionQuizProps) {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({
    swing_speed: '96-105',
    current_shot_shape: 'straight',
    shot_shape_slider: 0,
    trajectory_slider: 0,
    feel_slider: 0
  });

  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(apiEndpoint, { userAnswers });
      const predictionData = response.data;
      setPredictions(predictionData);

      if (onComplete) {
        onComplete(userAnswers, predictionData);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  // Branding colors
  const colors = {
    admin: {
      background: 'bg-[#222222]',
      inputBg: 'bg-[#444444]',
      cardBg: 'bg-[#333333]',
      primary: 'bg-[#DAF612]',
      primaryHover: 'hover:bg-[#c5e010]',
      primaryText: 'text-gray-900',
      text: 'text-white',
      textSecondary: 'text-[#b0b0b0]'
    },
    consumer: {
      background: 'bg-white',
      inputBg: 'bg-gray-100',
      cardBg: 'bg-gray-50',
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      primaryText: 'text-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600'
    }
  };

  const theme = colors[branding];

  return (
    <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 ${className}`}>
      {/* Input Panel */}
      <div className={`${theme.background} rounded-3xl p-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme.text} uppercase`}>
          {branding === 'admin' ? 'Test Prediction' : 'Find Your Perfect Shaft'}
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Swing Speed */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-2 uppercase`}>
              Swing Speed
            </label>
            <select
              value={userAnswers.swing_speed}
              onChange={(e) => setUserAnswers({ ...userAnswers, swing_speed: e.target.value })}
              className={`w-full ${theme.inputBg} rounded-xl pl-4 pr-12 py-3 ${theme.text} focus:outline-none focus:ring-2 focus:ring-primary-400/20`}
            >
              <option value="under85">Under 85 mph</option>
              <option value="85-95">85-95 mph</option>
              <option value="96-105">96-105 mph</option>
              <option value="106-115">106-115 mph</option>
              <option value="over115">Over 115 mph</option>
            </select>
          </div>

          {/* Shot Shape */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-2 uppercase`}>
              Current Shot Shape
            </label>
            <select
              value={userAnswers.current_shot_shape}
              onChange={(e) => setUserAnswers({ ...userAnswers, current_shot_shape: e.target.value })}
              className={`w-full ${theme.inputBg} rounded-xl pl-4 pr-12 py-3 ${theme.text} focus:outline-none focus:ring-2 focus:ring-primary-400/20`}
            >
              <option value="fade">Fade</option>
              <option value="straight">Straight</option>
              <option value="draw">Draw</option>
            </select>
          </div>

          {/* Shot Shape Preference */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-2 uppercase`}>
              Shot Shape Preference: {userAnswers.shot_shape_slider.toFixed(2)}
            </label>
            <div className={`relative flex justify-between items-center text-xs ${theme.textSecondary} mb-3 uppercase`}>
              <span>Most Draw</span>
              <span className="absolute left-1/2 transform -translate-x-1/2">← →</span>
              <span>Most Fade</span>
            </div>
            <input
              type="range"
              value={userAnswers.shot_shape_slider}
              onChange={(e) => setUserAnswers({ ...userAnswers, shot_shape_slider: parseFloat(e.target.value) })}
              min={-1}
              max={1}
              step={0.1}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 uppercase">
              <span>-1</span>
              <span>0</span>
              <span>+1</span>
            </div>
          </div>

          {/* Trajectory Preference */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-2 uppercase`}>
              Trajectory Preference: {userAnswers.trajectory_slider.toFixed(2)}
            </label>
            <div className={`relative flex justify-between items-center text-xs ${theme.textSecondary} mb-3 uppercase`}>
              <span>Lowest</span>
              <span className="absolute left-1/2 transform -translate-x-1/2">← →</span>
              <span>Highest</span>
            </div>
            <input
              type="range"
              value={userAnswers.trajectory_slider}
              onChange={(e) => setUserAnswers({ ...userAnswers, trajectory_slider: parseFloat(e.target.value) })}
              min={-1}
              max={1}
              step={0.1}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 uppercase">
              <span>-1</span>
              <span>0</span>
              <span>+1</span>
            </div>
          </div>

          {/* Feel Preference */}
          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-2 uppercase`}>
              Feel Preference: {userAnswers.feel_slider.toFixed(2)}
            </label>
            <div className={`relative flex justify-between items-center text-xs ${theme.textSecondary} mb-3 uppercase`}>
              <span>Softest</span>
              <span className="absolute left-1/2 transform -translate-x-1/2">← →</span>
              <span>Firmest</span>
            </div>
            <input
              type="range"
              value={userAnswers.feel_slider}
              onChange={(e) => setUserAnswers({ ...userAnswers, feel_slider: parseFloat(e.target.value) })}
              min={-1}
              max={1}
              step={0.1}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 uppercase">
              <span>-1</span>
              <span>0</span>
              <span>+1</span>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className={`w-full ${theme.primary} ${theme.primaryHover} disabled:bg-gray-600 disabled:cursor-not-allowed ${theme.primaryText} font-medium py-4 px-6 rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2 uppercase`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin"></div>
                <span>Predicting...</span>
              </>
            ) : (
              <span>{submitButtonText}</span>
            )}
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {predictions && (
        <div className={`${theme.background} rounded-3xl p-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${theme.text} uppercase`}>Recommendations</h2>

          {/* Top Recommendations */}
          <div className="space-y-4 mb-8">
            {predictions.recommendations.map((rec: ShaftRecommendation, index: number) => (
              <div key={index} className={`${theme.cardBg} rounded-2xl p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div
                      className="w-3 h-12 rounded-xl mr-4"
                      style={{
                        backgroundColor: rec.name.toLowerCase().includes('blue') ? '#9dc1d0' :
                                       rec.name.toLowerCase().includes('red') ? '#f65d4a' :
                                       rec.name.toLowerCase().includes('green') ? '#0c8919' :
                                       '#6b7280'
                      }}
                    ></div>
                    <div>
                      <h3 className={`text-lg font-semibold ${theme.text} mb-1`}>
                        #{index + 1} {rec.name}
                      </h3>
                      {showPercentages && (
                        <p className={theme.textSecondary}>
                          Confidence: {rec.percentage}%
                        </p>
                      )}
                    </div>
                  </div>
                  {showPercentages && (
                    <div className="w-24 text-right">
                      <div className={`w-full ${theme.inputBg} rounded-full h-3 mb-2`}>
                        <div
                          className="bg-[#DAF612] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${rec.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-primary-400">
                        {rec.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* All Probabilities Chart - Only show in admin */}
          {showPercentages && predictions.chartData && (
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${theme.text} uppercase`}>All Shaft Probabilities</h3>
              <div className={`${theme.cardBg} rounded-2xl p-6`}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={predictions.chartData} margin={{ bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="shaft"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      stroke="#9CA3AF"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Probability']}
                    />
                    <Bar dataKey="probability" radius={[4, 4, 0, 0]} fill="#9dc1d0">
                      {predictions.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
