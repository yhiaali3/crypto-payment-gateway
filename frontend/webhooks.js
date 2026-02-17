// Webhook handlers

document.addEventListener('DOMContentLoaded', () => {
  const wf = el('#webhook-form');
  if (wf) {
    wf.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = el('#send-webhook-btn');
      const form = ev.target;
      const paymentId = form.paymentId.value.trim();
      const merchantId = form.merchantId.value.trim();
      const status = form.status.value;
      const payloadText = form.payload.value.trim() || '{}';

      if (!paymentId || !merchantId) {
        addLog('error', 'Missing paymentId or merchantId for webhook');
        return alert('ادخل paymentId و merchantId.');
      }

      let payloadObj = {};
      try {
        payloadObj = JSON.parse(payloadText);
      } catch (e) {
        addLog('error', 'Invalid JSON payload for webhook', { error: e.message });
        return alert('حقل payload يجب أن يحتوي JSON صالح.');
      }

      btn.disabled = true;
      try {
        const body = { paymentId, merchantId, status, payload: payloadObj };
        const headers = { 'Content-Type': 'application/json' };
        if (window.merchantSession && window.merchantSession.token) headers.Authorization = 'Bearer ' + window.merchantSession.token;
        const res = await fetch(API_BASE + '/api/webhook/payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
        const json = await res.json();

        if (!res.ok) {
          addLog('error', 'Send webhook failed', json);
          showResult('#webhook-result', json);
          return;
        }

        showResult('#webhook-result', json);
        addLog('info', 'Webhook sent', { request: body, response: json });
      } catch (err) {
        addLog('error', 'Send webhook exception', { message: err.message });
        showResult('#webhook-result', { error: err.message });
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Copy / Use Latest buttons for merchantId (use merchantSession only)
  const copyMerchantIdBtn = el('#copy-merchantId-btn'); if (copyMerchantIdBtn) copyMerchantIdBtn.addEventListener('click', () => copyToClipboard(window.merchantSession?.merchantId || el('#webhook-form input[name="merchantId"]').value));
  const useLatestMerchantBtn2 = el('#use-latest-merchantid'); if (useLatestMerchantBtn2) useLatestMerchantBtn2.addEventListener('click', () => { const m = el('#webhook-form input[name="merchantId"]'); if (window.merchantSession && window.merchantSession.merchantId) m.value = window.merchantSession.merchantId; });
});