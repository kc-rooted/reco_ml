import React from 'react';

function AppSimple() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          ⛳ Golf Shaft ML Training Admin
        </h1>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-green-500 text-gray-900 rounded-xl font-medium">
              Training
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium">
              Metrics
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium">
              Test Predictions
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium">
              Data Statistics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Training Panel</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Epochs</label>
                <input type="number" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" defaultValue="100" />
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-medium py-3 rounded-lg">
                Start Training
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Model Metrics</h2>
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">📊</div>
              <p>No training data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppSimple;