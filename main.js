// main.js
import { authToken, userRole, showPostLogin } from './auth.js';
import { cargarUsuarios, renderUsuarios } from './usuarios.js';
import { cargarProductos, renderProductos } from './productos.js';
import { resetUI } from './auth.js';

document.addEventListener('loginSuccess', (event) => {
  const data = event.detail;

  // Mostrar sección según el rol
  if (userRole === 'admin') {
    cargarUsuarios();
    document.getElementById('usuariosPanel').classList.remove('hidden');
    document.getElementById('crudUsuarios').classList.remove('hidden');
  } else if (userRole === 'adminP') {
    cargarProductos();
    document.getElementById('productosPanel').classList.remove('hidden');
    document.getElementById('crudProductos').classList.remove('hidden');
  } else {
    if (data.products && Array.isArray(data.products)) {
      renderProductos(data.products);
      document.getElementById('productosPanel').classList.remove('hidden');
    }
  }
});



document.getElementById('logoutBtn').addEventListener('click', () => {
  resetUI();
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
});

