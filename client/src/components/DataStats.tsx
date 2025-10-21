import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import axios from 'axios';

const COLORS = ['#0c8919', '#f65d4a', '#9dc1d0', '#ffa726', '#ab47bc'];

export default function DataStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/training-data-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch training data stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#222222] rounded-3xl p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 uppercase">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#222222] rounded-3xl p-8">
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">📈</div>
          <p className="text-lg uppercase">No statistics available</p>
        </div>
      </div>
    );
  }

  const swingSpeedData = Object.entries(stats.swingSpeedDistribution).map(([key, value]) => ({
    name: key,
    value: value as number
  }));

  const shotShapeData = Object.entries(stats.shotShapeDistribution).map(([key, value]) => ({
    name: key,
    value: value as number
  }));

  const colorSeriesData = Object.entries(stats.colorSeriesDistribution).map(([key, value]) => ({
    name: key,
    value: value as number
  }));

  const shaftData = Object.entries(stats.shaftRecommendationCounts)
    .map(([key, value]) => ({
      name: key.replace('OVVIO ', ''),
      count: value as number
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#222222] rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-white uppercase">Training Data Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary-400/10 border border-primary-400/20 rounded-2xl p-6 text-center">
            <p className="text-primary-400 text-sm uppercase tracking-wider">Total Records</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.totalRecords.toLocaleString()}</p>
          </div>
          <div className="bg-blue-400/10 border border-blue-400/20 rounded-2xl p-6 text-center">
            <p className="text-blue-400 text-sm uppercase tracking-wider">Swing Speeds</p>
            <p className="text-3xl font-bold text-white mt-2">{Object.keys(stats.swingSpeedDistribution).length}</p>
          </div>
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 text-sm uppercase tracking-wider">Shot Shapes</p>
            <p className="text-3xl font-bold text-white mt-2">{Object.keys(stats.shotShapeDistribution).length}</p>
          </div>
          <div className="bg-purple-400/10 border border-purple-400/20 rounded-2xl p-6 text-center">
            <p className="text-purple-400 text-sm uppercase tracking-wider">Shaft Types</p>
            <p className="text-3xl font-bold text-white mt-2">{Object.keys(stats.shaftRecommendationCounts).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Swing Speed Distribution */}
        <div className="bg-[#222222] rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-white uppercase">Swing Speed Distribution</h3>
          <div className="bg-gray-700/20 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={swingSpeedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {swingSpeedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shot Shape Distribution */}
        <div className="bg-[#222222] rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-white uppercase">Shot Shape Distribution</h3>
          <div className="bg-gray-700/20 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shotShapeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
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
                />
                <Bar 
                  dataKey="value" 
                  fill="#0c8919"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Color Series Distribution */}
        <div className="bg-[#222222] rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-white uppercase">Color Series Distribution</h3>
          <div className="bg-gray-700/20 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={colorSeriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colorSeriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shaft Recommendation Counts */}
        <div className="bg-[#222222] rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-6 text-white uppercase">Shaft Recommendation Frequency</h3>
          <div className="bg-gray-700/20 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shaftData.slice(0, 8)} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  formatter={(value: number) => [value, 'Recommendations']}
                />
                <Bar 
                  dataKey="count" 
                  fill="#F6E71D"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Shaft List */}
      <div className="bg-[#222222] rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-6 text-white uppercase">All Shaft Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shaftData.map((shaft, index) => (
            <div key={index} className="bg-gray-700/30 rounded-xl p-4 flex justify-between items-center">
              <span className="font-medium text-white">{shaft.name}</span>
              <span className="bg-secondary-400 text-dark-950 px-2 py-1 rounded-lg text-sm font-semibold">
                {shaft.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}