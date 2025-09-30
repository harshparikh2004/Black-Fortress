const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const emailErr = document.getElementById("emailErr");
const passwordErr = document.getElementById("passwordErr");
const formErr = document.getElementById("formErr");
const togglePw = document.getElementById("togglePw");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailErr.textContent = "";
  passwordErr.textContent = "";
  formErr.textContent = "";
  formErr.style.display = "none";

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  let ok = true;
  if (!isValidEmail(email)) { emailErr.textContent = "Enter a valid email"; ok = false; }
  if ((password || "").length < 8) { passwordErr.textContent = "Minimum 8 characters"; ok = false; }
  if (!ok) return;

  try {
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="spinner"></span> Signing in...';
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, captchaToken: window.captchaToken || "" })
    });
    const data = await res.json();
    if (!res.ok) { throw new Error(data.error || "Login failed"); }
    window.location.href = data.role === "admin" ? "/admin.html" : "/user.html";
  } catch (err) {
    formErr.textContent = err.message;
    formErr.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = 'Sign in';
  }
});

togglePw?.addEventListener("click", () => {
  const type = passwordEl.type === "password" ? "text" : "password";
  passwordEl.type = type;
  togglePw.textContent = type === "password" ? "Show" : "Hide";
  togglePw.setAttribute("aria-label", type === "password" ? "Show password" : "Hide password");
});


