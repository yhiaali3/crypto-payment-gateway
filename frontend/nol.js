// nol.js — "NOL" lightweight UI assistant (frontend-only)
(function () {
  const MESSAGES = {
    success: [
      "تمام. هيك الكود لازم يكون. نظيف… وبدون دراما.",
      "نجحت العملية — كل شيء على ما يرام."
    ],
    error: [
      "المسار مش موجود… واللي كتب الكود كان مستعجل.",
      "غلط داخلي بسيط — دعنا نحاول مرة ثانية."
    ],
    empty: [
      "ما في بيانات. يا إما النظام جديد… يا إما في شي غلط.",
      "قائمة فارغة حالياً — حاول إنشاء عنصر جديد."
    ],
    info: [
      "نول أونلاين. خلّينا نشوف شو مخبّي إلنا اليوم.",
      "نول جاهز للمساعدة — اعطني أمر!"
    ]
  };

  // Render text into the NOL box (primitive) — show briefly
  function showNolMessage(text) {
    const box = document.getElementById('nol-box');
    if (!box) return;
    box.textContent = String(text || '');
    box.classList.add('show');
    clearTimeout(box._nolTimeout);
    box._nolTimeout = setTimeout(() => box.classList.remove('show'), 4200);
  }

  function pick(type) {
    const arr = MESSAGES[type] || [String(type || '')];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function formatDetails(details) {
    if (!details) return '';
    if (typeof details === 'string') return ` — ${details}`;
    if (typeof details === 'number') return ` — ${details}`;
    if (typeof details === 'object') {
      if (details.count !== undefined) return ` — ${details.count} عنصر${details.count > 1 ? 'ات' : ''}`;
      if (details.merchantId) return ` — id: ${details.merchantId}`;
      if (details.endpoint) return ` — endpoint: ${details.endpoint}`;
      if (details.status) return ` — status: ${details.status}`;
      return ` — ${JSON.stringify(details)}`;
    }
    return '';
  }

  // showNol(type, details?) — primary API
  function showNol(type, details) {
    const box = document.getElementById('nol-box');
    if (!box) return;

    const base = MESSAGES[type] ? pick(type) : String(type || '');
    const suffix = formatDetails(details);
    const text = `${base}${suffix}`;

    // visual (toast) — add `show` to display, remove to hide
    box.textContent = text;
    box.classList.add('show');

    // auto-hide after a short delay for non-persistent messages
    if (type !== 'error') {
      clearTimeout(box._nolTimeout);
      box._nolTimeout = setTimeout(() => {
        box.classList.remove('show');
      }, 5500);
    }
  }

  // preserve backward-compat: direct text setter
  window.showNolMessage = showNolMessage;
  window.showNol = showNol;

  // initial hint on load
  document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('nol-box');
    if (box) {
      box.textContent = pick('info');
      box.classList.add('show');
      clearTimeout(box._nolTimeout);
      box._nolTimeout = setTimeout(() => { box.classList.remove('show'); }, 4200);
    }
  });
})();
