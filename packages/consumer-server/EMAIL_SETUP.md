# Email Notification Setup

The consumer server now sends email notifications when customers submit their shaft selections.

## Email Content

The notification emails include:

1. **Headline**: OVVIO DTC SHAFT SELECTIONS
2. **Customer Information**: Name, email, phone, handicap
3. **Shipping Address**: Full shipping details
4. **Recommended Shafts**: Top recommendations with match probability percentages
5. **Current Driver Details**: Brand, model, current shaft, satisfaction rating
6. **Customer Selections**: All 5 quiz responses

## Configuration

Create a `.env` file in `packages/consumer-server/` with the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
NOTIFICATION_EMAILS=recipient1@example.com,recipient2@example.com
```

### Gmail Setup

If using Gmail:

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app-specific password
4. Use that password in `SMTP_PASS`

### Multiple Recipients

To send notifications to multiple people, list them comma-separated in `NOTIFICATION_EMAILS`:

```
NOTIFICATION_EMAILS=person1@example.com,person2@example.com,person3@example.com
```

## Testing

The email service will gracefully handle failures - if email sending fails, the submission will still succeed and save to BigQuery. Email errors are logged but don't break the user experience.

## Email Format

Plain text format for now (can be upgraded to HTML later). Example:

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

=====================================
Timestamp: 2025-10-21T18:58:36.101Z
```
