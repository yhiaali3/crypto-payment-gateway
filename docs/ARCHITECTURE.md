# Architecture — Crypto Payment Gateway

مخطط معماري وشرح عمل النظام داخليًا.

## نظرة عامة
النظام مبني على طبقتين أساسيتين:
- Frontend: تطبيق React + Vite في `client/`
- Backend: Express API في `backend/server/` مع MongoDB للتخزين


## طبقات النظام
- Presentation: `client/` — صفحات الواجهة، صفحات الدفع، لوحة التاجر.
- API Layer: `backend/server/routes/*` — نقاط النهاية التي تتعامل مع الطلبات.
- Services: `backend/server/services/*` — طبقة منطق الأعمال التي تتعامل مع بوابات الدفع، توليد العناوين، والتحقق من المدفوعات.
- Data Layer: `backend/server/models/*` — تفاعلات مع MongoDB.
- Shared Types: `shared/api.ts` — واجهات TypeScript مشتركة.


## تدفق الدفع (Payment Flow)
1. التاجر يطلب إنشاء دفعة عبر `POST /api/payments` مع التفاصيل.
2. الخادم يتحقق من التاجر، يحسب تفاصيل التحويل (مثل عنوان المستلم أو بيانات الدفع الخارجية).
3. يتم إنشاء سجل دفعة في قاعدة البيانات مع الحالة `pending`.
4. تُرسل بيانات الدفع للعميل (عنوان محفظة، رابط Binance Pay، أو QR code).
5. بعد استلام الدفع، مزوّد الشبكة/البوابة يرسل Webhook أو يتحقق الخادم من البلوكتشين.
6. عند التأكيد، يتم تحديث حالة الدفع إلى `confirmed` وتُبلّغ نقطة اتصال التاجر (`callback_url`).


## مكونات رئيسية في `backend/server/`
- `routes/` — تعريفات الـ endpoints
- `services/` — تكامل مع مزودي الدفع (binance-pay, usdt-trc20, ...)
- `models/` — نماذج البيانات (Merchants, Payments)
- `middlewares/` — تحقق التوثيق، التحقق من الـ body، التحقق من webhooks


## أمان وموثوقية
- تحقق من التواقيع في Webhooks (HMAC).
- احفظ المفاتيح في متغيرات بيئة أو secret manager.
- ضع قيودًا على معدلات الطلبات (rate limiting) لحماية الـ API.
- طبّق عمليات إعادة المحاولة عند فشل الاتصالات مع مزودي الدفع.


## ملاحظات النشر
- استخدم HTTPS وبيئة منفصلة للـ secrets.
- فكر في تعبئة Dockerfile وملف `docker-compose` لتشغيل الحاويات (db + server) بسهولة.


---

هذا المستند يوفر رؤية معمّقة تساعد المطورين على التوسيع أو الدمج مع خدمات أخرى.