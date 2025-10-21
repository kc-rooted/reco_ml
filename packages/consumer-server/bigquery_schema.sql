-- BigQuery Schema for OVVIO DTC Shaft Recommendations
-- Project: gears-dtc
-- Dataset: shaft_recommendations

-- =============================================================================
-- 1. CUSTOMERS TABLE
-- =============================================================================
CREATE TABLE `gears-dtc.shaft_recommendations.customers` (
  customer_id STRING NOT NULL,
  name STRING NOT NULL,
  email STRING,
  phone STRING,

  -- Shipping Address
  shipping_street STRING NOT NULL,
  shipping_city STRING NOT NULL,
  shipping_state STRING NOT NULL,
  shipping_zip STRING NOT NULL,
  shipping_country STRING NOT NULL,

  -- Golf Info
  handicap FLOAT64,

  -- Metadata
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
OPTIONS(
  description="Customer information and shipping details"
);

-- =============================================================================
-- 2. RECOMMENDATIONS TABLE
-- =============================================================================
CREATE TABLE `gears-dtc.shaft_recommendations.recommendations` (
  recommendation_id STRING NOT NULL,

  -- Quiz Responses
  swing_speed STRING NOT NULL,
  current_shot_shape STRING NOT NULL,
  shot_shape_slider FLOAT64 NOT NULL,
  trajectory_slider FLOAT64 NOT NULL,
  feel_slider FLOAT64 NOT NULL,

  -- Current Driver Details
  current_driver_brand STRING NOT NULL,
  current_driver_model STRING NOT NULL,
  current_driver_shaft STRING NOT NULL,
  shaft_satisfaction INT64 NOT NULL, -- 0-10 scale

  -- ML Predictions (Top 3)
  recommendation_1_name STRING NOT NULL,
  recommendation_1_percentage FLOAT64 NOT NULL,
  recommendation_1_lime JSON, -- LIME explanation data

  recommendation_2_name STRING,
  recommendation_2_percentage FLOAT64,
  recommendation_2_lime JSON,

  recommendation_3_name STRING,
  recommendation_3_percentage FLOAT64,
  recommendation_3_lime JSON,

  -- All probabilities from model (for analysis)
  all_probabilities JSON NOT NULL, -- Array of all shaft probabilities

  -- Metadata
  model_version STRING,
  created_at TIMESTAMP NOT NULL
)
OPTIONS(
  description="ML-generated shaft recommendations with quiz data and LIME explanations"
);

-- =============================================================================
-- 3. ORDERS TABLE
-- =============================================================================
CREATE TABLE `gears-dtc.shaft_recommendations.orders` (
  order_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  recommendation_id STRING NOT NULL,

  -- Order Status
  status STRING NOT NULL, -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

  -- Timestamps
  ordered_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Notes
  notes STRING
)
OPTIONS(
  description="Orders linking customers to their shaft recommendations"
);

-- =============================================================================
-- INDEXES (Optional - BigQuery doesn't require explicit indexes)
-- =============================================================================
-- BigQuery automatically optimizes queries, but you can partition and cluster for performance

-- Example: Partition orders by date, cluster by status
-- CREATE TABLE `gears-dtc.shaft_recommendations.orders_partitioned`
-- PARTITION BY DATE(ordered_at)
-- CLUSTER BY status, customer_id
-- AS SELECT * FROM `gears-dtc.shaft_recommendations.orders`;

-- =============================================================================
-- SAMPLE QUERIES
-- =============================================================================

-- Get all orders with customer and recommendation details
-- SELECT
--   o.order_id,
--   o.status,
--   o.ordered_at,
--   c.name,
--   c.email,
--   r.recommendation_1_name,
--   r.recommendation_1_percentage,
--   r.current_driver_brand,
--   r.current_driver_model
-- FROM `gears-dtc.shaft_recommendations.orders` o
-- JOIN `gears-dtc.shaft_recommendations.customers` c ON o.customer_id = c.customer_id
-- JOIN `gears-dtc.shaft_recommendations.recommendations` r ON o.recommendation_id = r.recommendation_id
-- WHERE o.status = 'pending'
-- ORDER BY o.ordered_at DESC;

-- Get customer's order history
-- SELECT
--   o.order_id,
--   o.status,
--   o.ordered_at,
--   r.recommendation_1_name
-- FROM `gears-dtc.shaft_recommendations.orders` o
-- JOIN `gears-dtc.shaft_recommendations.recommendations` r ON o.recommendation_id = r.recommendation_id
-- WHERE o.customer_id = 'customer-uuid-here'
-- ORDER BY o.ordered_at DESC;

-- Analytics: Most recommended shafts
-- SELECT
--   recommendation_1_name as shaft_name,
--   COUNT(*) as times_recommended
-- FROM `gears-dtc.shaft_recommendations.recommendations`
-- GROUP BY recommendation_1_name
-- ORDER BY times_recommended DESC;

-- Analytics: Average satisfaction by shaft
-- SELECT
--   current_driver_shaft,
--   AVG(shaft_satisfaction) as avg_satisfaction,
--   COUNT(*) as count
-- FROM `gears-dtc.shaft_recommendations.recommendations`
-- GROUP BY current_driver_shaft
-- HAVING count > 5
-- ORDER BY avg_satisfaction DESC;
