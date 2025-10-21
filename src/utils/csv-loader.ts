import * as fs from 'fs';
import * as Papa from 'papaparse';
import { TrainingRecord } from '../types';

export function loadCSVData(filePath: string): TrainingRecord[] {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    
    const parseResult = Papa.parse<TrainingRecord>(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
    }
    
    console.log(`📁 Loaded ${parseResult.data.length} records from ${filePath}`);
    return parseResult.data;
  } catch (error) {
    console.error(`Failed to load CSV file: ${filePath}`, error);
    throw error;
  }
}

export function validateTrainingData(data: TrainingRecord[]): boolean {
  if (data.length === 0) {
    console.error('No training data found');
    return false;
  }

  const requiredFields = [
    'swing_speed',
    'current_shot_shape',
    'shot_shape_slider',
    'trajectory_slider',
    'feel_slider',
    'recommended_shaft_1',
    'recommended_shaft_2'
  ];

  const invalidRecords = data.filter((record, index) => {
    const missingFields = requiredFields.filter(field => 
      record[field as keyof TrainingRecord] === undefined || 
      record[field as keyof TrainingRecord] === null
    );
    
    if (missingFields.length > 0) {
      console.error(`Record ${index} missing fields:`, missingFields);
      return true;
    }
    return false;
  });

  if (invalidRecords.length > 0) {
    console.error(`Found ${invalidRecords.length} invalid records`);
    return false;
  }

  return true;
}