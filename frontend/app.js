// app.js: entry point — فقط استدعاء تهيئة الواجهة
// يحتفظ بحد أدنى من الكود، جميع الوظائف مفصولة في ملفات مستقلة

// Load persisted latest merchant/payment and theme
if (window.loadLatestFromStorage) loadLatestFromStorage();
if (window.applySavedTheme) applySavedTheme();

// Page protection & logout
document.addEventListener('DOMContentLoaded', () => {
	// load persisted merchant session
	if (window.loadMerchantSession) window.loadMerchantSession();

	const token = window.merchantSession && window.merchantSession.token;

	// if no token -> redirect to login
	if (!token) {
		try { localStorage.removeItem('merchantSession'); } catch (e) {}
		window.location.href = 'login.html';
		return;
	}

	// if token expired -> clear and redirect
	if (window.isTokenExpired && window.isTokenExpired(token)) {
		try { localStorage.removeItem('merchantSession'); } catch (e) {}
		window.merchantSession.token = null;
		window.merchantSession.merchantId = null;
		window.merchantSession.apiKey = null;
		window.location.href = 'login.html';
		return;
	}

	// token valid -> reveal page
	document.body.classList.remove('protected');
	if (typeof showNol === 'function') showNol('info');

	// initialize merchant-creation UI if available
	if (typeof window.setupMerchantCreation === 'function') {
		window.setupMerchantCreation();
	}

	// wire logout button
	const logoutBtn = document.getElementById('logout-btn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', () => {
			try { localStorage.removeItem('merchantSession'); } catch (e) {}
			window.merchantSession.token = null;
			window.merchantSession.merchantId = null;
			window.merchantSession.apiKey = null;
			window.location.href = 'login.html';
		});
	}
});

