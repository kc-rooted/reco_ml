import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrainingPanel from './components/TrainingPanel';
import ModelMetrics from './components/ModelMetrics';
import PredictionTester from './components/PredictionTester';
import DataStats from './components/DataStats';
import QuizDesign from './components/QuizDesign';
import { useSocket } from './hooks/useSocket';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div {...other} className={`${value !== index ? 'hidden' : ''}`}>
      {value === index && <div className="p-6">{children}</div>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [modelInfo, setModelInfo] = useState<any>(null);
  
  const socket = useSocket('http://localhost:3001');

  // Load existing training history on app start
  useEffect(() => {
    const loadModelInfo = async () => {
      try {
        const response = await axios.get('/api/model-info');
        const data = response.data;
        
        if (data.trainingHistory && data.trainingHistory.length > 0) {
          setTrainingHistory(data.trainingHistory);
          setModelInfo(data);
          console.log(`Loaded persisted training history: ${data.trainingHistory.length} epochs`);
        }
      } catch (error) {
        console.log('No existing model info to load');
      }
    };
    
    loadModelInfo();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('training:started', (data) => {
      setIsTraining(true);
      setTrainingHistory([]);
      console.log('Training started:', data);
    });

    socket.on('training:epoch', (data) => {
      setTrainingHistory(prev => [...prev, data]);
    });

    socket.on('training:completed', (data) => {
      setIsTraining(false);
      console.log('Training completed with data:', data);
      
      // Set training history from the completed data
      if (data.history && Array.isArray(data.history)) {
        setTrainingHistory(data.history);
        console.log(`Updated training history with ${data.history.length} epochs`);
      }
      
      setModelInfo(data);
    });

    socket.on('training:error', (data) => {
      setIsTraining(false);
      console.error('Training error:', data);
    });

    return () => {
      socket.off('training:started');
      socket.off('training:epoch');
      socket.off('training:completed');
      socket.off('training:error');
    };
  }, [socket]);

  const tabs = [
    { label: 'Training', id: 'training' },
    { label: 'Metrics', id: 'metrics' },
    { label: 'Data Statistics', id: 'stats' },
    { label: 'Test Predictions', id: 'predictions' },
    { label: 'Quiz Design', id: 'quiz' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase">
        GEARS RECOMMENDATION ML TRAINING
      </h1>
      
      <div className="bg-[#222222] rounded-3xl p-8 mb-6">
        <div className="flex space-x-2 justify-center">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setTabValue(index)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors uppercase ${
                tabValue === index
                  ? 'bg-[#DAF612] text-gray-900'
                  : 'bg-[#444444] text-white hover:bg-[#555555]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <TabPanel value={tabValue} index={0}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <TrainingPanel 
              isTraining={isTraining}
              onTrainingComplete={(info) => setModelInfo(info)}
            />
          </div>
          <div>
            <ModelMetrics 
              trainingHistory={trainingHistory}
              isTraining={isTraining}
            />
          </div>
        </div>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ModelMetrics 
          trainingHistory={trainingHistory}
          isTraining={isTraining}
          fullView={true}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <DataStats />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <PredictionTester />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <QuizDesign />
      </TabPanel>
    </div>
  );
}

export default App;