# CryptoGate Webhook Guide

Complete guide to implementing and securing webhooks in your application.

## 📌 What are Webhooks?

Webhooks are HTTP POST requests automatically sent from CryptoGate to your server when a payment status changes. Instead of polling the API for updates, webhooks push real-time notifications to your backend.

### Webhook Events

Currently triggered for:
- **Payment Confirmed** - Customer sent the correct amount
- **Payment Failed** - Payment could not be processed
- **Payment Expired** - Payment request expired

---

## 🔧 Setting Up Webhooks

### Step 1: Create a Webhook Endpoint

Your endpoint must:
- Accept HTTP POST requests
- Return HTTP 200 status
- Verify HMAC signature
- Process asynchronously

### Step 2: Configure Webhook URL

When creating a merchant account:

```bash
curl -X POST http://localhost:8080/api/merchants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "email": "owner@store.com",
    "password": "SecurePassword123",
    "webhookUrl": "https://mystore.com/webhooks/payment"
  }'
```

Or update existing:

```bash
curl -X PUT http://localhost:8080/api/merchants/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://mystore.com/webhooks/payment"
  }'
```

### Step 3: Implement Signature Verification

**CRITICAL: Always verify signatures before processing webhooks!**

---

## 🔒 Webhook Signature Verification

Every webhook includes a `signature` field computed using HMAC-SHA256.

### How Signatures Work

1. CryptoGate creates payload without signature
2. Computes: `signature = HMAC-SHA256(payload_string, WEBHOOK_SECRET)`
3. Adds signature to payload
4. Sends to your endpoint

You must:
1. Remove signature from payload
2. Compute HMAC-SHA256 with same secret
3. Compare with received signature
4. Only process if they match

### Signature Verification Examples

#### Node.js (Express)

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

app.use(express.json());

// Webhook endpoint
app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  const receivedSignature = payload.signature;
  
  // Step 1: Get webhook secret from environment
  const secret = process.env.WEBHOOK_SECRET;
  
  // Step 2: Create copy of payload without signature
  const payloadForVerification = { ...payload };
  delete payloadForVerification.signature;
  
  // Step 3: Convert to string and compute HMAC
  const payloadString = JSON.stringify(payloadForVerification);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
  
  // Step 4: Compare signatures (use timingSafeEqual to prevent timing attacks)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );
  
  if (!isValid) {
    console.error('Invalid webhook signature!');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Step 5: Process webhook
  console.log('Webhook verified. Processing payment...');
  handlePaymentWebhook(payload);
  
  // Step 6: Return 200 immediately
  res.json({ success: true });
});

function handlePaymentWebhook(payload) {
  console.log('Payment event:', {
    paymentId: payload.paymentId,
    status: payload.status,
    amount: payload.amount,
    currency: payload.currency
  });
  
  // Update your database, send emails, etc.
  if (payload.status === 'confirmed') {
    updateOrderStatus(payload.customerReference, 'paid');
    sendConfirmationEmail(payload.customerReference);
  }
}

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000');
});
```

#### PHP

```php
<?php
// webhook.php

// Step 1: Get webhook secret
$secret = $_ENV['WEBHOOK_SECRET'];

// Step 2: Get JSON payload
$json = file_get_contents('php://input');
$payload = json_decode($json, true);

// Step 3: Extract received signature
$receivedSignature = $payload['signature'];

// Step 4: Remove signature from payload for verification
unset($payload['signature']);

// Step 5: Compute expected signature
$payloadString = json_encode($payload);
$expectedSignature = hash_hmac('sha256', $payloadString, $secret);

// Step 6: Verify signatures match
if (!hash_equals($expectedSignature, $receivedSignature)) {
  http_response_code(401);
  json_encode(['error' => 'Invalid signature']);
  exit;
}

// Step 7: Process webhook
processPaymentWebhook($payload);

// Step 8: Return 200
http_response_code(200);
json_encode(['success' => true]);
exit;

function processPaymentWebhook($payload) {
  error_log('Webhook verified: ' . json_encode($payload));
  
  if ($payload['status'] === 'confirmed') {
    updateOrderStatus($payload['customerReference'], 'paid');
    sendConfirmationEmail($payload['customerReference']);
  }
}
```

#### Python

```python
import hashlib
import hmac
import json
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/payment', methods=['POST'])
def webhook_payment():
    # Step 1: Get webhook secret
    secret = os.environ.get('WEBHOOK_SECRET')
    
    # Step 2: Get JSON payload
    payload = request.get_json()
    
    # Step 3: Extract received signature
    received_signature = payload.get('signature')
    
    # Step 4: Create copy without signature
    payload_for_verification = {k: v for k, v in payload.items() if k != 'signature'}
    
    # Step 5: Compute expected signature
    payload_string = json.dumps(payload_for_verification, sort_keys=True)
    expected_signature = hmac.new(
        secret.encode(),
        payload_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Step 6: Verify signatures match
    if not hmac.compare_digest(received_signature, expected_signature):
        return {'error': 'Invalid signature'}, 401
    
    # Step 7: Process webhook
    handle_payment_webhook(payload)
    
    # Step 8: Return 200
    return {'success': True}, 200

def handle_payment_webhook(payload):
    print(f"Payment webhook verified: {payload}")
    
    if payload['status'] == 'confirmed':
        update_order_status(payload['customerReference'], 'paid')
        send_confirmation_email(payload['customerReference'])

if __name__ == '__main__':
    app.run(port=3000)
```

#### cURL (for testing)

```bash
# First, test with CryptoGate test webhook endpoint
curl -X POST http://localhost:8080/api/payments/webhooks/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# This returns a valid webhook with signature
# Save the response as webhook.json

# Then verify the signature using your endpoint
curl -X POST http://yoursite.com/webhooks/payment \
  -H "Content-Type: application/json" \
  -d @webhook.json
```

---

## 📨 Webhook Payload Structure

### Example Payload

```json
{
  "paymentId": "pay_abc123xyz789",
  "merchantId": "mer_abc123xyz789",
  "status": "confirmed",
  "amount": 100,
  "amountReceived": 100,
  "currency": "USDT",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "confirmedAt": "2024-01-28T10:15:30Z",
  "customerReference": "order_12345",
  "timestamp": "2024-01-28T10:15:30Z",
  "signature": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234"
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| paymentId | string | Unique payment identifier |
| merchantId | string | Your merchant ID |
| status | string | Payment status (confirmed, failed, expired) |
| amount | number | Original requested amount |
| amountReceived | number | Actual amount received |
| currency | string | Currency (USDT, BNB, ETH, BTC) |
| txHash | string | Blockchain transaction hash |
| confirmedAt | string | Confirmation timestamp (ISO 8601) |
| customerReference | string | Your order/reference ID |
| timestamp | string | Webhook sent timestamp (ISO 8601) |
| signature | string | HMAC-SHA256 signature |

---

## ✅ Best Practices

### 1. Always Verify Signatures
```javascript
// CORRECT: Verify before processing
if (isValidSignature(payload, signature)) {
  processPayment(payload);
} else {
  return 401; // Reject invalid webhooks
}

// WRONG: Don't trust unverified webhooks
processPayment(payload); // Security risk!
```

### 2. Return 200 Immediately
```javascript
// CORRECT: Return 200 immediately
app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  
  // Verify signature
  if (!verifySignature(payload)) {
    return res.status(401).json({ error: 'Invalid' });
  }
  
  // Return 200 immediately
  res.json({ success: true });
  
  // Process asynchronously
  setImmediate(() => {
    handlePayment(payload);
  });
});

// WRONG: Don't wait for processing
app.post('/webhooks/payment', async (req, res) => {
  const payload = req.body;
  await handlePayment(payload); // Timeout risk!
  res.json({ success: true });
});
```

### 3. Handle Duplicate Webhooks
```javascript
// Store processed webhook IDs
const processedWebhooks = new Set();

app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  
  // Check if already processed
  if (processedWebhooks.has(payload.paymentId)) {
    console.log('Duplicate webhook, ignoring');
    return res.json({ success: true });
  }
  
  // Mark as processed
  processedWebhooks.add(payload.paymentId);
  
  // Return 200 and process
  res.json({ success: true });
  handlePayment(payload);
});
```

### 4. Implement Idempotency
```javascript
// Make webhook processing idempotent
function handlePayment(payload) {
  // Check if payment already processed in database
  const existingPayment = db.payments.findOne({
    paymentId: payload.paymentId
  });
  
  if (existingPayment) {
    console.log('Payment already processed');
    return;
  }
  
  // Process payment
  db.payments.insertOne({
    paymentId: payload.paymentId,
    status: payload.status,
    amount: payload.amount,
    processedAt: new Date()
  });
}
```

### 5. Log All Webhooks
```javascript
app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  
  // Always log for debugging
  console.log('[WEBHOOK]', {
    timestamp: new Date().toISOString(),
    paymentId: payload.paymentId,
    status: payload.status,
    valid: verifySignature(payload)
  });
  
  // ... process webhook
  res.json({ success: true });
});
```

### 6. Handle Webhook Failures Gracefully
```javascript
// Webhook handler with error handling
app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  
  try {
    // Verify signature
    if (!verifySignature(payload)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Return 200 immediately
    res.json({ success: true });
    
    // Process with error handling
    try {
      handlePayment(payload);
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Store for retry
      db.failedWebhooks.insertOne({
        payload,
        error: error.message,
        retryCount: 0,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});
```

---

## 🧪 Testing Webhooks

### Test 1: Generate Test Webhook

```bash
# Get JWT token first
TOKEN=$(curl -X POST http://localhost:8080/api/merchants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@store.com",
    "password": "SecurePassword123"
  }' | jq -r '.token')

# Generate test webhook
curl -X POST http://localhost:8080/api/payments/webhooks/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" > webhook.json

# Display the webhook
cat webhook.json | jq .
```

### Test 2: Send Test Webhook to Your Endpoint

```bash
# Send the saved webhook to your endpoint
curl -X POST http://yoursite.com/webhooks/payment \
  -H "Content-Type: application/json" \
  -d @webhook.json

# Expected response: 200 OK with { "success": true }
```

### Test 3: Verify Signature

```bash
# Use CryptoGate's verification endpoint (for testing)
curl -X POST http://localhost:8080/api/payments/webhooks/verify \
  -H "Content-Type: application/json" \
  -d @webhook.json
```

### Test 4: Test with ngrok (expose local endpoint)

```bash
# Install ngrok from https://ngrok.com
# In another terminal, expose your local server
ngrok http 3000

# Update webhook URL to:
# https://xxxx-xxxx-xxxx.ngrok.io/webhooks/payment

# Send test webhook and see it hit your local server
```

---

## 🔄 Webhook Retry Policy

If your endpoint returns non-200 status:

- **Attempt 1**: Immediate retry
- **Attempt 2**: 5 seconds later
- **Attempt 3**: 10 seconds later
- **Attempt 4**: After 30 seconds, give up

After all retries fail, webhook is marked as failed. You can manually trigger via API.

---

## 🚨 Common Webhook Issues

### Issue 1: "Invalid Signature"

**Cause**: Signature verification code has a bug.

**Solution**:
1. Check `WEBHOOK_SECRET` matches in code and `.env`
2. Verify payload JSON encoding (no extra spaces)
3. Ensure signature is compared with `timingSafeEqual`
4. Check you're removing signature before verification

```javascript
// WRONG: Including signature in verification
const payloadString = JSON.stringify(payload); // Includes signature!

// CORRECT: Remove signature first
const payloadCopy = { ...payload };
delete payloadCopy.signature;
const payloadString = JSON.stringify(payloadCopy);
```

### Issue 2: "Webhook Not Received"

**Cause**: Webhook URL unreachable.

**Solution**:
1. Test endpoint manually:
```bash
curl -X POST http://yoursite.com/webhooks/payment \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

2. Check firewall allows inbound connections
3. Verify webhook URL in merchant profile:
```bash
curl http://localhost:8080/api/merchants/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .webhookUrl
```

4. Use ngrok to test locally

### Issue 3: "Webhook Timeouts"

**Cause**: Processing takes too long.

**Solution**:
1. Return 200 before processing:
```javascript
res.json({ success: true }); // Do this first!
setImmediate(() => handlePayment(payload)); // Process later
```

2. Don't do heavy operations in webhook handler
3. Queue webhook for background processing

### Issue 4: "Duplicate Payments"

**Cause**: Processing same webhook twice.

**Solution**:
1. Check if payment already exists:
```javascript
const existing = db.payments.findOne({ paymentId });
if (existing) return; // Already processed
```

2. Use payment ID as unique key in database

---

## 🔐 Security Checklist

- [ ] Always verify HMAC signature
- [ ] Use `timingSafeEqual` for signature comparison
- [ ] Don't log sensitive data (tx hashes, amounts)
- [ ] Return 200 immediately (don't timeout)
- [ ] Handle duplicate webhooks
- [ ] Implement rate limiting
- [ ] Rotate `WEBHOOK_SECRET` periodically
- [ ] Use HTTPS (not HTTP)
- [ ] Validate all webhook data
- [ ] Never trust unverified webhooks

---

## 📝 Webhook Monitoring Template

```javascript
// logs/webhooks.log
// Track all webhook activity

const WebhookLogger = {
  log: function(payload, status, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      paymentId: payload.paymentId,
      merchantId: payload.merchantId,
      webhookStatus: payload.status,
      processingStatus: status, // 'verified', 'failed', 'processed'
      details: details
    };
    
    console.log(JSON.stringify(entry));
    
    // Also store in database for monitoring
    db.webhookLogs.insertOne(entry);
  }
};

// Usage
WebhookLogger.log(payload, 'processed', {
  orderId: payload.customerReference,
  amount: payload.amount,
  processingTime: '234ms'
});
```

---

## 📞 Need Help?

- Review `docs/INTEGRATION_EXAMPLES.md` for more code examples
- Check `docs/API_REFERENCE.md` for endpoint details
- See `README.md` for support contact

All code examples are production-ready. Copy and adapt to your needs!
