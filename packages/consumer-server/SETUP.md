# Consumer Server Setup Guide

## Overview

The consumer server handles:
1. **ML Predictions** - Generates shaft recommendations using TensorFlow
2. **BigQuery Storage** - Saves customer data, recommendations, and orders to three tables
3. **Email Notifications** - Sends notification emails when customers submit

## BigQuery Setup

### 1. Create Tables

Run the SQL in `bigquery_schema.sql` in BigQuery Console:

```bash
# Option 1: Via BigQuery Console
# - Open https://console.cloud.google.com/bigquery
# - Select project: gears-dtc
# - Copy/paste SQL from bigquery_schema.sql
# - Run each CREATE TABLE statement

# Option 2: Via bq command line
cd packages/consumer-server
bq query --project_id=gears-dtc < bigquery_schema.sql
```

This creates three tables:
- `gears-dtc.shaft_recommendations.customers`
- `gears-dtc.shaft_recommendations.recommendations`
- `gears-dtc.shaft_recommendations.orders`

### 2. Configure Service Account

The server uses the same service account credentials you have access to.

Create a `.env` file in `packages/consumer-server/`:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

The BigQuery service is hardcoded to use:
- **Project**: `gears-dtc`
- **Dataset**: `shaft_recommendations`

## Email Setup

### Option 1: Gmail (Local Development Only)

1. Enable 2FA on your Google account
2. Create app password: https://myaccount.google.com/apppasswords
3. Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
NOTIFICATION_EMAILS=person1@example.com,person2@example.com
```

### Option 2: SendGrid (Recommended for Production)

1. Sign up: https://sendgrid.com (Free: 100 emails/day)
2. Create API key
3. Add to `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@yourdomain.com
NOTIFICATION_EMAILS=person1@example.com,person2@example.com
```

### Option 3: AWS SES (Best for High Volume)

1. Set up AWS SES
2. Add to `.env`:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
SMTP_FROM=your-verified-sender@yourdomain.com
NOTIFICATION_EMAILS=person1@example.com,person2@example.com
```

## Email Content

The notification email includes:

```
OVVIO DTC SHAFT SELECTIONS
=====================================

CUSTOMER INFORMATION
------------------------------------
Name: John Doe
Email: john@example.com
Phone: 555-1234
Handicap: 10

SHIPPING ADDRESS
------------------------------------
123 Main St
City, ST 12345
USA

RECOMMENDED SHAFTS
------------------------------------
#1: Blue 65 - 45% match probability
#2: Red 75 - 30% match probability

CURRENT DRIVER DETAILS
------------------------------------
Brand: TaylorMade
Model: Stealth 2
Current Shaft: Project X 6.0
Shaft Satisfaction: 7/10

CUSTOMER SELECTIONS
------------------------------------
Swing Speed: 96-105
Current Shot Shape: straight
Shot Shape Preference: 0
Trajectory Preference: 0.5
Feel Preference: -0.3
```

## Running the Server

```bash
# Development
npm run dev:consumer

# Production
npm run build -w @gears/consumer-server
npm start -w @gears/consumer-server
```

The server runs on **http://localhost:3002**

## API Endpoints

### POST /api/predict
Generates shaft recommendations from quiz answers.

### POST /api/submit
Saves complete submission to BigQuery and sends email notifications.

Expected payload:
```json
{
  "userDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "City",
      "state": "ST",
      "zip": "12345",
      "country": "USA"
    },
    "handicap": 10
  },
  "driverDetails": {
    "brand": "TaylorMade",
    "model": "Stealth 2",
    "currentShaft": "Project X 6.0",
    "shaftSatisfaction": 7
  },
  "quizAnswers": {
    "swing_speed": "96-105",
    "current_shot_shape": "straight",
    "shot_shape_slider": 0,
    "trajectory_slider": 0.5,
    "feel_slider": -0.3
  },
  "recommendations": [
    { "name": "Blue 65", "percentage": 45 },
    { "name": "Red 75", "percentage": 30 }
  ],
  "allProbabilities": [0.45, 0.30, 0.15, ...]
}
```

## Verification

After setup, check:

1. **BigQuery Tables Created**:
   ```bash
   bq ls gears-dtc:shaft_recommendations
   ```

2. **Server Starts Without Errors**:
   ```bash
   npm run dev:consumer
   # Should see: ✅ All BigQuery tables exist
   # Should see: 🚀 Consumer server running on http://localhost:3002
   ```

3. **Test Submission** (after completing a quiz in the UI):
   - Fill out checkout form
   - Submit
   - Check BigQuery for new rows in all 3 tables
   - Check email inbox for notification

## Troubleshooting

### BigQuery Errors

```
Error: Could not load the default credentials
```
**Solution**: Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

```
⚠️ One or more tables missing
```
**Solution**: Run the SQL schema in BigQuery Console

### Email Errors

```
⚠️ No notification emails configured
```
**Solution**: Set `NOTIFICATION_EMAILS` in `.env`

```
Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: Use app-specific password for Gmail, not your regular password

## Data Flow

1. User completes quiz → Gets recommendations
2. User clicks "Next Step" → Goes to checkout form
3. User fills out personal/shipping info + driver details
4. User submits form →
   - Frontend sends all data to `/api/submit`
   - Server inserts into BigQuery (3 tables with UUIDs)
   - Server sends notification email
   - Returns success with customer/recommendation/order IDs
5. User sees success screen
