// Utilities used across the frontend
const API_BASE = 'http://localhost:3000';

// Shared state
let latestMerchant = null;
let latestPayment = null;
let merchantSession = { token: null, merchantId: null, apiKey: null };

// DOM helper
const el = (sel) => document.querySelector(sel);
const fmtTime = (d = new Date()) => new Date(d).toLocaleString();

// Logs (append newest to bottom) + auto-scroll
const logsStore = [];
function addLog(type, title, data) {
  const logs = el('#logs');
  const node = document.createElement('div');
  node.className = 'log ' + (type || 'info');
  node.innerHTML = `\n    <div class="ts">${fmtTime()}</div>\n    <div><strong>${escapeHtml(title)}</strong></div>\n    <div style="margin-top:6px"><pre>${escapeHtml(JSON.stringify(data || {}, null, 2))}</pre></div>\n  `;

  logs.appendChild(node); // newest at bottom
  logsStore.push({ ts: new Date().toISOString(), type, title, data });
  // keep max 200 logs
  while (logs.children.length > 200) logs.removeChild(logs.firstChild);
  while (logsStore.length > 200) logsStore.shift();

  // auto-scroll to bottom
  logs.scrollTop = logs.scrollHeight;
}

function showResult(selector, obj) {
  const container = el(selector);
  if (!container) return;
  container.innerHTML = `<pre>${escapeHtml(JSON.stringify(obj, null, 2))}</pre>`;
}

function escapeHtml(s) {
  if (typeof s !== 'string') s = String(s);
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// Persist latest merchant/payment to localStorage
function saveLatestMerchant() {
  try { if (latestMerchant) localStorage.setItem('cpg_latestMerchant', JSON.stringify(latestMerchant)); } catch {}
}
function saveLatestPayment() {
  try { if (latestPayment) localStorage.setItem('cpg_latestPayment', JSON.stringify(latestPayment)); } catch {}
}

function loadLatestFromStorage() {
  try {
    const m = localStorage.getItem('cpg_latestMerchant');
    const p = localStorage.getItem('cpg_latestPayment');
    if (m) latestMerchant = JSON.parse(m);
    if (p) latestPayment = JSON.parse(p);

    // do not autofill apiKey/merchantId from stored "latestMerchant"; use merchantSession instead
    const webhookPaymentInput = el('#webhook-form input[name="paymentId"]');
    if (latestPayment && webhookPaymentInput && !webhookPaymentInput.value) webhookPaymentInput.value = latestPayment.id || latestPayment.paymentId || '';
  } catch (e) { /* noop */ }
}

// Persist / load merchantSession (used by login.html and in-page login)
function saveMerchantSession() {
  try { if (merchantSession && merchantSession.token) localStorage.setItem('merchantSession', JSON.stringify(merchantSession)); } catch {}
}

function loadMerchantSession() {
  try {
    const s = localStorage.getItem('merchantSession');
    if (s) {
      const parsed = JSON.parse(s);
      merchantSession.token = parsed.token || null;
      merchantSession.merchantId = parsed.merchantId || null;
      merchantSession.apiKey = parsed.apiKey || null;
    }
  } catch (e) { /* noop */ }
}

// Check JWT expiry
function isTokenExpired(token) {
  try {
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = parts[1];
    // base64url -> base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const obj = JSON.parse(json);
    if (!obj.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return obj.exp <= now;
  } catch (e) { return true; }
}

// Fill visible inputs from runtime/latest data (used by multiple modules)
function autofillFromLatest() {
  const apiKeyInput = el('#payment-form input[name="apiKey"]');
  const webhookMerchantInput = el('#webhook-form input[name="merchantId"]');
  const webhookPaymentInput = el('#webhook-form input[name="paymentId"]');

  if (apiKeyInput && !apiKeyInput.value) {
    apiKeyInput.value = merchantSession.apiKey || '';
  }
  if (webhookMerchantInput && !webhookMerchantInput.value) {
    webhookMerchantInput.value = merchantSession.merchantId || '';
  }
  if (webhookPaymentInput && !webhookPaymentInput.value) {
    webhookPaymentInput.value = latestPayment?.id || latestPayment?.paymentId || '';
  }
}

// Attach log/download/clear handlers
document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = el('#clear-logs');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    const logsEl = el('#logs');
    if (logsEl) logsEl.innerHTML = '';
    logsStore.length = 0;
    addLog('info', 'Logs cleared');
  });

  const downloadBtn = el('#download-logs');
  if (downloadBtn) downloadBtn.addEventListener('click', downloadLogs);
  const downloadBtn2 = el('#download-logs-btn');
  if (downloadBtn2) downloadBtn2.addEventListener('click', downloadLogs);
});

// Copy to clipboard helper
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text || '');
    addLog('success', 'Copied to clipboard', { text: text ? (text.length > 30 ? text.substring(0,30)+'...' : text) : '' });
    return true;
  } catch (e) {
    addLog('error', 'Copy failed', { message: e.message });
    return false;
  }
}

// Download logs as JSON
function downloadLogs() {
  const blob = new Blob([JSON.stringify(logsStore, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cpg-logs.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Expose to global for other modules
window.el = el;
window.fmtTime = fmtTime;
window.addLog = addLog;
window.showResult = showResult;
window.escapeHtml = escapeHtml;
window.latestMerchant = latestMerchant;
window.latestPayment = latestPayment;
window.merchantSession = merchantSession;
window.saveLatestMerchant = saveLatestMerchant;
window.saveLatestPayment = saveLatestPayment;
window.loadLatestFromStorage = loadLatestFromStorage;
window.copyToClipboard = copyToClipboard;
window.downloadLogs = downloadLogs;
window.saveMerchantSession = saveMerchantSession;
window.loadMerchantSession = loadMerchantSession;
window.isTokenExpired = isTokenExpired;
