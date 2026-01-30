# 🚀 Crypto Payment Gateway API for Developers

![Landing Page](./frontend/public/screenshots/landing_page.png)

**Production-ready API for integrating crypto payments into your applications.**  
Secure, fast, and developer-friendly — built for real-world use.

---

## 🏆 Features

- ⚡ **Fast Integration** — Plug & play REST API with clear documentation  
- 🔐 **Secure Webhooks** — Verified callbacks with crypto-safe payloads  
- 🌐 **Multi-Currency Support** — USDT, BTC, ETH, and more  
- 🧪 **Clean JSON Responses** — Developer-friendly formatting  
- 📦 **Ready for Production** — Stable, tested, and documented

![Features](./frontend/public/screenshots/dashboard_cards.png)

---

## 📸 Showcase

### 🔹 API Example

```http
POST /api/payments
{
  "amount": 100,
  "currency": "USDT",
  "merchant_id": "your_id"
}
```

Response:

```json
{
  "transaction_id": "tx_123",
  "status": "pending"
}
```

![API Example](./frontend/public/screenshots/api_example.png)

---

### 🔹 Webhook Example

```json
{
  "event": "payment.completed",
  "transaction_id": "tx_123",
  "amount": 100,
  "currency": "USDT"
}
```

![Webhook Example](./frontend/public/screenshots/webhook_example.png)

---

## 📊 Dashboard Preview

![Dashboard Preview](./frontend/public/screenshots/dashboard_cards.png)

- Real-time stats  
- Transaction table  
- Webhook status  
- Charts (mock data)

---

## 🧱 Project Structure

Organized for clarity and scalability.

![Project Structure](./frontend/public/screenshots/project_structure.png)

---

## 💻 Code Samples

### Node.js  
![Node.js Code](./frontend/public/screenshots/Node_example.png)

### PHP  
![PHP Code](./frontend/public/screenshots/api_example.png)

### Python  
![Python Code](./frontend/public/screenshots/api_example.png)

---

## 📦 What’s Included

- ✅ Full API source code (Node.js / Express)  
- ✅ Frontend demo (Next.js + Tailwind)  
- ✅ Documentation files (Markdown)  
- ✅ Screenshots  
- ✅ Installation guide  
- ✅ License file  
- ✅ README (this file)

---

## 📥 Installation

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## ❓ FAQ

**هل يمكنني استخدامه في مشروع SaaS؟**  
نعم، الكود قابل للتوسعة ويعمل كقاعدة قوية لأي مشروع SaaS.

**هل يدعم العملات المتعددة؟**  
نعم، يدعم USDT وBTC وETH ويمكنك إضافة المزيد بسهولة.

**هل يحتوي على Webhook؟**  
نعم، مع نظام تحقق آمن ومُوثّق بالكامل.

---

## 📄 License

This project is licensed under the MIT License.  
See `LICENSE.txt` for details.

---

## 📣 Why Choose This API?

- Built by developers, for developers  
- Clean structure, easy to extend  
- Real screenshots, real code  
- Ready for CodeCanyon, Codester, Payhip, Gumroad

---

## 🔗 Documentation

- ![Documentation 1](./frontend/public/screenshots/VC-script1.png)
- ![Documentation 2](./frontend/public/screenshots/VCode.png)
- ![Documentation 3](./frontend/public/screenshots/VC-script2.png)  
- ![Documentation 4](./frontend/public/screenshots/Folder2.png)

---

## 💬 Support

For questions or custom integration, contact:  
**Yahia — yhiaali@gmail.com**

---

## 🚀 Ready to Launch?

This product is ready for sale.  
Use it, extend it, or integrate it into your next crypto-powered app.

## 📚 Technical Documentation

Looking for full API reference and developer setup?

👉 See [README.dev.md](./README.dev.md)