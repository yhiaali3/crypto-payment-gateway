// Dashboard: tables, pagination, charts

const PAGE_SIZE = 10;

// Simple paginator helper
function paginate(items, page) {
  const total = Math.ceil(items.length / PAGE_SIZE) || 1;
  const p = Math.max(1, Math.min(page, total));
  const start = (p - 1) * PAGE_SIZE;
  return { page: p, total, items: items.slice(start, start + PAGE_SIZE) };
}

// Normalize status values to canonical strings used by charts
function normalizeStatus(status) {
  if (status === 1 || status === "success" || status === 'confirmed') return "success";
  if (status === 0 || status === "failed") return "failed";
  return "pending";
}

// Payments table with pagination state
const paymentsState = { list: [], page: 1 };
const webhooksState = { list: [], page: 1 };

function renderPaymentsTablePaged() {
  const { page, total, items } = paginate(paymentsState.list, paymentsState.page);
  const container = el('#dashboard-payments');
  if (!items || items.length === 0) { container.innerHTML = '<pre>لا توجد دفعات.</pre>'; el('#payments-pager-info').innerText = `Page ${page} of ${total}`; if (typeof showNol === 'function') showNol('empty'); return; }

  const rows = items.map(p => `
    <tr>
      <td>${escapeHtml(p.id)}</td>
      <td>${escapeHtml(String(p.amount))}</td>
      <td>${escapeHtml(p.currency)}</td>
      <td>${escapeHtml(p.status)}</td>
      <td>${escapeHtml(p.customerReference || '')}</td>
      <td>${escapeHtml(p.createdAt)}</td>
      <td><a href="${escapeHtml(p.paymentLink || '#')}" target="_blank">link</a></td>
    </tr>
  `).join('');

  container.innerHTML = `\n    <table style="width:100%;border-collapse:collapse;font-size:13px">\n      <thead>\n        <tr style="text-align:left;background:#fafafa">\n          <th style="padding:6px;border-bottom:1px solid #eee">ID</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">amount</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">currency</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">status</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">customerRef</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">createdAt</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">link</th>\n        </tr>\n      </thead>\n      <tbody>${rows}</tbody>\n    </table>\n  `;

  el('#payments-pager-info').innerText = `Page ${page} of ${total}`;
}

function renderWebhooksTablePaged() {
  const { page, total, items } = paginate(webhooksState.list, webhooksState.page);
  const container = el('#dashboard-webhooks');
  if (!items || items.length === 0) { container.innerHTML = '<pre>لا توجد سجلات Webhook.</pre>'; el('#webhooks-pager-info').innerText = `Page ${page} of ${total}`; if (typeof showNol === 'function') showNol('empty'); return; }

  const rows = items.map(i => `
    <tr>
      <td>${escapeHtml(i.id)}</td>
      <td>${escapeHtml(i.paymentId)}</td>
      <td>${escapeHtml(String(i.status))}</td>
      <td><pre style="margin:0">${escapeHtml(JSON.stringify(i.payload || {}, null, 2))}</pre></td>
      <td>${escapeHtml(i.createdAt)}</td>
    </tr>
  `).join('');

  container.innerHTML = `\n    <table style="width:100%;border-collapse:collapse;font-size:13px">\n      <thead>\n        <tr style="text-align:left;background:#fafafa">\n          <th style="padding:6px;border-bottom:1px solid #eee">ID</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">paymentId</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">status</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">payload</th>\n          <th style="padding:6px;border-bottom:1px solid #eee">createdAt</th>\n        </tr>\n      </thead>\n      <tbody>${rows}</tbody>\n    </table>\n  `;

  el('#webhooks-pager-info').innerText = `Page ${page} of ${total}`;
}

// Fetch & set state then render + draw charts
async function fetchAndShowPayments() {
  if (!merchantSession.token) return addLog('error', 'Not authenticated - fetch payments');
  try {
    const res = await fetch(API_BASE + '/api/payments/my', { headers: { Authorization: 'Bearer ' + merchantSession.token } });
    const json = await res.json();
    if (!res.ok) { addLog('error', 'Fetch payments failed', json); paymentsState.list = []; renderPaymentsTablePaged(); if (typeof showNol === 'function') showNol('error', { status: res.status, reason: json?.error || 'Fetch payments failed' }); return; }
    paymentsState.list = json;
    paymentsState.page = 1;
    renderPaymentsTablePaged();
    drawPaymentsPerDayChart(json);
    drawSuccessFailChart(json);
    addLog('info', 'Fetched payments', { count: json.length });
    if (typeof showNol === 'function') showNol('success', { count: json.length });
  } catch (e) { addLog('error', 'Fetch payments exception', { message: e.message }); if (typeof showNol === 'function') showNol('error', { message: e.message }); }
}

async function fetchAndShowWebhooks() {
  if (!merchantSession.token) return addLog('error', 'Not authenticated - fetch webhooks');
  try {
    const res = await fetch(API_BASE + '/api/webhooks/my', { headers: { Authorization: 'Bearer ' + merchantSession.token } });
    const json = await res.json();
    if (!res.ok) { addLog('error', 'Fetch webhooks failed', json); webhooksState.list = []; renderWebhooksTablePaged(); if (typeof showNol === 'function') showNol('error', { status: res.status, reason: json?.error || 'Fetch webhooks failed' }); return; }
    webhooksState.list = json;
    webhooksState.page = 1;
    renderWebhooksTablePaged();
    drawWebhooksPerDayChart(json);
    addLog('info', 'Fetched webhook logs', { count: json.length });
    if (typeof showNol === 'function') showNol('success', { count: json.length });
  } catch (e) { addLog('error', 'Fetch webhooks exception', { message: e.message }); if (typeof showNol === 'function') showNol('error', { message: e.message }); }
}

// Pagination controls
function paymentsPrev() { if (paymentsState.page > 1) { paymentsState.page--; renderPaymentsTablePaged(); } }
function paymentsNext() { const total = Math.ceil(paymentsState.list.length / PAGE_SIZE) || 1; if (paymentsState.page < total) { paymentsState.page++; renderPaymentsTablePaged(); } }
function webhooksPrev() { if (webhooksState.page > 1) { webhooksState.page--; renderWebhooksTablePaged(); } }
function webhooksNext() { const total = Math.ceil(webhooksState.list.length / PAGE_SIZE) || 1; if (webhooksState.page < total) { webhooksState.page++; renderWebhooksTablePaged(); } }

// Charts (Canvas API)
function drawPaymentsPerDayChart(payments) {
  const canvas = el('#chart-payments-per-day'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const counts = {};
  payments.forEach(p => {
    const day = new Date(p.createdAt).toISOString().slice(0,10);
    counts[day] = (counts[day] || 0) + 1;
  });
  const labels = Object.keys(counts).sort();
  const values = labels.map(l => counts[l]);
  drawBarChart(ctx, labels, values, 'Payments / day');
}

function drawSuccessFailChart(payments) {
  const canvas = el('#chart-success-fail'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let success = 0; let failed = 0; let pending = 0;
  payments.forEach(p => {
    const normalized = normalizeStatus(p.status);
    if (normalized === 'success') success++;
    else if (normalized === 'failed') failed++;
    else pending++;
  });
  drawPieChart(ctx, ['success','failed','pending'], [success, failed, pending]);
}

function drawWebhooksPerDayChart(webhooks) {
  const canvas = el('#chart-webhooks-per-day'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Aggregate per-day stats separated by normalized status
  const stats = {};
  webhooks.forEach(w => {
    const day = new Date(w.createdAt).toISOString().slice(0,10);
    const normalized = normalizeStatus(w.status);
    if (!stats[day]) stats[day] = { success: 0, failed: 0, pending: 0, total: 0 };
    if (normalized === 'success') stats[day].success++;
    else if (normalized === 'failed') stats[day].failed++;
    else stats[day].pending++;
    stats[day].total++;
  });

  const days = Object.keys(stats).sort();
  const successCounts = days.map(d => stats[d].success);
  const failedCounts = days.map(d => stats[d].failed);
  const pendingCounts = days.map(d => stats[d].pending);

  // Draw grouped bars: success, failed, pending per day
  drawGroupedBarChart(ctx, days, [successCounts, failedCounts, pendingCounts], ['#10b981','#ef4444','#f59e0b'], 'Webhooks / day');
}

// Primitive chart helpers
function drawBarChart(ctx, labels, values, title) {
  const w = ctx.canvas.width = 400; const h = ctx.canvas.height = 140; ctx.clearRect(0,0,w,h);
  const max = Math.max(...values, 1); const barWidth = Math.max(6, (w - 40) / Math.max(values.length,1));
  ctx.fillStyle = '#0ea5a6'; let x = 30;
  values.forEach((v, i) => { const barH = (v / max) * (h - 40); ctx.fillRect(x, h - 20 - barH, barWidth - 4, barH); x += barWidth; });
  // labels
  ctx.fillStyle = '#374151'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; x = 30 + barWidth/2;
  labels.forEach((lab, i) => { ctx.fillText(lab.slice(5), x, h - 4); x += barWidth; });
  // title
  ctx.fillStyle = '#111827'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(title, 6, 12);
}

// Draw grouped bars for multiple series per label
function drawGroupedBarChart(ctx, labels, seriesArrays, colors, title) {
  const seriesCount = seriesArrays.length;
  const w = ctx.canvas.width = Math.max(220, labels.length * 30 + 80);
  const h = ctx.canvas.height = 160;
  ctx.clearRect(0,0,w,h);
  const totals = labels.map((_, i) => seriesArrays.reduce((s, arr) => s + (arr[i] || 0), 0));
  const max = Math.max(...totals, 1);
  const groupWidth = (w - 60) / Math.max(labels.length,1);
  const barWidth = Math.max(6, groupWidth / Math.max(seriesCount,1) - 4);

  // draw bars
  labels.forEach((lab, idx) => {
    const baseX = 30 + idx * groupWidth;
    for (let s = 0; s < seriesCount; s++) {
      const val = seriesArrays[s][idx] || 0;
      const barH = (val / max) * (h - 60);
      const x = baseX + s * (barWidth + 4);
      const y = h - 30 - barH;
      ctx.fillStyle = colors[s] || '#0ea5a6';
      ctx.fillRect(x, y, barWidth, barH);
    }
  });

  // labels
  ctx.fillStyle = '#374151'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
  labels.forEach((lab, i) => { const x = 30 + i * groupWidth + groupWidth/2; ctx.fillText(lab.slice(5), x, h - 6); });

  // legend
  const legendX = w - 120; let ly = 8;
  for (let s = 0; s < seriesCount; s++) {
    ctx.fillStyle = colors[s] || '#111827'; ctx.fillRect(legendX, ly, 10, 10);
    ctx.fillStyle = '#111827'; ctx.textAlign = 'left'; ctx.fillText((s===0?'success':s===1?'failed':'pending') + ': ' + (seriesArrays[s].reduce((a,b)=>a+b,0)), legendX + 14, ly + 9);
    ly += 16;
  }

  // title
  ctx.fillStyle = '#111827'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(title, 6, 12);
}

function drawPieChart(ctx, labels, values) {
  const w = ctx.canvas.width = 220; const h = ctx.canvas.height = 140; ctx.clearRect(0,0,w,h);
  const total = values.reduce((s,a)=>s+a,0) || 1; let start = 0; const cx = w/2; const cy = h/2; const r = Math.min(w,h)/3;
  const colors = ['#10b981','#ef4444','#0ea5a6','#f59e0b'];
  values.forEach((v,i)=>{ const slice = (v/total)*Math.PI*2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,start+slice); ctx.closePath(); ctx.fillStyle = colors[i%colors.length]; ctx.fill(); start += slice; });
  // legend
  ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; let ly = 8; labels.forEach((l,i)=>{ ctx.fillStyle = colors[i%colors.length]; ctx.fillRect(w-80, ly, 10,10); ctx.fillStyle = '#111827'; ctx.fillText(`${l}: ${values[i]}`, w-64, ly+9); ly += 16; });
}

// Wire dashboard controls
document.addEventListener('DOMContentLoaded', () => {
  // attach to IDs used in the HTML (keeps backward compatibility)
  el('#fetch-payments-btn')?.addEventListener('click', fetchAndShowPayments);
  el('#fetch-webhooks-btn')?.addEventListener('click', fetchAndShowWebhooks);

  el('#payments-prev')?.addEventListener('click', paymentsPrev);
  el('#payments-next')?.addEventListener('click', paymentsNext);
  el('#webhooks-prev')?.addEventListener('click', webhooksPrev);
  el('#webhooks-next')?.addEventListener('click', webhooksNext);

  // initial render from any loaded latest data
  renderPaymentsTablePaged();
  renderWebhooksTablePaged();
});


// Setup create-merchant flow: called after auth/session is loaded
window.setupMerchantCreation = function setupMerchantCreation() {
  const card = el('#create-merchant-card');
  const btn = el('#create-merchant-btn');
  const status = el('#create-merchant-status');

  if (!card || !btn) return;

  // show card when merchantId is missing
  if (!window.merchantSession || !window.merchantSession.merchantId) {
    card.style.display = 'block';
    status.innerText = '';
  } else {
    card.style.display = 'none';
    return;
  }

  btn.addEventListener('click', async () => {
    if (!window.merchantSession || !window.merchantSession.token) {
      addLog('error', 'Cannot create merchant: not authenticated');
      status.innerText = 'غير مصرح';
      return;
    }

    btn.disabled = true;
    status.innerText = 'جاري الإنشاء...';

    try {
      const res = await fetch(API_BASE + '/api/merchants/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + window.merchantSession.token,
        },
        body: JSON.stringify({})
      });

      // parse json only when present
        let json = {};
        try { json = await res.json(); } catch (e) { json = {}; }

        if (!res.ok) {
          addLog('error', 'Create merchant failed', { status: res.status, body: json });
          if (res.status === 404) {
            // backend doesn't expose this path
            status.innerHTML = 'Endpoint not found';
            // suggest using signup or contacting backend
            addLog('info', 'Create endpoint missing on server', { endpoint: '/api/merchants/create' });
            if (typeof showNol === 'function') showNol('error', { endpoint: '/api/merchants/create', status: 404 });
          } else {
            status.innerText = json?.error || 'فشل الإنشاء';
            if (typeof showNol === 'function') showNol('error', { status: res.status, reason: json?.error });
          }
          btn.disabled = false;
          return;
        }

      // Expecting response to include merchantId, apiKey, apiSecret (optional)
      const merchantId = json.merchantId || json.id || (json.merchant && json.merchant.id);
      const apiKey = json.apiKey || json.key || json.apiKeyId || null;
      const apiSecret = json.apiSecret || json.secret || null;

      // update merchantSession and persist
      window.merchantSession = window.merchantSession || {};
      if (merchantId) window.merchantSession.merchantId = merchantId;
      if (apiKey) window.merchantSession.apiKey = apiKey;
      if (apiSecret) window.merchantSession.apiSecret = apiSecret;
      try { localStorage.setItem('merchantSession', JSON.stringify(window.merchantSession)); } catch (e) {}

      addLog('info', 'Merchant created', { merchantId, apiKey: !!apiKey });
      if (typeof showNol === 'function') showNol('success', { merchantId, apiKey: !!apiKey });
      status.innerText = 'تم الإنشاء';
      card.style.display = 'none';

      // refresh dashboard data now that merchant exists
      if (typeof fetchAndShowPayments === 'function') fetchAndShowPayments();
      if (typeof fetchAndShowWebhooks === 'function') fetchAndShowWebhooks();

    } catch (err) {
      addLog('error', 'Create merchant exception', { message: err.message });
      if (typeof showNol === 'function') showNol('error', { message: err.message });
      status.innerText = 'خطأ أثناء الإنشاء';
      btn.disabled = false;
    }
  });
};
