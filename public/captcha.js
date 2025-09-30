async function loadSiteKey() {
    try {
        const res = await fetch('/api/config/public');
        const cfg = await res.json();
        return cfg.recaptchaSiteKey || '';
    } catch {
        return '';
    }
}

function injectRecaptcha(siteKey) {
    return new Promise((resolve) => {
        if (!siteKey) { window.captchaToken = ''; resolve(); return; }
        if (document.getElementById('recaptchaScript')) { resolve(); return; }
        const s = document.createElement('script');
        s.id = 'recaptchaScript';
        s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
        s.async = true;
        s.defer = true;
        s.onload = resolve;
        document.head.appendChild(s);
    });
}

function refreshToken(siteKey) {
    if (!window.grecaptcha || !siteKey) { window.captchaToken = ''; return; }
    grecaptcha.ready(async () => {
        try {
            const t = await grecaptcha.execute(siteKey, { action: 'submit' });
            window.captchaToken = t;
        } catch {
            window.captchaToken = '';
        }
    });
}

(async function init() {
    const siteKey = await loadSiteKey();
    await injectRecaptcha(siteKey);
    refreshToken(siteKey);
    setInterval(() => refreshToken(siteKey), 90 * 1000);
})();
