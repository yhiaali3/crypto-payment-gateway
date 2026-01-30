# CryptoGate Integration Examples

Complete, copy-paste ready examples for integrating CryptoGate in your applications.

## 📋 Table of Contents

1. [JavaScript/Node.js](#javascriptnodejs)
2. [PHP](#php)
3. [Python](#python)
4. [cURL](#curl)
5. [React](#react)
6. [Vue.js](#vuejs)

---

## JavaScript/Node.js

### Installation

```bash
npm install crypto-js axios dotenv
# or
pnpm add crypto-js axios dotenv
```

### Complete Example

```javascript
// cryptogate.js - CryptoGate Client

const axios = require('axios');
const crypto = require('crypto');

class CryptoGateClient {
  constructor(apiKey, webhookSecret, baseURL = 'http://localhost:8080/api') {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create payment request
   */
  async createPayment(paymentData) {
    try {
      const response = await this.client.post('/payments', paymentData, {
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Payment creation failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`, {
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * List all payments
   */
  async listPayments() {
    try {
      const response = await this.client.get('/payments', {
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list payments: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const payloadCopy = { ...payload };
    delete payloadCopy.signature;
    
    const payloadString = JSON.stringify(payloadCopy);
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = CryptoGateClient;
```

### Usage Example

```javascript
// app.js
const express = require('express');
const CryptoGateClient = require('./cryptogate');

const app = express();
app.use(express.json());

// Initialize client
const gateway = new CryptoGateClient(
  process.env.CRYPTOGATE_API_KEY,
  process.env.WEBHOOK_SECRET
);

// Create payment
app.post('/create-payment', async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    const payment = await gateway.createPayment({
      amount: parseFloat(amount),
      currency: 'USDT',
      network: 'TRC20',
      paymentMethod: 'usdt_trc20',
      customerReference: orderId,
      callbackUrl: 'https://yoursite.com/payment-callback',
      description: `Order #${orderId}`
    });

    res.json({
      success: true,
      paymentId: payment.id,
      paymentAddress: payment.paymentAddress,
      expiresAt: payment.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check payment status
app.get('/payment-status/:paymentId', async (req, res) => {
  try {
    const status = await gateway.getPaymentStatus(req.params.paymentId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/webhooks/payment', (req, res) => {
  const payload = req.body;
  const signature = payload.signature;

  // Verify signature
  try {
    const isValid = gateway.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Signature verification failed' });
  }

  // Return 200 immediately
  res.json({ success: true });

  // Process asynchronously
  setImmediate(() => {
    handlePaymentWebhook(payload);
  });
});

function handlePaymentWebhook(payload) {
  console.log('Processing webhook:', {
    paymentId: payload.paymentId,
    status: payload.status,
    amount: payload.amount
  });

  if (payload.status === 'confirmed') {
    // Update order to "paid"
    updateOrderStatus(payload.customerReference, 'paid');
    sendConfirmationEmail(payload.customerReference);
  } else if (payload.status === 'failed') {
    updateOrderStatus(payload.customerReference, 'payment_failed');
  } else if (payload.status === 'expired') {
    updateOrderStatus(payload.customerReference, 'payment_expired');
  }
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## PHP

### Installation

```bash
composer require guzzlehttp/guzzle
```

### Complete Example

```php
<?php
// CryptoGateClient.php

class CryptoGateClient {
  private $apiKey;
  private $webhookSecret;
  private $baseUrl;
  private $client;

  public function __construct($apiKey, $webhookSecret, $baseUrl = 'http://localhost:8080/api') {
    $this->apiKey = $apiKey;
    $this->webhookSecret = $webhookSecret;
    $this->baseUrl = $baseUrl;
    
    $this->client = new \GuzzleHttp\Client([
      'base_uri' => $baseUrl,
      'headers' => [
        'Content-Type' => 'application/json'
      ]
    ]);
  }

  /**
   * Create payment request
   */
  public function createPayment($paymentData) {
    try {
      $response = $this->client->post('/payments', [
        'json' => $paymentData,
        'headers' => [
          'Authorization' => "ApiKey {$this->apiKey}"
        ]
      ]);

      return json_decode($response->getBody(), true);
    } catch (\GuzzleHttp\Exception\RequestException $e) {
      $body = json_decode($e->getResponse()->getBody(), true);
      throw new Exception("Payment creation failed: " . ($body['error'] ?? $e->getMessage()));
    }
  }

  /**
   * Get payment status
   */
  public function getPaymentStatus($paymentId) {
    try {
      $response = $this->client->get("/payments/{$paymentId}", [
        'headers' => [
          'Authorization' => "ApiKey {$this->apiKey}"
        ]
      ]);

      return json_decode($response->getBody(), true);
    } catch (\GuzzleHttp\Exception\RequestException $e) {
      throw new Exception("Failed to get payment status: " . $e->getMessage());
    }
  }

  /**
   * List payments
   */
  public function listPayments() {
    try {
      $response = $this->client->get('/payments', [
        'headers' => [
          'Authorization' => "ApiKey {$this->apiKey}"
        ]
      ]);

      return json_decode($response->getBody(), true);
    } catch (\GuzzleHttp\Exception\RequestException $e) {
      throw new Exception("Failed to list payments: " . $e->getMessage());
    }
  }

  /**
   * Verify webhook signature
   */
  public function verifyWebhookSignature($payload, $signature) {
    // Remove signature from payload
    $payloadCopy = $payload;
    unset($payloadCopy['signature']);

    // Compute expected signature
    $payloadString = json_encode($payloadCopy);
    $expectedSignature = hash_hmac('sha256', $payloadString, $this->webhookSecret);

    // Use hash_equals for timing-safe comparison
    return hash_equals($expectedSignature, $signature);
  }
}
```

### Usage Example

```php
<?php
// webhook.php

require 'vendor/autoload.php';
require 'CryptoGateClient.php';

$gateway = new CryptoGateClient(
  $_ENV['CRYPTOGATE_API_KEY'],
  $_ENV['WEBHOOK_SECRET']
);

// Handle webhook
$input = json_decode(file_get_contents('php://input'), true);
$payload = $input;
$signature = $payload['signature'] ?? null;

if (!$signature) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing signature']);
  exit;
}

// Verify signature
if (!$gateway->verifyWebhookSignature($payload, $signature)) {
  http_response_code(401);
  echo json_encode(['error' => 'Invalid signature']);
  exit;
}

// Return 200 immediately
http_response_code(200);
echo json_encode(['success' => true]);

// Process webhook
switch ($payload['status']) {
  case 'confirmed':
    updateOrderStatus($payload['customerReference'], 'paid');
    sendConfirmationEmail($payload['customerReference']);
    break;
  
  case 'failed':
    updateOrderStatus($payload['customerReference'], 'payment_failed');
    break;
  
  case 'expired':
    updateOrderStatus($payload['customerReference'], 'payment_expired');
    break;
}

function updateOrderStatus($orderId, $status) {
  // Update your database
  error_log("Order {$orderId} status: {$status}");
}

function sendConfirmationEmail($orderId) {
  // Send email
  error_log("Confirmation email sent for order {$orderId}");
}
```

### Create Payment API

```php
<?php
// create_payment.php

require 'vendor/autoload.php';
require 'CryptoGateClient.php';

$gateway = new CryptoGateClient(
  $_ENV['CRYPTOGATE_API_KEY'],
  $_ENV['WEBHOOK_SECRET']
);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $amount = $_POST['amount'] ?? 0;
  $orderId = $_POST['orderId'] ?? uniqid('order_');

  try {
    $payment = $gateway->createPayment([
      'amount' => floatval($amount),
      'currency' => 'USDT',
      'network' => 'TRC20',
      'paymentMethod' => 'usdt_trc20',
      'customerReference' => $orderId,
      'description' => "Order #{$orderId}"
    ]);

    echo json_encode([
      'success' => true,
      'paymentId' => $payment['id'],
      'paymentAddress' => $payment['paymentAddress'],
      'expiresAt' => $payment['expiresAt']
    ]);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
  }
}
```

---

## Python

### Installation

```bash
pip install requests
```

### Complete Example

```python
# cryptogate_client.py

import requests
import hmac
import hashlib
import json
from typing import Dict, Any, Optional

class CryptoGateClient:
    def __init__(self, api_key: str, webhook_secret: str, base_url: str = 'http://localhost:8080/api'):
        self.api_key = api_key
        self.webhook_secret = webhook_secret
        self.base_url = base_url
        self.session = requests.Session()

    def _get_headers(self):
        return {
            'Content-Type': 'application/json',
            'Authorization': f'ApiKey {self.api_key}'
        }

    def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a payment request"""
        try:
            response = self.session.post(
                f'{self.base_url}/payments',
                json=payment_data,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f'Payment creation failed: {e}')

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get payment status"""
        try:
            response = self.session.get(
                f'{self.base_url}/payments/{payment_id}',
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f'Failed to get payment status: {e}')

    def list_payments(self) -> list:
        """List all payments"""
        try:
            response = self.session.get(
                f'{self.base_url}/payments',
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f'Failed to list payments: {e}')

    def verify_webhook_signature(self, payload: Dict[str, Any], signature: str) -> bool:
        """Verify webhook signature"""
        # Remove signature from payload
        payload_copy = {k: v for k, v in payload.items() if k != 'signature'}
        
        # Compute expected signature
        payload_string = json.dumps(payload_copy, sort_keys=True)
        expected_signature = hmac.new(
            self.webhook_secret.encode(),
            payload_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(signature, expected_signature)
```

### Flask Webhook Example

```python
# app.py

from flask import Flask, request, jsonify
import os
from cryptogate_client import CryptoGateClient

app = Flask(__name__)

gateway = CryptoGateClient(
    api_key=os.getenv('CRYPTOGATE_API_KEY'),
    webhook_secret=os.getenv('WEBHOOK_SECRET')
)

@app.route('/api/create-payment', methods=['POST'])
def create_payment():
    data = request.get_json()
    
    try:
        payment = gateway.create_payment({
            'amount': float(data['amount']),
            'currency': 'USDT',
            'network': 'TRC20',
            'paymentMethod': 'usdt_trc20',
            'customerReference': data['order_id'],
            'description': f"Order #{data['order_id']}"
        })
        
        return jsonify({
            'success': True,
            'paymentId': payment['id'],
            'paymentAddress': payment['paymentAddress'],
            'expiresAt': payment['expiresAt']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/payment-status/<payment_id>')
def get_payment_status(payment_id):
    try:
        status = gateway.get_payment_status(payment_id)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/webhooks/payment', methods=['POST'])
def webhook_payment():
    payload = request.get_json()
    signature = payload.get('signature')
    
    # Verify signature
    if not signature or not gateway.verify_webhook_signature(payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Return 200 immediately
    response = jsonify({'success': True})
    response.status_code = 200
    
    # Process webhook asynchronously
    handle_payment_webhook(payload)
    
    return response

def handle_payment_webhook(payload):
    print(f"Processing webhook: {payload['paymentId']}")
    
    if payload['status'] == 'confirmed':
        update_order_status(payload['customerReference'], 'paid')
        send_confirmation_email(payload['customerReference'])
    elif payload['status'] == 'failed':
        update_order_status(payload['customerReference'], 'payment_failed')
    elif payload['status'] == 'expired':
        update_order_status(payload['customerReference'], 'payment_expired')

def update_order_status(order_id, status):
    print(f"Order {order_id} status: {status}")

def send_confirmation_email(order_id):
    print(f"Confirmation email sent for order {order_id}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## cURL

### Create Payment

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
    "description": "Purchase Order #12345"
  }'
```

### Get Payment Status

```bash
curl http://localhost:8080/api/payments/pay_abc123 \
  -H "Authorization: ApiKey pk_live_xxxxx"
```

### List Payments

```bash
curl http://localhost:8080/api/payments \
  -H "Authorization: ApiKey pk_live_xxxxx"
```

### Create Merchant

```bash
curl -X POST http://localhost:8080/api/merchants/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "email": "owner@store.com",
    "password": "SecurePassword123",
    "webhookUrl": "https://mystore.com/webhook"
  }'
```

### Login Merchant

```bash
curl -X POST http://localhost:8080/api/merchants/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@store.com",
    "password": "SecurePassword123"
  }' | jq '.token'
```

---

## React

### Installation

```bash
npm install axios
```

### Payment Component

```jsx
// PaymentGateway.jsx

import React, { useState } from 'react';
import axios from 'axios';

const PaymentGateway = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/create-payment', {
        amount: parseFloat(amount),
        orderId: `order_${Date.now()}`
      });

      setPayment(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (payment) {
    return (
      <div className="payment-confirmation">
        <h2>Payment Instructions</h2>
        <p>Please send <strong>{amount} USDT</strong> to:</p>
        <code>{payment.paymentAddress}</code>
        <p>Payment expires: {new Date(payment.expiresAt).toLocaleString()}</p>
        <p>
          <a href={payment.paymentLink} target="_blank" rel="noopener noreferrer">
            Open Payment Link
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCreatePayment}>
      <div className="form-group">
        <label>Amount (USDT)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Payment'}
      </button>
    </form>
  );
};

export default PaymentGateway;
```

### Custom Hook

```jsx
// useCryptoGate.js

import { useState, useCallback } from 'react';
import axios from 'axios';

export const useCryptoGate = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = useCallback(async (paymentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/payments', paymentData, {
        headers: {
          'Authorization': `ApiKey ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const getPaymentStatus = useCallback(async (paymentId) => {
    try {
      const response = await axios.get(`/api/payments/${paymentId}`, {
        headers: {
          'Authorization': `ApiKey ${apiKey}`
        }
      });
      return response.data;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  }, [apiKey]);

  return { createPayment, getPaymentStatus, loading, error };
};
```

---

## Vue.js

### Installation

```bash
npm install axios
```

### Payment Component

```vue
<!-- PaymentGateway.vue -->

<template>
  <div class="payment-gateway">
    <h2>Pay with Crypto</h2>
    
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!payment" class="payment-form">
      <form @submit.prevent="createPayment">
        <div class="form-group">
          <label>Amount (USDT)</label>
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <button :disabled="loading">
          {{ loading ? 'Creating...' : 'Create Payment' }}
        </button>
      </form>
    </div>

    <div v-else class="payment-confirmation">
      <h3>Payment Instructions</h3>
      <p>Send <strong>{{ amount }} USDT</strong> to:</p>
      <code>{{ payment.paymentAddress }}</code>
      <p>Expires: {{ new Date(payment.expiresAt).toLocaleString() }}</p>
      <a :href="payment.paymentLink" target="_blank">Open Payment Link</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      amount: '',
      loading: false,
      error: null,
      payment: null
    };
  },
  methods: {
    async createPayment() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/api/create-payment', {
          amount: this.amount,
          orderId: `order_${Date.now()}`
        });
        this.payment = response.data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Payment creation failed';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.payment-gateway {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
}

code {
  display: block;
  background: #f5f5f5;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  word-break: break-all;
}

.alert {
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
```

---

## ✅ Production Checklist

Before going to production, ensure:

- [ ] All API keys are from production environment
- [ ] Webhook URLs use HTTPS
- [ ] Error handling is comprehensive
- [ ] Logging is set up
- [ ] Tests are passing
- [ ] Webhook signature verification works
- [ ] Rate limiting is configured
- [ ] Database is properly backed up

---

## 📞 Need Help?

- Review `docs/API_REFERENCE.md` for endpoint details
- Review `docs/WEBHOOK_GUIDE.md` for webhook examples
- See `INSTALLATION_GUIDE.md` for setup help

All examples are production-ready. Modify as needed for your use case!
