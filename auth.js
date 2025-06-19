// auth.js

export let authToken = '';
export let userRole = '';
export let tempLoginData = null;

const loginForm = document.getElementById('loginForm');
const messageEl = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  resetUI();

  messageEl.innerHTML = '<div class="loader"></div>';

  try {
    const res = await fetch('http://localhost:5002/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });

    const data = await res.json();

    if (res.ok) {
      authToken = data.token || '';
      userRole = data.role || '';

      if (data.requires_2fa) {
        tempLoginData = data;
        loginForm.classList.add('hidden');
        await setup2FA(data.email);
        return;
      }

      showPostLogin(data);
    } else {
      messageEl.textContent = data.message || 'Credenciales incorrectas';
      messageEl.className = 'message error';
      document.getElementById('password').value = '';
      document.getElementById('email').focus();
    }

  } catch (err) {
    console.error(err);
    messageEl.textContent = 'Error de conexión';
    messageEl.className = 'message error';
  }
});

async function setup2FA(email) {
  const yaConfigurado = localStorage.getItem(`2fa_configurado_${email}`);

  if (!yaConfigurado) {
    const res = await fetch('http://localhost:5004/generate-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const { secret, qr_code } = await res.json();
    localStorage.setItem('temp_2fa_secret', secret);

    document.getElementById('qr-container').innerHTML = `
      <p>Escanee con Google Authenticator:</p>
      <img src="${qr_code}" style="width:200px;height:200px;">
      <p><strong>${secret}</strong></p>
    `;
  } else {
    document.getElementById('qr-container').innerHTML = '';
    localStorage.removeItem('temp_2fa_secret');
  }

  document.getElementById('2fa-section').classList.remove('hidden');
  document.getElementById('totp-code').value = '';
}

document.getElementById('verify-2fa-btn').addEventListener('click', async () => {
  const code = document.getElementById('totp-code').value;
  const email = tempLoginData.email;
  const secret = localStorage.getItem('temp_2fa_secret') || localStorage.getItem(`2fa_secret_${email}`);

  if (!secret) {
    alert('Falta secreto 2FA. Vuelva a escanear el QR.');
    return;
  }

  const response = await fetch('http://localhost:5004/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, token: code })
  });

  const { valid } = await response.json();

  if (valid) {
    if (localStorage.getItem('temp_2fa_secret')) {
      localStorage.setItem(`2fa_secret_${email}`, secret);
    }

    localStorage.setItem(`2fa_configurado_${email}`, 'true');
    localStorage.removeItem('temp_2fa_secret');
    await save2FASecret(secret);
    showPostLogin(tempLoginData);
  } else {
    alert('Código inválido');
    document.getElementById('totp-code').value = '';
  }
});

async function save2FASecret(secret) {
  // Placeholder. No persistente en backend aún.
  return true;
}

// Función auxiliar para limpiar la UI antes del login
function resetUI() {
  messageEl.textContent = '';
  messageEl.className = 'message';
  document.getElementById('productosPanel').classList.add('hidden');
  document.getElementById('crudProductos').classList.add('hidden');
  document.getElementById('usuariosPanel').classList.add('hidden');
  document.getElementById('crudUsuarios').classList.add('hidden');
}

// Exporta para que `main.js` pueda acceder
export function showPostLogin(data) {
  tempLoginData = null;
  document.getElementById('2fa-section').classList.add('hidden');
  messageEl.textContent = 'Acceso concedido';
  messageEl.className = 'message success';
  document.dispatchEvent(new CustomEvent('loginSuccess', { detail: data }));
}
