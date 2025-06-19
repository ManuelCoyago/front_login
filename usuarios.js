function renderUsuarios(usuarios) {
  const usuariosBody = document.getElementById('usuariosBody');
  usuariosBody.innerHTML = '';
  
  usuarios.forEach(u => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role || 'user'}</td>
      <td class="actions">
        ${userRole === 'admin' ? `
          <button class="btn-edit" onclick="editarUsuario(${u.id})">Editar</button>
          <button class="btn-delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
        ` : '<span class="no-actions">-</span>'}
      </td>
    `;
    usuariosBody.appendChild(row);
  });
}

// Función para cargar usuarios desde el servidor
async function cargarUsuarios() {
  try {
    const res = await fetch('http://localhost:5003/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      const usuarios = await res.json();
      renderUsuarios(usuarios);
    }
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  }
}


// Función para editar usuario
async function editarUsuario(id) {
  try {
    const res = await fetch(`http://localhost:5003/users/${id}`, {
      headers: {'Authorization': `Bearer ${authToken}`}
    });
    if (res.ok) {
      const usuario = await res.json();
      document.getElementById('usuarioId').value = usuario.id;
      document.getElementById('usernameUsuario').value = usuario.username;
      document.getElementById('correoUsuario').value = usuario.email;
      document.getElementById('claveUsuario').value = '';
      document.getElementById('rolUsuario').value = usuario.role;
      document.getElementById('usuarioSubmitBtn').textContent = 'Actualizar Usuario';
      document.getElementById('cancelarEdicionUsuario').classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error al cargar usuario:', err);
  }
}

// Función para eliminar usuario
async function eliminarUsuario(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
  
  try {
    const res = await fetch(`http://localhost:5003/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      alert('Usuario eliminado exitosamente');
      cargarUsuarios();
    } else {
      alert('Error al eliminar usuario');
    }
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    alert('Error de red al eliminar usuario');
  }
}




// Formulario de usuarios
document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('usuarioId').value;
  const username = document.getElementById('usernameUsuario').value.trim();
  const email = document.getElementById('correoUsuario').value.trim();
  const password = document.getElementById('claveUsuario').value;
  const role = document.getElementById('rolUsuario').value;

  const usuarioData = { username, email, role };
  if (password) usuarioData.password = password;
  
  const url = id ? `http://localhost:5003/users/${id}` : 'http://localhost:5003/users';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(usuarioData)
    });
    
    if (res.ok) {
      alert(id ? '✅ Usuario actualizado' : '✅ Usuario creado');
      resetUsuarioForm();
      cargarUsuarios();
    } else {
      const error = await res.json();
      alert(error.error || '❌ Error al procesar usuario');
    }
  } catch (err) {
    alert('❌ Error de conexión');
  }
});

// Cancelar edición de usuario
document.getElementById('cancelarEdicionUsuario').addEventListener('click', resetUsuarioForm);

function resetUsuarioForm() {
  document.getElementById('usuarioForm').reset();
  document.getElementById('usuarioId').value = '';
  document.getElementById('usuarioSubmitBtn').textContent = 'Crear Usuario';
  document.getElementById('cancelarEdicionUsuario').classList.add('hidden');
}