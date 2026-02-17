# CryptoGate API Reference

Complete reference guide for all CryptoGate API endpoints.

## 📌 Base URL

**Development**: `http://localhost:8080/api`
**Production**: `https://api.cryptogate.io/api`

All requests must include proper authentication headers.

---

## 🔐 Authentication

### JWT Token Authentication
Used for merchant dashboard endpoints.

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to Get Token**:
- Obtain via `POST /merchants/login`
- Valid for 7 days
- Include in every authenticated request

### API Key Authentication
Used for payment endpoints.

**Header Format**:
```
Authorization: ApiKey pk_live_xxxxx
```

**How to Get API Key**:
- Obtained during merchant signup
- Generate new keys with `POST /merchants/api-keys`
- Format: `pk_` prefix followed by 48 alphanumeric characters

### Public Endpoints
Some endpoints require no authentication:
- `GET /health`
- `POST /payments/webhooks/verify`

---

## 📊 Common Response Format

### Success Response (200, 201)
```json
{
  "id": "unique_identifier",
  "status": "active",
  "createdAt": "2024-01-28T10:00:00Z",
  "updatedAt": "2024-01-28T10:00:00Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific error info"
  },
  "timestamp": "2024-01-28T10:00:00Z"
}
```

### Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Server Error` - Server error

---

## 👥 Merchant Endpoints

### POST /merchants/signup
Create a new merchant account.

**Authentication**: None (public)

**Request**:
```bash
curl -X POST http://localhost:8080/api/merchants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "email": "owner@store.com",
    "password": "SecurePassword123",
    "website": "https://mystore.com",
    "webhookUrl": "https://mystore.com/webhook"
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Business name (1+ chars) |
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 characters |
| website | string | No | Business website URL |
| webhookUrl | string | No | Webhook endpoint URL |

**Response** (201 Created):
```json
{
"merchantId": "mer_abc123xyz789",
"apiKey": "<YOUR_PUBLIC_API_KEY>",
"apiSecret": "<YOUR_SECRET_API_KEY>",
"email": "owner@store.com",
"createdAt": "2024-01-28T10:00:00Z"
}
```

**Error Examples**:
```json
{
  "error": "Merchant with this email already exists",
  "code": "MERCHANT_EXISTS",
  "timestamp": "2024-01-28T10:00:00Z"
}
```

---

### POST /merchants/login
Authenticate merchant and get JWT token.

**Authentication**: None (public)

**Request**:
```bash
curl -X POST http://localhost:8080/api/merchants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@store.com",
    "password": "SecurePassword123"
  }'
```

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "merchantId": "mer_abc123xyz789",
  "email": "owner@store.com",
  "name": "My Store"
}
```

---

### GET /merchants/profile
Get authenticated merchant's profile.

**Authentication**: JWT Token (Bearer)

**Request**:
```bash
curl http://localhost:8080/api/merchants/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK):
```json
{
  "id": "mer_abc123xyz789",
  "name": "My Store",
  "email": "owner@store.com",
  "website": "https://mystore.com",
  "webhookUrl": "https://mystore.com/webhook",
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00Z",
  "updatedAt": "2024-01-28T10:00:00Z"
}
```

---

### PUT /merchants/profile
Update merchant profile.

**Authentication**: JWT Token (Bearer)

**Request**:
```bash
curl -X PUT http://localhost:8080/api/merchants/profile \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Store Name",
    "website": "https://newwebsite.com",
    "webhookUrl": "https://newwebsite.com/webhook"
  }'
```

**Request Body** (all optional):
| Field | Type | Description |
|-------|------|-------------|
| name | string | Business name |
| website | string | Website URL |
| webhookUrl | string | Webhook URL |

**Response** (200 OK):
```json
{
  "id": "mer_abc123xyz789",
  "name": "Updated Store Name",
  "email": "owner@store.com",
  "website": "https://newwebsite.com",
  "webhookUrl": "https://newwebsite.com/webhook",
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00Z",
  "updatedAt": "2024-01-28T10:00:00Z"
}
```

---

### POST /merchants/api-keys
Generate a new API key.

**Authentication**: JWT Token (Bearer)

**Request**:
```bash
curl -X POST http://localhost:8080/api/merchants/api-keys \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (201 Created):
```json
{
  "keyId": "pk_live_newkeyhash",
  "key": "pk_live_abcdefghijklmnopqrstuvwxyz123456",
  "createdAt": "2024-01-28T10:00:00Z"
}
```

---

## 💳 Payment Endpoints

### POST /payments
Create a new payment request.

**Authentication**: API Key

**Request**:
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
    "callbackUrl": "https://mystore.com/payment-callback",
    "description": "Purchase Order #12345",
    "metadata": {
      "orderId": 12345,
      "customerId": 789
    }
  }'
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Payment amount (positive) |
| currency | string | Yes | USDT, BNB, ETH, or BTC |
| network | string | Yes | TRC20, BSC, ERC20, or BITCOIN |
| paymentMethod | string | Yes | binance_pay, usdt_trc20, or crypto_wallet |
| customerReference | string | Yes | Order ID or reference |
| callbackUrl | string | No | Custom callback URL |
| description | string | No | Payment description |
| metadata | object | No | Custom metadata (any JSON) |

**Response** (201 Created):
```json
{
  "id": "pay_abc123xyz789",
  "merchantId": "mer_abc123xyz789",
  "amount": 100,
  "currency": "USDT",
  "network": "TRC20",
  "paymentMethod": "usdt_trc20",
  "customerReference": "order_12345",
  "status": "pending",
  "paymentAddress": "TZ7d3UGGM2bxmmEfS9F2aU9c7Lf4Y7xMgk",
  "paymentLink": "https://payment.gateway/checkout/pay_abc123xyz789",
  "expiresAt": "2024-01-28T10:30:00Z",
  "createdAt": "2024-01-28T10:00:00Z",
  "updatedAt": "2024-01-28T10:00:00Z"
}
```

**Error Examples**:
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ],
  "timestamp": "2024-01-28T10:00:00Z"
}
```

---

### GET /payments
List all payments for authenticated merchant.

**Authentication**: API Key

**Request**:
```bash
curl http://localhost:8080/api/payments \
  -H "Authorization: ApiKey pk_live_xxxxx"
```

**Response** (200 OK):
```json
[
  {
    "id": "pay_abc123xyz789",
    "merchantId": "mer_abc123xyz789",
    "amount": 100,
    "currency": "USDT",
    "network": "TRC20",
    "paymentMethod": "usdt_trc20",
    "customerReference": "order_12345",
    "status": "pending",
    "paymentAddress": "TZ7d3UGGM2bxmmEfS9F2aU9c7Lf4Y7xMgk",
    "paymentLink": "https://payment.gateway/checkout/pay_abc123xyz789",
    "txHash": null,
    "expiresAt": "2024-01-28T10:30:00Z",
    "confirmedAt": null,
    "amountReceived": null,
    "createdAt": "2024-01-28T10:00:00Z",
    "updatedAt": "2024-01-28T10:00:00Z"
  }
]
```

---

### GET /payments/:paymentId
Get payment details and current status.

**Authentication**: API Key

**Request**:
```bash
curl http://localhost:8080/api/payments/pay_abc123xyz789 \
  -H "Authorization: ApiKey pk_live_xxxxx"
```

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| paymentId | string | Payment ID (starts with pay_) |

**Response** (200 OK):
```json
{
  "id": "pay_abc123xyz789",
  "status": "pending",
  "amount": 100,
  "amountReceived": null,
  "currency": "USDT",
  "txHash": null,
  "confirmedAt": null,
  "expiresAt": "2024-01-28T10:30:00Z",
  "network": "TRC20"
}
```

**Status Values**:
- `pending` - Awaiting payment
- `confirmed` - Payment received and confirmed
- `failed` - Payment failed
- `expired` - Payment request expired

---

## 🔔 Webhook Endpoints

### POST /payments/webhooks/verify
Verify webhook payload signature (for testing).

**Authentication**: None (public)

**Request**:
```bash
curl -X POST http://localhost:8080/api/payments/webhooks/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "paymentId": "pay_abc123xyz789",
      "status": "confirmed",
      "amount": 100,
      "currency": "USDT",
      "txHash": "0x1234567890abcdef..."
    },
    "signature": "abcd1234567890..."
  }'
```

**Request Body**:
| Field | Type | Required |
|-------|------|----------|
| payload | object | Yes |
| signature | string | Yes |

**Response** (200 OK):
```json
{
  "isValid": true,
  "message": "Signature is valid"
}
```

---

### POST /payments/webhooks/test
Generate test webhook payload with valid signature.

**Authentication**: JWT Token (Bearer)

**Request**:
```bash
curl -X POST http://localhost:8080/api/payments/webhooks/test \
  -H "Authorization: Bearer eyJhbGc..."
```

**Response** (200 OK):
```json
{
  "paymentId": "pay_test_1704962400000",
  "merchantId": "mer_abc123xyz789",
  "status": "confirmed",
  "amount": 100,
  "amountReceived": 100,
  "currency": "USDT",
  "txHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "confirmedAt": "2024-01-28T10:15:00Z",
  "customerReference": "test_customer_001",
  "timestamp": "2024-01-28T10:15:00Z",
  "signature": "abcdef1234567890..."
}
```

---

## ✅ Health Check

### GET /health
Check API server health.

**Authentication**: None (public)

**Request**:
```bash
curl http://localhost:8080/api/health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-28T10:00:00Z",
  "version": "1.0.0"
}
```

---

## 🔍 Data Types Reference

### Payment Status
- `pending` - Payment awaiting confirmation
- `confirmed` - Payment confirmed on blockchain
- `failed` - Payment failed
- `expired` - Payment request expired

### Supported Currencies
- `USDT` - Tether
- `BNB` - Binance Coin
- `ETH` - Ethereum
- `BTC` - Bitcoin

### Supported Networks
- `TRC20` - Tron network
- `BSC` - Binance Smart Chain
- `ERC20` - Ethereum mainnet
- `BITCOIN` - Bitcoin mainnet

### Payment Methods
- `binance_pay` - Binance Pay integration
- `usdt_trc20` - Direct USDT TRC20 transfer
- `crypto_wallet` - Generic crypto wallet payment

---

## 📝 Request Examples by Language

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:8080/api/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'ApiKey pk_live_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100,
    currency: 'USDT',
    network: 'TRC20',
    paymentMethod: 'usdt_trc20',
    customerReference: 'order_123'
  })
});

const payment = await response.json();
console.log('Payment created:', payment.id);
```

### Python
```python
import requests
import json

response = requests.post(
  'http://localhost:8080/api/payments',
  headers={
    'Authorization': 'ApiKey pk_live_...',
    'Content-Type': 'application/json'
  },
  json={
    'amount': 100,
    'currency': 'USDT',
    'network': 'TRC20',
    'paymentMethod': 'usdt_trc20',
    'customerReference': 'order_123'
  }
)

payment = response.json()
print(f"Payment created: {payment['id']}")
```

### PHP
```php
<?php
$data = array(
  'amount' => 100,
  'currency' => 'USDT',
  'network' => 'TRC20',
  'paymentMethod' => 'usdt_trc20',
  'customerReference' => 'order_123'
);

$ch = curl_init('http://localhost:8080/api/payments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
  'Authorization: ApiKey pk_live_...',
  'Content-Type: application/json'
));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$payment = json_decode($response);
echo "Payment created: " . $payment->id;
```

---

## ⚠️ Error Codes Reference

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| MISSING_AUTH | 401 | Missing authorization header |
| INVALID_TOKEN | 401 | Invalid or expired JWT token |
| INVALID_API_KEY | 401 | Invalid API key |
| MERCHANT_INACTIVE | 403 | Merchant account is inactive |
| ACCESS_DENIED | 403 | Access to resource denied |
| NOT_FOUND | 404 | Resource not found |
| MERCHANT_EXISTS | 409 | Merchant email already registered |
| VALIDATION_ERROR | 400 | Request validation failed |
| PAYMENT_ERROR | 500 | Payment creation failed |
| LOGIN_ERROR | 500 | Login failed |
| INTERNAL_ERROR | 500 | Server internal error |

---

## 🔒 Rate Limiting

Current API does not enforce rate limiting (ready for Redis integration).

Recommended limits for production:
- 100 requests per 15 minutes per API key
- 1000 requests per hour per merchant

---

## 📞 Support

For API issues:
- Check `docs/WEBHOOK_GUIDE.md` for webhook help
- Check `docs/INTEGRATION_EXAMPLES.md` for code examples
- Review error responses - they include detailed error codes

See `README.md` for contact information.
