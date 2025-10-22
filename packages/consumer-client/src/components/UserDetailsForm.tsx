import React, { useState } from 'react';

interface UserDetailsFormProps {
  recommendations: any[];
  onSubmit: (userDetails: any) => void;
  onBack: () => void;
}

export default function UserDetailsForm({ recommendations, onSubmit, onBack }: UserDetailsFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    handicap: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userDetails = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country
      },
      handicap: formData.handicap || undefined
    };

    onSubmit(userDetails);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Show Recommendations Summary */}
      <div className="bg-[#222222] rounded-3xl p-8 mb-8">
        <h2 className="text-3xl font-bold text-white mb-6 uppercase">Your Recommended Shafts</h2>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center bg-[#333333] rounded-2xl p-6">
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
                <h3 className="text-xl font-semibold text-white">
                  #{index + 1} {rec.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Details Form */}
      <div className="bg-[#222222] rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-2 uppercase">Almost Done!</h2>
        <p className="text-[#b0b0b0] mb-8">Enter your details to receive your shaft recommendation.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-lg font-medium text-white mb-2 uppercase">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20 ${errors.name ? 'border-2 border-red-500' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-lg font-medium text-white mb-2 uppercase">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-lg font-medium text-white mb-2 uppercase">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 uppercase">Shipping Address</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-white mb-2 uppercase">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className={`w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20 ${errors.street ? 'border-2 border-red-500' : ''}`}
                  placeholder="123 Main St"
                />
                {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-white mb-2 uppercase">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20 ${errors.city ? 'border-2 border-red-500' : ''}`}
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-2 uppercase">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20 ${errors.state ? 'border-2 border-red-500' : ''}`}
                    placeholder="NY"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium text-white mb-2 uppercase">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className={`w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20 ${errors.zip ? 'border-2 border-red-500' : ''}`}
                    placeholder="10001"
                  />
                  {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-white mb-2 uppercase">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Handicap */}
          <div>
            <label className="block text-lg font-medium text-white mb-2 uppercase">
              Golf Handicap (Optional)
            </label>
            <input
              type="text"
              name="handicap"
              value={formData.handicap}
              onChange={handleChange}
              className="w-full bg-[#444444] rounded-xl pl-4 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/20"
              placeholder="e.g., 12.5 or +2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-[#444444] hover:bg-[#555555] text-white font-medium py-4 px-6 rounded-2xl transition-colors uppercase"
            >
              Back to Quiz
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#DAF612] hover:bg-[#c5e010] text-gray-900 font-medium py-4 px-6 rounded-2xl transition-colors uppercase"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
