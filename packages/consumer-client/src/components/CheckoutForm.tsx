import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UserAnswers } from '@gears/shared-ui';
import axios from 'axios';

interface CheckoutFormProps {
  recommendations: any[];
  quizAnswers: UserAnswers;
  allProbabilities?: number[];
  onBack: () => void;
}

export default function CheckoutForm({ recommendations, quizAnswers, allProbabilities, onBack }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    driverBrand: '',
    driverModel: '',
    currentDriverShaft: '',
    shaftSatisfaction: 5,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    handicap: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        userDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          shippingAddress: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zipCode,
            country: formData.country
          },
          handicap: formData.handicap || undefined
        },
        driverDetails: {
          brand: formData.driverBrand,
          model: formData.driverModel,
          currentShaft: formData.currentDriverShaft,
          shaftSatisfaction: formData.shaftSatisfaction
        },
        quizAnswers,
        recommendations,
        allProbabilities: allProbabilities || []
      };

      // Use environment variable or default to relative URL for production
      const apiUrl = import.meta.env.VITE_API_URL || '/api/submit';
      await axios.post(apiUrl, payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  // Show success message after submission
  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#222222] rounded-3xl p-6 md:p-8 text-center">
          <div className="mb-4 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#DAF612] rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white uppercase">Thank You!</h2>
          <p className="text-base md:text-lg text-[#b0b0b0]">
            Your shaft recommendations have been submitted successfully. We'll be in touch shortly!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={submitting}
        className="mb-4 md:mb-6 flex items-center gap-2 text-[#b0b0b0] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={20} />
        <span className="text-sm md:text-base">Back to Results</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 md:mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Selected Recommendations Summary */}
      <div className="bg-[#222222] rounded-3xl p-6 md:p-8 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white uppercase">YOUR RECOMMENDED SHAFTS</h2>
        <div className="space-y-2 md:space-y-3">
          {recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="flex items-center gap-3 md:gap-4">
              <div
                className="w-2 md:w-3 h-10 md:h-12 rounded-xl"
                style={{
                  backgroundColor: rec.name.toLowerCase().includes('blue') ? '#9dc1d0' :
                                 rec.name.toLowerCase().includes('red') ? '#f65d4a' :
                                 rec.name.toLowerCase().includes('green') ? '#0c8919' :
                                 '#6b7280'
                }}
              ></div>
              <span className="font-semibold text-white text-sm md:text-base">
                #{index + 1} {rec.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="bg-[#222222] rounded-3xl p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white uppercase">COMPLETE YOUR ORDER</h2>

        {/* Driver Information */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-[#DAF612] uppercase">Current Driver</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Driver Brand *
              </label>
              <input
                type="text"
                required
                value={formData.driverBrand}
                onChange={(e) => setFormData({ ...formData, driverBrand: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                placeholder="e.g., TaylorMade, Callaway"
              />
            </div>
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Driver Model *
              </label>
              <input
                type="text"
                required
                value={formData.driverModel}
                onChange={(e) => setFormData({ ...formData, driverModel: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                placeholder="e.g., Stealth 2, Paradym"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
              What is your current Driver shaft *
            </label>
            <input
              type="text"
              required
              value={formData.currentDriverShaft}
              onChange={(e) => setFormData({ ...formData, currentDriverShaft: e.target.value })}
              className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              placeholder="Enter your current shaft"
            />
          </div>
          <div>
            <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
              How Much Do you like your current shaft: {formData.shaftSatisfaction}
            </label>
            <div className="relative flex justify-between items-center text-xs text-[#b0b0b0] mb-3 uppercase">
              <span>Don't Like</span>
              <span className="absolute left-1/2 transform -translate-x-1/2">← →</span>
              <span>Love It</span>
            </div>
            <input
              type="range"
              value={formData.shaftSatisfaction}
              onChange={(e) => setFormData({ ...formData, shaftSatisfaction: parseInt(e.target.value) })}
              min={0}
              max={10}
              step={1}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 uppercase">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-[#DAF612] uppercase">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              />
            </div>
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Handicap
              </label>
              <input
                type="text"
                value={formData.handicap}
                onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                placeholder="e.g., 12.5 or +2"
              />
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-[#DAF612] uppercase">Shipping Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                />
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                />
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-white mb-2 uppercase">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full bg-[#444444] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#DAF612] hover:bg-[#c5e010] disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-medium py-4 px-6 rounded-2xl transition-colors duration-200 uppercase text-sm md:text-base flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <span>Submit Order Request</span>
          )}
        </button>
      </form>
    </div>
  );
}
