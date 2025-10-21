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

    return `${labels[key] || key}: ${value}`;
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

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: this.recipientEmails.join(', '),
        subject: `OVVIO DTC - New Shaft Selection: ${userDetails.name}`,
        text: emailText,
      });

      console.log('✅ Notification email sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification email:', error);
      // Don't throw - we don't want email failures to break the submission
    }
  }
}
