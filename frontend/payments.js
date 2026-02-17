// Payment-related handlers (create payment + copy/use latest)

document.addEventListener('DOMContentLoaded', () => {
  const pf = el('#payment-form');
  if (pf) {
    pf.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = el('#create-payment-btn');
      const form = ev.target;
      const apiKey = form.apiKey.value.trim();
      const sessionApiKey = window.merchantSession && window.merchantSession.apiKey;
      const amount = parseFloat(form.amount.value);
      const currency = form.currency.value;
      const network = form.network.value;
      const paymentMethod = form.paymentMethod.value;
      const customerReference = form.customerReference.value.trim();

      const usedApiKey = sessionApiKey || apiKey;
      if (!usedApiKey) {
        addLog('error', 'Missing apiKey for payment');
        return alert('ضع ApiKey الخاص بالـ Merchant.');
      }
      if (!amount || amount <= 0) {
        addLog('error', 'Invalid amount for payment', { amount });
        return alert('المبلغ يجب أن يكون أكبر من صفر.');
      }
      if (!customerReference) {
        addLog('error', 'Missing customerReference for payment');
        return alert('ادخل customerReference.');
      }

      btn.disabled = true;
      try {
        const body = { amount, currency, network, paymentMethod, customerReference };
        const headers = { 'Content-Type': 'application/json', Authorization: 'ApiKey ' + usedApiKey };
        const res = await fetch(API_BASE + '/api/payments', {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
        const json = await res.json();

        if (!res.ok) {
          addLog('error', 'Create payment failed', json);
          showResult('#payment-result', json);
          return;
        }

        // حفظ آخر دفعة
        window.latestPayment = json;
        saveLatestPayment();

        // عرض نتيجة مختصرة
        showResult('#payment-result', { paymentId: json.id, status: json.status, paymentLink: json.paymentLink });
        addLog('success', 'Payment created', { id: json.id, status: json.status, paymentLink: json.paymentLink });

        // تعبئة paymentId في نموذج الـ Webhook
        const webhookPaymentInput = el('#webhook-form input[name="paymentId"]');
        if (webhookPaymentInput) webhookPaymentInput.value = json.id || json.paymentId || '';

        // تعبئة merchantId في نموذج الـ Webhook إن توفر
        const webhookMerchantInput = el('#webhook-form input[name="merchantId"]');
        if (webhookMerchantInput) {
          if (json.merchantId) webhookMerchantInput.value = json.merchantId;
          else if (window.merchantSession && window.merchantSession.merchantId) webhookMerchantInput.value = window.merchantSession.merchantId;
        }

        autofillFromLatest();
      } catch (err) {
        addLog('error', 'Create payment exception', { message: err.message });
        showResult('#payment-result', { error: err.message });
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Copy / Use Latest buttons for payment inputs
  const copyPaymentIdBtn = el('#copy-paymentId-btn'); if (copyPaymentIdBtn) copyPaymentIdBtn.addEventListener('click', () => copyToClipboard(el('#webhook-form input[name="paymentId"]').value));
  const useLatestPaymentBtn = el('#use-latest-paymentid'); if (useLatestPaymentBtn) useLatestPaymentBtn.addEventListener('click', () => { const p = el('#webhook-form input[name="paymentId"]'); if (latestPayment && latestPayment.id) p.value = latestPayment.id; });

  // Copy paymentLink button
  const copyPaymentLinkBtn = el('#copy-paymentLink-btn'); if (copyPaymentLinkBtn) copyPaymentLinkBtn.addEventListener('click', () => {
    const link = el('#payment-result pre') ? el('#payment-result pre').innerText : '';
    copyToClipboard(link);
  });
});
