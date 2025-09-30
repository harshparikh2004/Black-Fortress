async function ensureAdmin(){
  const res = await fetch('/api/me/profile', { credentials: 'include' });
  if(!res.ok){ location.href = '/login.html'; return; }
  const me = await res.json();
  if(me.role !== 'admin'){ location.href = '/user.html'; }
}

async function load(){
  await ensureAdmin();
  const loading = document.getElementById('usersLoading');
  const table = document.getElementById('usersTable');
  const tbody = document.getElementById('usersBody');
  const err = document.getElementById('usersErr');
  loading.style.display = 'block';
  err.style.display = 'none';
  table.style.display = 'none';

  try{
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    const data = await res.json();
    if(!res.ok){ throw new Error(data.error || 'Failed to load users'); }
    tbody.innerHTML = '';
    data.users.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.username}</td>
        <td class="hint">${u.email}</td>
        <td>
          <select data-id="${u._id}">
            <option ${u.role==='user'?'selected':''}>user</option>
            <option ${u.role==='admin'?'selected':''}>admin</option>
          </select>
        </td>`;
      tr.querySelector('select').addEventListener('change', async (e)=>{
        await fetch(`/api/admin/users/${u._id}/role`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({role:e.target.value})});
      });
      tbody.appendChild(tr);
    });
    table.style.display = 'table';
  }catch(e){
    err.textContent = e.message;
    err.style.display = 'block';
  }finally{
    loading.style.display = 'none';
  }
}

document.getElementById('logoutBtn').addEventListener('click', async ()=>{
  await fetch('/api/auth/logout', { method:'POST', credentials:'include' });
  location.href = '/login.html';
});

load();
