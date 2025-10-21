import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ModelMetricsProps {
  trainingHistory: any[];
  isTraining: boolean;
  fullView?: boolean;
}

export default function ModelMetrics({ trainingHistory, isTraining, fullView = false }: ModelMetricsProps) {
  const latestMetrics = trainingHistory[trainingHistory.length - 1];
  
  const chartHeight = fullView ? 500 : 350;

  return (
    <div className="bg-[#222222] rounded-3xl p-8">
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold text-white uppercase">Model Metrics</h2>
        {isTraining && (
          <span className="bg-primary-400 text-dark-950 px-3 py-1 rounded-full text-sm font-medium">
            Training
          </span>
        )}
      </div>
      
      {trainingHistory.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg uppercase">No training data available</p>
          <p className="text-sm uppercase">Start training to see metrics</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current Metrics */}
          {latestMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700/30 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Epoch</p>
                <p className="text-2xl font-bold text-primary-400">{latestMetrics.epoch}</p>
              </div>
              <div className="bg-gray-700/30 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Loss</p>
                <p className="text-2xl font-bold text-red-400">
                  {latestMetrics.loss?.toFixed(4) || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-700/30 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Val Loss</p>
                <p className="text-2xl font-bold text-orange-400">
                  {latestMetrics.val_loss?.toFixed(4) || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-700/30 rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-sm">Val Binary Accuracy</p>
                <p className="text-2xl font-bold text-green-400">
                  {(latestMetrics.val_binaryAccuracy || latestMetrics.val_accuracy) ? `${((latestMetrics.val_binaryAccuracy || latestMetrics.val_accuracy) * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          )}
          
          {/* Training Chart */}
          <div className="bg-gray-700/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-white uppercase">Training Progress</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="epoch" 
                  stroke="#9CA3AF"
                  fontSize={12}
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
                  formatter={(value: number, name: string) => [
                    typeof value === 'number' ? value.toFixed(4) : value,
                    name === 'loss' ? 'Training Loss' :
                    name === 'val_loss' ? 'Validation Loss' :
                    name === 'binaryAccuracy' ? 'Training Binary Accuracy' :
                    name === 'val_binaryAccuracy' ? 'Validation Binary Accuracy' :
                    name === 'accuracy' ? 'Training Accuracy' :
                    name === 'val_accuracy' ? 'Validation Accuracy' : name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Training Loss"
                  dot={{ fill: '#EF4444', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="val_loss" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  name="Validation Loss"
                  dot={{ fill: '#F97316', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, stroke: '#F97316', strokeWidth: 2 }}
                />
                {trainingHistory.some(h => h.binaryAccuracy || h.accuracy) && (
                  <Line 
                    type="monotone" 
                    dataKey={trainingHistory.some(h => h.binaryAccuracy) ? "binaryAccuracy" : "accuracy"} 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name={trainingHistory.some(h => h.binaryAccuracy) ? "Training Binary Accuracy" : "Training Accuracy"}
                    dot={{ fill: '#10B981', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
                  />
                )}
                {trainingHistory.some(h => h.val_binaryAccuracy || h.val_accuracy) && (
                  <Line 
                    type="monotone" 
                    dataKey={trainingHistory.some(h => h.val_binaryAccuracy) ? "val_binaryAccuracy" : "val_accuracy"} 
                    stroke="#66BB6A" 
                    strokeWidth={2}
                    name={trainingHistory.some(h => h.val_binaryAccuracy) ? "Validation Binary Accuracy" : "Validation Accuracy"}
                    dot={{ fill: '#66BB6A', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, stroke: '#66BB6A', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Training Summary */}
          {!isTraining && trainingHistory.length > 0 && (
            <div className="bg-gray-700/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-white uppercase">Training Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Epochs: <span className="text-white font-medium">{trainingHistory.length}</span></p>
                  <p className="text-gray-400">Best Val Loss: <span className="text-orange-400 font-medium">
                    {Math.min(...trainingHistory.map(h => h.val_loss || Infinity)).toFixed(4)}
                  </span></p>
                </div>
                <div>
                  <p className="text-gray-400">Final Loss: <span className="text-red-400 font-medium">{latestMetrics?.loss?.toFixed(4) || 'N/A'}</span></p>
                  <p className="text-gray-400">Best Val Binary Accuracy: <span className="text-green-400 font-medium">
                    {trainingHistory.some(h => h.val_binaryAccuracy || h.val_accuracy) 
                      ? `${(Math.max(...trainingHistory.map(h => h.val_binaryAccuracy || h.val_accuracy || 0)) * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}