import React, { useState } from 'react';
import axios from 'axios';

interface TrainingPanelProps {
  isTraining: boolean;
  onTrainingComplete: (modelInfo: any) => void;
}

export default function TrainingPanel({ isTraining, onTrainingComplete }: TrainingPanelProps) {
  const [config, setConfig] = useState({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    dropoutRate: 0.3,
    hiddenUnits1: 32,
    hiddenUnits2: 16,
    validationSplit: 0.2,
    patience: 15
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTrain = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post('/api/train', {
        modelConfig: {
          hiddenUnits: [config.hiddenUnits1, config.hiddenUnits2],
          dropoutRate: config.dropoutRate,
          learningRate: config.learningRate
        },
        trainingConfig: {
          epochs: config.epochs,
          batchSize: config.batchSize,
          validationSplit: config.validationSplit,
          patience: config.patience
        }
      });
      
      setSuccess('Training started successfully!');
      onTrainingComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start training');
    }
  };

  return (
    <div className="bg-[#222222] rounded-3xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-white uppercase">Training Configuration</h2>
      
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-xl p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 rounded-xl p-4 mb-6">
          <p className="text-green-200">{success}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Epochs
            </label>
            <input
              type="number"
              value={config.epochs}
              onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
              disabled={isTraining}
              className="w-full bg-[#444444] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Batch Size
            </label>
            <input
              type="number"
              value={config.batchSize}
              onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
              disabled={isTraining}
              className="w-full bg-[#444444] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Learning Rate: {config.learningRate}
            </label>
            <input
              type="range"
              min={0.0001}
              max={0.01}
              step={0.0001}
              value={config.learningRate}
              onChange={(e) => setConfig({ ...config, learningRate: parseFloat(e.target.value) })}
              disabled={isTraining}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Dropout Rate: {config.dropoutRate}
            </label>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.1}
              value={config.dropoutRate}
              onChange={(e) => setConfig({ ...config, dropoutRate: parseFloat(e.target.value) })}
              disabled={isTraining}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Hidden Units 1
            </label>
            <input
              type="number"
              value={config.hiddenUnits1}
              onChange={(e) => setConfig({ ...config, hiddenUnits1: parseInt(e.target.value) })}
              disabled={isTraining}
              className="w-full bg-[#444444] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Hidden Units 2
            </label>
            <input
              type="number"
              value={config.hiddenUnits2}
              onChange={(e) => setConfig({ ...config, hiddenUnits2: parseInt(e.target.value) })}
              disabled={isTraining}
              className="w-full bg-[#444444] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Validation Split: {config.validationSplit}
            </label>
            <input
              type="range"
              min={0.1}
              max={0.5}
              step={0.05}
              value={config.validationSplit}
              onChange={(e) => setConfig({ ...config, validationSplit: parseFloat(e.target.value) })}
              disabled={isTraining}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#fff] mb-2 uppercase">
              Patience
            </label>
            <input
              type="number"
              value={config.patience}
              onChange={(e) => setConfig({ ...config, patience: parseInt(e.target.value) })}
              disabled={isTraining}
              className="w-full bg-[#444444] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
        
        <button
          onClick={handleTrain}
          disabled={isTraining}
          className="w-full bg-[#DAF612] hover:bg-[#c5e010] disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 uppercase"
        >
          {isTraining ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-900 border-opacity-30 border-t-gray-900 rounded-full animate-spin"></div>
              <span>Training in Progress...</span>
            </>
          ) : (
            <span>Start Training</span>
          )}
        </button>
      </div>
    </div>
  );
}