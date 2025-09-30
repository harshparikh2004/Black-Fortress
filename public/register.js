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

function isValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isStrongPassword(v){
  return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/.test(v);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  usernameErr.textContent = emailErr.textContent = passwordErr.textContent = roleErr.textContent = formErr.textContent = "";

  const username = usernameEl.value.trim();
  const email = emailEl.value.trim();
  const password = passwordEl.value;
  const role = roleEl.value;

  let ok = true;
  if(username.length < 3) { usernameErr.textContent = "Min 3 characters"; ok = false; }
  if(!isValidEmail(email)) { emailErr.textContent = "Enter a valid email"; ok = false; }
  if(!isStrongPassword(password)) { passwordErr.textContent = "Use 8+ chars, number, symbol"; ok = false; }
  if(!role) { roleErr.textContent = "Select a role"; ok = false; }
  if(!ok) return;

  try{
    const res = await fetch("/api/auth/register",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ username, email, password, role })
    });
    const data = await res.json();
    if(!res.ok){ throw new Error(data.error||"Registration failed"); }
    window.location.href = "/login.html";
  }catch(err){
    formErr.textContent = err.message;
  }
});


