import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

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

export interface DriverDetails {
  brand: string;
  model: string;
  currentShaft: string;
  shaftSatisfaction: number;
}

export class BigQueryService {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string;

  constructor() {
    // Initialize BigQuery client with gears-dtc project
    // Support both env var JSON (for containers) and file path (for local dev)
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      : undefined;

    this.bigquery = new BigQuery({
      projectId: 'gears-dtc',
      ...(credentials && { credentials }),
    });

    this.projectId = 'gears-dtc';
    this.datasetId = 'shaft_recommendations';
  }

  async saveRecommendation(
    userDetails: UserDetails,
    driverDetails: DriverDetails,
    quizAnswers: any,
    recommendations: any[],
    allProbabilities: number[],
    explanations?: any[]
  ): Promise<{ customerId: string; recommendationId: string; orderId: string }> {
    try {
      const customerId = uuidv4();
      const recommendationId = uuidv4();
      const orderId = uuidv4();
      const now = new Date().toISOString();

      // 1. Insert into customers table
      const customerRow = {
        customer_id: customerId,
        name: userDetails.name,
        email: userDetails.email || null,
        phone: userDetails.phone || null,
        shipping_street: userDetails.shippingAddress.street,
        shipping_city: userDetails.shippingAddress.city,
        shipping_state: userDetails.shippingAddress.state,
        shipping_zip: userDetails.shippingAddress.zip,
        shipping_country: userDetails.shippingAddress.country,
        handicap: userDetails.handicap || null,
        created_at: now,
        updated_at: now
      };

      await this.bigquery
        .dataset(this.datasetId)
        .table('customers')
        .insert([customerRow]);

      // 2. Insert into recommendations table
      const recommendationRow = {
        recommendation_id: recommendationId,

        // Quiz responses
        swing_speed: quizAnswers.swing_speed,
        current_shot_shape: quizAnswers.current_shot_shape,
        shot_shape_slider: quizAnswers.shot_shape_slider,
        trajectory_slider: quizAnswers.trajectory_slider,
        feel_slider: quizAnswers.feel_slider,

        // Driver details
        current_driver_brand: driverDetails.brand,
        current_driver_model: driverDetails.model,
        current_driver_shaft: driverDetails.currentShaft,
        shaft_satisfaction: driverDetails.shaftSatisfaction,

        // Top 3 recommendations with LIME
        recommendation_1_name: recommendations[0]?.name || '',
        recommendation_1_percentage: recommendations[0]?.percentage || 0,
        recommendation_1_lime: explanations?.[0] ? JSON.stringify(explanations[0]) : null,

        recommendation_2_name: recommendations[1]?.name || null,
        recommendation_2_percentage: recommendations[1]?.percentage || null,
        recommendation_2_lime: explanations?.[1] ? JSON.stringify(explanations[1]) : null,

        recommendation_3_name: recommendations[2]?.name || null,
        recommendation_3_percentage: recommendations[2]?.percentage || null,
        recommendation_3_lime: explanations?.[2] ? JSON.stringify(explanations[2]) : null,

        // All probabilities
        all_probabilities: JSON.stringify(allProbabilities),

        // Metadata
        model_version: 'latest',
        created_at: now
      };

      await this.bigquery
        .dataset(this.datasetId)
        .table('recommendations')
        .insert([recommendationRow]);

      // 3. Insert into orders table
      const orderRow = {
        order_id: orderId,
        customer_id: customerId,
        recommendation_id: recommendationId,
        status: 'pending',
        ordered_at: now,
        updated_at: now,
        shipped_at: null,
        delivered_at: null,
        notes: null
      };

      await this.bigquery
        .dataset(this.datasetId)
        .table('orders')
        .insert([orderRow]);

      console.log('✅ Successfully saved to BigQuery:');
      console.log(`   Customer ID: ${customerId}`);
      console.log(`   Recommendation ID: ${recommendationId}`);
      console.log(`   Order ID: ${orderId}`);

      return { customerId, recommendationId, orderId };
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
        console.log(`⚠️  Dataset ${this.datasetId} does not exist. Please create it manually using the SQL schema.`);
        return;
      }

      // Check if tables exist
      const [customersExists] = await dataset.table('customers').exists();
      const [recommendationsExists] = await dataset.table('recommendations').exists();
      const [ordersExists] = await dataset.table('orders').exists();

      if (!customersExists || !recommendationsExists || !ordersExists) {
        console.log('⚠️  One or more tables missing. Please run the SQL schema in bigquery_schema.sql');
        console.log(`   Customers table exists: ${customersExists}`);
        console.log(`   Recommendations table exists: ${recommendationsExists}`);
        console.log(`   Orders table exists: ${ordersExists}`);
      } else {
        console.log('✅ All BigQuery tables exist');
      }
    } catch (error) {
      console.error('Error checking BigQuery tables:', error);
      throw error;
    }
  }
}
