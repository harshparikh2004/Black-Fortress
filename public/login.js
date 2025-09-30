const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const emailErr = document.getElementById("emailErr");
const passwordErr = document.getElementById("passwordErr");
const formErr = document.getElementById("formErr");

function isValidEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailErr.textContent = "";
  passwordErr.textContent = "";
  formErr.textContent = "";

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  let ok = true;
  if(!isValidEmail(email)) { emailErr.textContent = "Enter a valid email"; ok = false; }
  if((password||"").length < 8) { passwordErr.textContent = "Minimum 8 characters"; ok = false; }
  if(!ok) return;

  try{
    const res = await fetch("/api/auth/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials:"include",
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok){ throw new Error(data.error||"Login failed"); }
    window.location.href = data.role === "admin" ? "/admin.html" : "/user.html";
  }catch(err){
    formErr.textContent = err.message;
  }
});


