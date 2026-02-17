// Auth (signup + login) — لا تغيّر أسماء الدوال

// Merchant signup moved to dedicated signup.html — no inline signup on dashboard

// merchant login is handled on login.html; no inline login on dashboard

// Attach handlers
document.addEventListener('DOMContentLoaded', () => {
  // Copy / Use Latest buttons for merchant-related fields (use merchantSession only)
  const copyApiKeyBtn = el('#copy-apiKey-btn'); if (copyApiKeyBtn) copyApiKeyBtn.addEventListener('click', () => copyToClipboard(window.merchantSession?.apiKey || ''));
  const useLatestApiKeyBtn = el('#use-latest-apikey'); if (useLatestApiKeyBtn) useLatestApiKeyBtn.addEventListener('click', () => { const apiKeyInput = el('#payment-form input[name="apiKey"]'); if (window.merchantSession?.apiKey) apiKeyInput.value = window.merchantSession.apiKey; });
});
