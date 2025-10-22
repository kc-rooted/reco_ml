import nodemailer from 'nodemailer';
import { UserDetails } from './bigquery';
import { UserAnswers } from '@gears/core';

export interface DriverDetails {
  brand: string;
  model: string;
  currentShaft: string;
  shaftSatisfaction: number;
}

export interface ShaftRecommendation {
  name: string;
  percentage: number;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private recipientEmails: string[];

  constructor() {
    // Initialize email transporter
    // Using environment variables for configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Comma-separated list of recipient emails
    this.recipientEmails = (process.env.NOTIFICATION_EMAILS || '').split(',').filter(e => e.trim());
  }

  private formatQuizAnswer(key: string, value: any): string {
    const labels: { [key: string]: string } = {
      swing_speed: 'Swing Speed',
      current_shot_shape: 'Current Shot Shape',
      shot_shape_slider: 'Shot Shape Preference',
      trajectory_slider: 'Trajectory Preference',
      feel_slider: 'Feel Preference'
    };

    return `<strong>${labels[key] || key}:</strong> ${value}`;
  }

  private buildEmailText(
    userDetails: UserDetails,
    driverDetails: DriverDetails,
    quizAnswers: UserAnswers,
    recommendations: ShaftRecommendation[]
  ): string {
    return `
OVVIO DTC SHAFT SELECTIONS
=====================================

CUSTOMER INFORMATION
------------------------------------
Name: ${userDetails.name}
Email: ${userDetails.email || 'Not provided'}
Phone: ${userDetails.phone || 'Not provided'}
${userDetails.handicap ? `Handicap: ${userDetails.handicap}` : ''}

SHIPPING ADDRESS
------------------------------------
${userDetails.shippingAddress.street}
${userDetails.shippingAddress.city}, ${userDetails.shippingAddress.state} ${userDetails.shippingAddress.zip}
${userDetails.shippingAddress.country}

RECOMMENDED SHAFTS
------------------------------------
${recommendations.map((rec, idx) =>
  `#${idx + 1}: ${rec.name} - ${rec.percentage}% match probability`
).join('\n')}

CURRENT DRIVER DETAILS
------------------------------------
Brand: ${driverDetails.brand}
Model: ${driverDetails.model}
Current Shaft: ${driverDetails.currentShaft}
Shaft Satisfaction: ${driverDetails.shaftSatisfaction}/10

CUSTOMER SELECTIONS
------------------------------------
${Object.entries(quizAnswers).map(([key, value]) =>
  this.formatQuizAnswer(key, value)
).join('\n')}

=====================================
Timestamp: ${new Date().toISOString()}
    `.trim();
  }

  private buildEmailHTML(
    userDetails: UserDetails,
    driverDetails: DriverDetails,
    quizAnswers: UserAnswers,
    recommendations: ShaftRecommendation[]
  ): string {
    const logoSvg = `data:image/svg+xml;base64,${Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 2000 500">
  <defs>
    <style>
      .st0 {
        fill: #fff;
      }
    </style>
  </defs>
  <path class="st0" d="M329.53,198.87l-5.22-9.03s-9.47-15.35-3.51-39.55c5.99-30.53,11.99-25.01-10.67-38.09-22.67-13.11-14.89-10.66-38.33,9.78-17.96,17.26-36.01,16.73-36.01,16.73h-10.41s-18.04.53-36.01-16.73c-23.44-20.45-15.66-22.89-38.32-9.79-22.67,13.09-16.67,7.57-10.68,38.08,5.96,24.2-3.52,39.55-3.52,39.55l-5.13,8.9s-8.59,15.87-32.53,22.78c-29.43,10.03-27.64,2.07-27.67,28.25-.04,26.19-1.8,18.22,27.6,28.35,23.92,6.95,32.46,22.85,32.46,22.85l5.21,9.05s9.46,15.37,3.48,39.55c-6.02,30.53-12.02,25.01,10.65,38.12,22.65,13.09,14.86,10.66,38.32-9.76,17.99-17.26,36.03-16.7,36.03-16.7h10.43s18.03-.5,35.98,16.78c23.42,20.47,15.63,22.9,38.31,9.83,22.69-13.07,16.68-7.55,10.72-38.08-5.93-24.2,3.56-39.55,3.56-39.55l5.24-9.08s8.56-15.89,32.5-22.81c29.42-10.07,27.64-2.12,27.64-28.3,0-26.19,1.79-18.22-27.63-28.3-23.93-6.94-32.48-22.83-32.48-22.83M253.84,290.34c-22.27,12.88-50.78,5.23-63.64-17.06-12.86-22.29-5.24-50.78,17.05-63.65,22.28-12.86,50.77-5.23,63.65,17.06,12.87,22.29,5.24,50.79-17.06,63.65"/>
  <path class="st0" d="M478.58,281.07c0,60.96,34.21,75.36,91.75,75.36h76.78c71.9,0,102.95-2.87,102.95-62.7v-59.27h-143.21v43.15h79.38v6.05c0,20.15-16.69,22.73-33.36,22.73h-68.15c-32.24,0-40.56-7.78-40.56-43.43v-25.9c0-35.65,8.32-43.43,40.56-43.43h69.29c20.42,0,32.22,2.58,32.22,23.29h62.69v-6.59c0-40.58-10.06-66.75-82.53-66.75h-96.05c-57.53,0-91.75,14.38-91.75,75.36v62.15ZM788.76,354.11h231.52v-50.03h-167.68v-33.38h155.3v-43.15h-155.3v-33.36h163.93v-48.31h-227.77v208.23ZM1038.53,354.11h71.34l18.69-36.81h129.42l19.84,36.81h71.04l-114.46-208.23h-83.12l-112.76,208.23ZM1192.69,194.2l41.4,78.25h-81.66l40.26-78.25ZM1435.6,197.66h99.79c20.12,0,29.33,3.43,29.33,21.85v6.91c0,14.95-6.33,21.86-23.58,21.86h-105.54v-50.61ZM1371.75,354.11h63.85v-54.07h100.36c19.87,0,26.17,7.18,26.17,29.04v25.03h63.85v-35.37c0-34.24-15.82-42.59-34.81-46.02v-.58c29.35-6.9,35.67-23.3,35.67-51.2v-13.23c0-37.41-13.24-61.83-62.41-61.83h-192.68v208.23ZM1666.4,300.33c0,45.17,23.3,56.1,81.39,56.1h77.36c84.83,0,103.82-9.22,103.82-65.29,0-60.7-23.01-66.74-122.23-66.47-68.44.28-76.22-.27-76.22-18.4,0-11.22,9.79-16.1,24.16-16.1h70.75c29.33,0,31.06,6.33,31.06,21.57h63.85v-6.62c0-36.54-6.91-61.55-80.53-61.55h-89.15c-80.54,0-83.97,29.05-83.97,66.75,0,51.18,10.92,62.68,106.97,62.68,82.25,0,89.74,1.17,89.74,19.28,0,16.10-13.81,17.55-27.31,17.55h-78.24c-18.4,0-27.32-1.72-27.61-23.88h-63.84v14.38Z"/>
</svg>`).toString('base64')}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #010101; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Logo -->
    <div style="margin-bottom: 30px;">
      <img src="${logoSvg}" alt="GEARS Logo" style="width: 100px; height: auto; display: block;">
    </div>

    <!-- Title -->
    <div style="margin-bottom: 40px;">
      <h1 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 24px; margin: 0;">OVVIO DTC SHAFT SELECTIONS</h1>
    </div>

    <!-- Customer Information -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 0 0 10px 0;">CUSTOMER INFORMATION</h2>
      <div style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <div><strong>Name:</strong> ${userDetails.name}</div>
        <div><strong>Email:</strong> ${userDetails.email || 'Not provided'}</div>
        <div><strong>Phone:</strong> ${userDetails.phone || 'Not provided'}</div>
        ${userDetails.handicap ? `<div><strong>Handicap:</strong> ${userDetails.handicap}</div>` : ''}
      </div>
    </div>

    <!-- Shipping Address -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 0 0 10px 0;">SHIPPING ADDRESS</h2>
      <div style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <div>${userDetails.shippingAddress.street}</div>
        <div>${userDetails.shippingAddress.city}, ${userDetails.shippingAddress.state} ${userDetails.shippingAddress.zip}</div>
        <div>${userDetails.shippingAddress.country}</div>
      </div>
    </div>

    <!-- Recommended Shafts -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 0 0 10px 0;">RECOMMENDED SHAFTS</h2>
      <div style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        ${recommendations.map((rec, idx) => `
          <div style="margin-bottom: 8px;">
            <strong>#${idx + 1}: ${rec.name}</strong> - ${rec.percentage}% match probability
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Current Driver Details -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 0 0 10px 0;">CURRENT DRIVER DETAILS</h2>
      <div style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        <div><strong>Brand:</strong> ${driverDetails.brand}</div>
        <div><strong>Model:</strong> ${driverDetails.model}</div>
        <div><strong>Current Shaft:</strong> ${driverDetails.currentShaft}</div>
        <div><strong>Shaft Satisfaction:</strong> ${driverDetails.shaftSatisfaction}/10</div>
      </div>
    </div>

    <!-- Customer Selections -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #DAF612; font-family: Arial, sans-serif; font-weight: bold; text-transform: uppercase; font-size: 18px; margin: 0 0 10px 0;">CUSTOMER SELECTIONS</h2>
      <div style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        ${Object.entries(quizAnswers).map(([key, value]) => `
          <div>${this.formatQuizAnswer(key, value)}</div>
        `).join('')}
      </div>
    </div>

    <!-- Timestamp -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <div style="color: #888; font-family: Arial, sans-serif; font-size: 12px;">
        Timestamp: ${new Date().toISOString()}
      </div>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  async sendNotification(
    userDetails: UserDetails,
    driverDetails: DriverDetails,
    quizAnswers: UserAnswers,
    recommendations: ShaftRecommendation[]
  ): Promise<void> {
    try {
      if (!this.recipientEmails.length) {
        console.warn('⚠️  No notification emails configured. Skipping email notification.');
        return;
      }

      const emailText = this.buildEmailText(userDetails, driverDetails, quizAnswers, recommendations);
      const emailHTML = this.buildEmailHTML(userDetails, driverDetails, quizAnswers, recommendations);

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: this.recipientEmails.join(', '),
        subject: `OVVIO DTC - New Shaft Selection: ${userDetails.name}`,
        text: emailText, // Fallback for non-HTML email clients
        html: emailHTML, // HTML version
      });

      console.log('✅ Notification email sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification email:', error);
      // Don't throw - we don't want email failures to break the submission
    }
  }
}
