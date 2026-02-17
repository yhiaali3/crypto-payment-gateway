// Theme (dark mode) handling
function applySavedTheme() {
  try {
    const t = localStorage.getItem('cpg_theme');
    if (t === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  } catch {}
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  try { localStorage.setItem('cpg_theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch {}
}

// Wire toggle button
document.addEventListener('DOMContentLoaded', () => {
  const btn = el('#theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
});

// expose
window.applySavedTheme = applySavedTheme;
window.toggleTheme = toggleTheme;