# Deployment Guide - Portainer

This guide explains how to deploy the consumer server to Portainer using a GitHub repository.

## Prerequisites

1. GitHub repository created and pushed
2. Portainer instance running
3. Google service account JSON key file
4. Brevo SMTP credentials

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Add and commit files
git add .
git commit -m "Initial commit - OVVIO DTC Consumer Server"

# Push to GitHub
git push -u origin master
```

## Step 2: Create Stack in Portainer

1. Log in to Portainer
2. Go to **Stacks** → **Add stack**
3. Name: `ovvio-dtc-consumer`
4. Build method: **Git Repository**
5. Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO`
6. Repository reference: `refs/heads/master`
7. Compose path: `docker-compose.yml`

## Step 3: Configure Environment Variables

In the Portainer stack creation page, add these environment variables:

### Required Environment Variables

```env
# Google BigQuery Service Account (IMPORTANT: Paste entire JSON as single line)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"gears-dtc",...}

# Brevo SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=99c5d7001@smtp-brevo.com
SMTP_PASS=sqyJ2FpEOPWRfVxh
SMTP_FROM=kane@rootedsolutions.co
NOTIFICATION_EMAILS=kane@rootedsolutions.co
```

### How to Get Google Service Account JSON

The service account JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "gears-dtc",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**To convert to environment variable:**

1. Open the JSON file (e.g., `intelligence-451803-d74c2e347403.json`)
2. Copy the entire contents
3. Minify it to a single line (remove newlines and extra spaces)
4. Or use this command:
   ```bash
   cat intelligence-451803-d74c2e347403.json | jq -c .
   ```
5. Paste the single-line JSON as the value for `GOOGLE_SERVICE_ACCOUNT_JSON`

## Step 4: Deploy

1. Click **Deploy the stack**
2. Wait for the build to complete
3. Monitor logs in Portainer

## Step 5: Verify Deployment

Check the container logs for:

```
✅ Model loaded from: file://../../models/latest/model.json
✅ All BigQuery tables exist
✅ BigQuery initialized
🚀 Consumer server running on http://localhost:3002
```

## Step 6: Configure Reverse Proxy (Optional)

If you want to expose the service publicly:

1. Set up nginx reverse proxy in Portainer
2. Point domain to server
3. Configure SSL with Let's Encrypt

Example nginx config:

```nginx
server {
    listen 80;
    server_name consumer.ovvio.example.com;

    location / {
        proxy_pass http://consumer-server:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Container fails to start

**Check logs**: `docker logs <container_id>`

Common issues:
- Missing environment variables
- Invalid JSON in `GOOGLE_SERVICE_ACCOUNT_JSON`
- Model files not found

### BigQuery errors

```
Error: Could not load the default credentials
```
- Check that `GOOGLE_SERVICE_ACCOUNT_JSON` is set correctly
- Verify the JSON is valid (use `jq` to validate)
- Ensure service account has BigQuery permissions

### Email errors

```
Invalid login: 535-5.7.8 Username and Password not accepted
```
- Verify SMTP credentials
- Ensure `SMTP_FROM` email is verified in Brevo

## Updating the Stack

To update the deployed stack:

1. Push changes to GitHub
2. In Portainer: Go to stack → Click **Pull and redeploy**
3. Or use the webhook for auto-deploy

## Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google service account credentials (minified JSON) | `{"type":"service_account",...}` |
| `SMTP_HOST` | SMTP server hostname | `smtp-relay.brevo.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `99c5d7001@smtp-brevo.com` |
| `SMTP_PASS` | SMTP password | `sqyJ2FpEOPWRfVxh` |
| `SMTP_FROM` | Sender email (must be verified in Brevo) | `kane@rootedsolutions.co` |
| `NOTIFICATION_EMAILS` | Comma-separated list of recipient emails | `kane@rootedsolutions.co` |

## Testing Endpoints

Once deployed, test the endpoints:

```bash
# Health check
curl https://your-domain.com/health

# Test email (sends sample email)
curl -X POST https://your-domain.com/api/test-email

# Make prediction
curl -X POST https://your-domain.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{"userAnswers": {...}}'
```
