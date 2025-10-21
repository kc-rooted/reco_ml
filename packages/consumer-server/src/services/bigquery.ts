import { BigQuery } from '@google-cloud/bigquery';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserDetails {
  name: string;
  email?: string;
  phone?: string;
  shippingAddress: ShippingAddress;
  handicap?: number;
}

export interface ConsumerSubmission {
  // User Details
  name: string;
  email?: string;
  phone?: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  handicap?: number;

  // Quiz Responses
  swingSpeed: string;
  currentShotShape: string;
  shotShapeSlider: number;
  trajectorySlider: number;
  feelSlider: number;

  // Recommendations (with percentages)
  recommendation1Name: string;
  recommendation1Percentage: number;
  recommendation2Name?: string;
  recommendation2Percentage?: number;
  recommendation3Name?: string;
  recommendation3Percentage?: number;
  allProbabilities: string; // JSON string of all probabilities

  // Metadata
  timestamp: string;
  sessionId: string;
  modelVersion?: string;
}

export class BigQueryService {
  private bigquery: BigQuery;
  private datasetId: string;
  private tableId: string;

  constructor() {
    // Initialize BigQuery client
    // Credentials will be automatically loaded from GOOGLE_APPLICATION_CREDENTIALS env var
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
    });

    this.datasetId = process.env.BQ_DATASET_ID || 'shaft_recommendations';
    this.tableId = process.env.BQ_TABLE_ID || 'consumer_submissions';
  }

  async saveRecommendation(
    userDetails: UserDetails,
    quizAnswers: any,
    recommendations: any[],
    allProbabilities: number[],
    sessionId: string
  ): Promise<void> {
    try {
      const row: ConsumerSubmission = {
        // User details
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        shippingStreet: userDetails.shippingAddress.street,
        shippingCity: userDetails.shippingAddress.city,
        shippingState: userDetails.shippingAddress.state,
        shippingZip: userDetails.shippingAddress.zip,
        shippingCountry: userDetails.shippingAddress.country,
        handicap: userDetails.handicap,

        // Quiz answers
        swingSpeed: quizAnswers.swing_speed,
        currentShotShape: quizAnswers.current_shot_shape,
        shotShapeSlider: quizAnswers.shot_shape_slider,
        trajectorySlider: quizAnswers.trajectory_slider,
        feelSlider: quizAnswers.feel_slider,

        // Recommendations
        recommendation1Name: recommendations[0]?.name || '',
        recommendation1Percentage: recommendations[0]?.percentage || 0,
        recommendation2Name: recommendations[1]?.name,
        recommendation2Percentage: recommendations[1]?.percentage,
        recommendation3Name: recommendations[2]?.name,
        recommendation3Percentage: recommendations[2]?.percentage,
        allProbabilities: JSON.stringify(allProbabilities),

        // Metadata
        timestamp: new Date().toISOString(),
        sessionId,
        modelVersion: 'latest'
      };

      await this.bigquery
        .dataset(this.datasetId)
        .table(this.tableId)
        .insert([row]);

      console.log('✅ Successfully saved recommendation to BigQuery');
    } catch (error) {
      console.error('❌ Error saving to BigQuery:', error);
      throw new Error('Failed to save recommendation data');
    }
  }

  async initializeTable(): Promise<void> {
    try {
      const dataset = this.bigquery.dataset(this.datasetId);
      const [datasetExists] = await dataset.exists();

      if (!datasetExists) {
        await this.bigquery.createDataset(this.datasetId);
        console.log(`Created dataset: ${this.datasetId}`);
      }

      const table = dataset.table(this.tableId);
      const [tableExists] = await table.exists();

      if (!tableExists) {
        const schema = [
          { name: 'name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'email', type: 'STRING', mode: 'NULLABLE' },
          { name: 'phone', type: 'STRING', mode: 'NULLABLE' },
          { name: 'shippingStreet', type: 'STRING', mode: 'REQUIRED' },
          { name: 'shippingCity', type: 'STRING', mode: 'REQUIRED' },
          { name: 'shippingState', type: 'STRING', mode: 'REQUIRED' },
          { name: 'shippingZip', type: 'STRING', mode: 'REQUIRED' },
          { name: 'shippingCountry', type: 'STRING', mode: 'REQUIRED' },
          { name: 'handicap', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'swingSpeed', type: 'STRING', mode: 'REQUIRED' },
          { name: 'currentShotShape', type: 'STRING', mode: 'REQUIRED' },
          { name: 'shotShapeSlider', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'trajectorySlider', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'feelSlider', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'recommendation1Name', type: 'STRING', mode: 'REQUIRED' },
          { name: 'recommendation1Percentage', type: 'FLOAT', mode: 'REQUIRED' },
          { name: 'recommendation2Name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'recommendation2Percentage', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'recommendation3Name', type: 'STRING', mode: 'NULLABLE' },
          { name: 'recommendation3Percentage', type: 'FLOAT', mode: 'NULLABLE' },
          { name: 'allProbabilities', type: 'STRING', mode: 'REQUIRED' },
          { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
          { name: 'sessionId', type: 'STRING', mode: 'REQUIRED' },
          { name: 'modelVersion', type: 'STRING', mode: 'NULLABLE' }
        ];

        await dataset.createTable(this.tableId, { schema });
        console.log(`Created table: ${this.tableId}`);
      }
    } catch (error) {
      console.error('Error initializing BigQuery table:', error);
      throw error;
    }
  }
}
