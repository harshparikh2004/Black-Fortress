const form = document.getElementById("registerForm");
const usernameEl = document.getElementById("username");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const roleEl = document.getElementById("role");
const usernameErr = document.getElementById("usernameErr");
const emailErr = document.getElementById("emailErr");
const passwordErr = document.getElementById("passwordErr");
const roleErr = document.getElementById("roleErr");
const formErr = document.getElementById("formErr");
const togglePw = document.getElementById("togglePw");
const pwBar = document.getElementById("pwBar");
const pwLabel = document.getElementById("pwLabel");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isStrongPassword(v) {
  return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
}

function scorePassword(v) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (v.length >= 12) score++;
  return Math.min(score, 5);
}

function updatePwMeter(v) {
  const s = scorePassword(v);
  const pct = (s / 5) * 100;
  if (pwBar) pwBar.style.width = pct + '%';
  if (pwLabel) pwLabel.textContent = s <= 2 ? 'Weak' : s === 3 ? 'Fair' : 'Strong';
}

passwordEl.addEventListener('input', () => {
  updatePwMeter(passwordEl.value);
});

togglePw?.addEventListener('click', () => {
  const type = passwordEl.type === 'password' ? 'text' : 'password';
  passwordEl.type = type;
  togglePw.textContent = type === 'password' ? 'Show' : 'Hide';
  togglePw.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  usernameErr.textContent = emailErr.textContent = passwordErr.textContent = roleErr.textContent = formErr.textContent = "";

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const role = roleEl.value;

  let ok = true;
  if (username.length < 3) { usernameErr.textContent = "Min 3 characters"; ok = false; }
  if (!isValidEmail(email)) { emailErr.textContent = "Enter a valid email"; ok = false; }
  if (!isStrongPassword(password)) { passwordErr.textContent = "Use 8+ chars, number, symbol"; ok = false; }
  if (!role) { roleErr.textContent = "Select a role"; ok = false; }
  if (!ok) return;

  try {
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="spinner"></span> Creating...';
    const captchaToken = typeof window.getCaptchaTokenPromise === 'function'
      ? (await window.getCaptchaTokenPromise())
      : (window.captchaToken || "");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role, captchaToken })
    });
    const data = await res.json();
    if (!res.ok) { throw new Error(data.error || "Registration failed"); }
    window.location.href = "/login.html";
  } catch (err) {
    formErr.textContent = err.message;
    formErr.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Create account';
  }
});


