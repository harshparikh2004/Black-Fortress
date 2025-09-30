function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

async function load(){
  const res = await fetch('/api/me/profile', { credentials: 'include' });
  if(!res.ok){ location.href = '/login.html'; return; }
  const me = await res.json();
  document.getElementById('me').innerHTML = `Welcome, <strong>${me.username}</strong> <span class="badge">${me.role}</span>`;
  document.getElementById('details').innerHTML = `
    <div class="row"><label>Username</label><div>${me.username}</div></div>
    <div class="row"><label>Email</label><div class="hint">${me.email}</div></div>
    <div class="row"><label>Account ID</label><div class="hint">${me.id}</div></div>
    <div class="row"><label>Member since</label><div>${formatDate(me.createdAt)}</div></div>
  `;
}

document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  await fetch('/api/auth/logout', { method:'POST', credentials:'include' });
  location.href = '/login.html';
});

load();
