# CryptoGate - Complete Installation Guide

Welcome to CryptoGate! This guide will walk you through the complete setup process for the Crypto Payment Gateway API.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Setup (5 minutes)](#quick-setup)
3. [Detailed Installation](#detailed-installation)
4. [Environment Configuration](#environment-configuration)
5. [Testing the API](#testing-the-api)
6. [Webhook Setup](#webhook-setup)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## ⚙️ System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0+ OR **pnpm**: 8.0.0+ (recommended)
- **RAM**: 2GB minimum
- **Disk Space**: 1GB for dependencies
- **Operating System**: Windows, macOS, or Linux

### Database (Optional for Development)
- **MongoDB**: 4.4+ (for production)
- For development, the system uses in-memory database (included)

### Recommended Tools
- **Git**: For version control
- **Postman** or **cURL**: For API testing
- **VS Code**: Code editor (optional)

### Network Requirements
- Internet connection for npm/pnpm package downloads
- Port 8080 available (configurable)
- Port 3000 available for production

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Extract and Navigate
```bash
# Extract the zip file
unzip crypto-payment-gateway.zip
cd crypto-payment-gateway

# Navigate to the project root
cd .
```

### Step 2: Install Dependencies
```bash
# Using pnpm (recommended - faster)
pnpm install

# OR using npm
npm install
```

### Step 3: Configure Environment
```bash
# Copy example configuration
cp .env.example .env

# Edit .env file with your values
# On macOS/Linux:
nano .env

# On Windows:
notepad .env
```

### Step 4: Start Development Server
```bash
# Start both frontend and backend
pnpm run dev:all

# OR using npm
npm run dev:all
```

### Step 5: Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000/api/
- **Health Check**: http://localhost:3000/api/health

---

## 📚 Detailed Installation

### Installation Step 1: Verify Node.js Installation

Check if Node.js is installed:
```bash
node --version
npm --version
# Expected: v18.0.0+
```

If Node.js is not installed, download from [nodejs.org](https://nodejs.org/)

### Installation Step 2: Install Package Manager

We recommend using **pnpm** for better performance:

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Installation Step 3: Extract Project Files

```bash
# Extract the downloaded zip file
unzip crypto-payment-gateway.zip

# Navigate to project directory
cd crypto-payment-gateway
```

### Installation Step 4: Install Project Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# This will install:
# - Backend dependencies (Express, JWT, Zod, etc)
# - Frontend dependencies (React, Vite, Tailwind, etc)
# - Development tools (TypeScript, Vitest, etc)

# Takes 2-5 minutes depending on internet speed
```

### Installation Step 5: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-12345
JWT_EXPIRE=7d

# API Key Configuration
API_KEY_SECRET=your-api-secret-key-12345678

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-key-12345
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5000

# Payment Configuration
PAYMENT_TIMEOUT=1800000

# Optional: Blockchain Integrations
BINANCE_PAY_API_KEY=
BINANCE_PAY_SECRET_KEY=
TRON_GRID_API_KEY=
TRON_RPC_URL=https://api.trongrid.io

# Logging
LOG_LEVEL=info
```

⚠️ **IMPORTANT**: Change all secret keys in production!

### Installation Step 6: Build the Project (Optional)

If you want to build for production:

```bash
# Full build (frontend + backend)
pnpm build

# Build output:
# - dist/spa/        (React frontend)
# - backend/dist/server/     (Node.js backend)
```

---

## ⚙️ Environment Configuration

### Essential Environment Variables

#### JWT_SECRET
Secret key for signing JWT tokens. Use a strong, random string:

```bash
# Generate a strong secret (Linux/macOS)
openssl rand -hex 32

# Generate a strong secret (Windows PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copy the output to JWT_SECRET in `.env`

#### API_KEY_SECRET
Secret for hashing merchant API keys. Generate similarly to JWT_SECRET.

#### WEBHOOK_SECRET
Secret for signing webhook payloads. Essential for security.

### Optional Configuration

#### Database Setup (MongoDB)
For production, configure MongoDB:

1. Install MongoDB Community Edition
2. Start MongoDB service:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows (if installed as service)
# MongoDB will start automatically
```

3. Update configuration in code (backend/server/models/database.ts)

#### Blockchain Integrations

**For Binance Pay:**
```env
BINANCE_PAY_API_KEY=your_binance_api_key
BINANCE_PAY_SECRET_KEY=your_binance_secret_key
```

Get credentials from [Binance Pay API Console](https://merchant.binance.com/)

**For Tron/USDT TRC20:**
```env
TRON_GRID_API_KEY=your_trongrid_api_key
TRON_RPC_URL=https://api.trongrid.io
```

Get API key from [TronGrid](https://trongrid.io/)

---

## 🧪 Testing the API

### Test 1: Health Check

Verify the server is running:

```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-28T10:00:00.000Z",
  "version": "1.0.0"
}
```

### Test 2: Create Merchant Account

```bash
curl -X POST http://localhost:8080/api/merchants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Store",
    "email": "testmerchant@example.com",
    "password": "SecurePassword123",
    "website": "https://teststore.example.com"
  }'
```

Response includes:
```json
{
  "merchantId": "mer_abc123...",
  "apiKey": "pk_live_xxxxx",
  "apiSecret": "sk_live_xxxxx",
  "email": "testmerchant@example.com",
  "createdAt": "2024-01-28T10:00:00Z"
}
```

**Save the API Key!** You'll need it for payment requests.

### Test 3: Merchant Login

```bash
curl -X POST http://localhost:8080/api/merchants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testmerchant@example.com",
    "password": "SecurePassword123"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "merchantId": "mer_abc123",
  "email": "testmerchant@example.com",
  "name": "My Test Store"
}
```

### Test 4: Create Payment Request

Replace `pk_live_xxxxx` with your actual API Key:

```bash
curl -X POST http://localhost:8080/api/payments \
  -H "Authorization: ApiKey pk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USDT",
    "network": "TRC20",
    "paymentMethod": "usdt_trc20",
    "customerReference": "order_12345",
    "description": "Test Payment"
  }'
```

Response:
```json
{
  "id": "pay_abc123...",
  "merchantId": "mer_abc123",
  "amount": 100,
  "currency": "USDT",
  "network": "TRC20",
  "status": "pending",
  "paymentAddress": "TZ7d3UGGM2bxmmEfS9F2aU9c7Lf4Y7xMgk",
  "paymentLink": "https://payment.gateway/checkout/pay_abc123",
  "expiresAt": "2024-01-28T10:30:00Z",
  "createdAt": "2024-01-28T10:00:00Z"
}
```

### Test 5: Check Payment Status

```bash
curl http://localhost:8080/api/payments/pay_abc123 \
  -H "Authorization: ApiKey pk_live_xxxxx"
```

---

## 🔔 Webhook Setup

### What are Webhooks?

Webhooks are automatic HTTP POST requests sent to your server when a payment status changes.

### How to Set Up Webhooks

#### Step 1: Create a Webhook Endpoint

In your backend, create an endpoint to receive webhooks:

```javascript
// server.js (Node.js example)
app.post('/webhook/crypto-payment', (req, res) => {
  const payload = req.body;
  const signature = payload.signature;

  // 1. Verify signature
  const crypto = require('crypto');
  const secret = process.env.WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify({...payload, signature: undefined}))
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Process webhook
  console.log('Payment confirmed:', payload);
  
  if (payload.status === 'confirmed') {
    // Update order status in your database
    updateOrderStatus(payload.customerReference, 'paid');
  }

  // 3. Always respond with 200
  res.json({ success: true });
});
```

#### Step 2: Configure Webhook URL in CryptoGate

When creating a merchant account, include your webhook URL:

```bash
curl -X POST http://localhost:8080/api/merchants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "email": "owner@store.com",
    "password": "SecurePassword123",
    "webhookUrl": "https://yoursite.com/webhook/crypto-payment"
  }'
```

#### Step 3: Test Webhook Signature Verification

Generate a test webhook:

```bash
curl -X POST http://localhost:8080/api/payments/webhooks/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

This returns a valid webhook payload with signature. Use it to test your verification code.

### Webhook Payload Example

When a payment is confirmed, you'll receive:

```json
{
  "paymentId": "pay_abc123",
  "merchantId": "mer_abc123",
  "status": "confirmed",
  "amount": 100,
  "amountReceived": 100,
  "currency": "USDT",
  "txHash": "0x1234567890abcdef...",
  "confirmedAt": "2024-01-28T10:15:00Z",
  "customerReference": "order_12345",
  "timestamp": "2024-01-28T10:15:00Z",
  "signature": "abcd1234567890..."
}
```

### Important: Always Verify Signatures

Never trust webhook data without verifying the signature. See `docs/WEBHOOK_GUIDE.md` for complete examples.

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Update all JWT_SECRET, API_KEY_SECRET, WEBHOOK_SECRET in production .env
- [ ] Set NODE_ENV=production
- [ ] Configure PostgreSQL (persistent database) and set `DATABASE_URL`
- [ ] Set up SSL/HTTPS certificate
- [ ] Configure CORS for your domain (`FRONTEND_ORIGIN`)
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation (JSON logs -> ELK/Loki/Datadog)
- [ ] Set up monitoring/alerts
- [ ] Ensure `API_KEY_SECRET` and `JWT_SECRET` are strong (do NOT use dev defaults)

### Database migrations (important)

Before starting the service in production you MUST apply Prisma migrations. Use the commands below from the `backend/` folder.

- Local development (create & apply migration):
  - pnpm --filter backend --dir "backend" run migrate:dev
  - OR (inside backend): cd backend && pnpm run migrate:dev

- Production deployment (apply existing migrations only):
  - cd backend && pnpm run migrate:deploy
  - then cd backend && pnpm run prisma:generate

CI/CD tip (run in a migration job before starting the service):

```yaml
# example: GitHub Actions job (snippet)
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: pnpm install --frozen-lockfile
      - name: Run migrations
        run: cd backend && pnpm run migrate:deploy && pnpm run prisma:generate
      - name: Start/Deploy app (next step in pipeline)
        run: echo "migrations applied"
```

Notes:
- Use `prisma migrate dev` only for local development and when you intend to create new migration files.
- Use `prisma migrate deploy` in production/CI to apply pre-generated migrations.
- Always back up your production DB before applying migrations.

### Deployment to Netlify

1. Connect your GitHub repository
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push

### Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Self-Hosted Deployment

#### Option 1: Using PM2

```bash
# Install PM2
npm install -g pm2

# Build project
pnpm build

# Start server with PM2
pm2 start backend/dist/server/node-build.mjs --name "cryptogate"

# Setup auto-restart on reboot
pm2 startup
pm2 save
```

#### Option 2: Using Docker

```bash
# Build Docker image
docker build -t cryptogate:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e API_KEY_SECRET=your-secret \
  -e WEBHOOK_SECRET=your-secret \
  --name cryptogate \
  cryptogate:latest
```

#### Option 3: Using Systemd (Linux)

Create `/etc/systemd/system/cryptogate.service`:

```ini
[Unit]
Description=CryptoGate API
After=network.target

[Service]
Type=simple
User=cryptogate
WorkingDirectory=/home/cryptogate/cryptogate
ExecStart=/usr/bin/node /home/cryptogate/cryptogate/backend/dist/server/node-build.mjs
Restart=always
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start cryptogate
sudo systemctl enable cryptogate
```

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::8080`

**Solution**:
```bash
# Kill process on port 8080
# macOS/Linux
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change PORT in .env
echo "PORT=8081" >> .env
```

### Issue 2: Dependencies Not Installing

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```bash
# Clear cache
pnpm store prune
npm cache clean --force

# Reinstall
pnpm install
```

### Issue 3: TypeScript Errors

**Error**: `Type errors in TypeScript`

**Solution**:
```bash
# Run type checking
pnpm typecheck

# Fix errors shown
# Usually missing types or type mismatches
```

### Issue 4: Webpack Build Failure

**Error**: `Build failed`

**Solution**:
```bash
# Delete build cache
rm -rf dist/
rm -rf .vite/

# Rebuild
pnpm build
```

### Issue 5: Webhook Not Receiving Requests

**Troubleshooting Steps**:

1. Verify webhook URL is publicly accessible:
```bash
curl https://yoursite.com/webhook/crypto-payment
```

2. Check firewall allows outbound connections
3. Verify webhook URL in merchant profile:
```bash
curl http://localhost:8080/api/merchants/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. Monitor webhook logs (in server console during development)

### Issue 6: API Key Not Working

**Error**: `401 Unauthorized - Invalid API key`

**Solution**:

1. Verify API key format (starts with `pk_`)
2. Check Authorization header format:
```bash
# Correct
Authorization: ApiKey pk_live_xxxxx

# Incorrect (don't use these)
Authorization: Bearer pk_live_xxxxx
Authorization: pk_live_xxxxx
```

3. Generate new API key:
```bash
curl -X POST http://localhost:8080/api/merchants/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Issue 7: CORS Errors in Browser

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:

Update CORS configuration in backend/server/index.ts:

```typescript
app.use(cors({
  origin: 'https://yourfrontend.com',
  credentials: true
}));
```

---

## 📞 Getting Help

### Documentation
- See `README.md` for overview
- See `docs/` folder for detailed guides
- See `CHANGELOG.md` for version history

### Test API
- Use Postman: [postman.com](https://postman.com)
- Use cURL for command line
- Use Insomnia: [insomnia.rest](https://insomnia.rest)

### Community
- GitHub Issues: Report bugs
- Documentation: See docs/ folder
- Email Support: support@cryptogate.io

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] `pnpm dev` starts without errors
- [ ] http://localhost:8080 loads landing page
- [ ] Signup page accessible at /signup
- [ ] Login page accessible at /login
- [ ] Health check returns 200: `/api/health`
- [ ] Can create merchant account
- [ ] Can create payment request
- [ ] Can check payment status
- [ ] Can generate test webhook

Once all items are checked, your installation is complete!

---

## 🎉 Next Steps

1. Read `README.md` for project overview
2. Review `docs/API_REFERENCE.md` for all endpoints
3. Review `docs/WEBHOOK_GUIDE.md` for webhook setup
4. Review `docs/INTEGRATION_EXAMPLES.md` for code examples
5. Review `docs/ARCHITECTURE.md` for technical details

---

**Thank you for choosing CryptoGate!** 🚀

For more information, visit the documentation in the `docs/` folder.
