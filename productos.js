// Funciones relacionadas con productos
function renderProductos(productos) {
  const productosBody = document.getElementById('productosBody');
  productosBody.innerHTML = '';
  productos.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.description || '-'}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td class="actions">
        ${userRole === 'adminP' ? `
          <button class="btn-edit" onclick="editarProducto(${p.id})">Editar</button>
          <button class="btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
        ` : ''}
      </td>
    `;
    productosBody.appendChild(row);
  });
}

// Función para cargar productos desde el servidor
async function cargarProductos() {
  try {
    const res = await fetch('http://localhost:5001/products', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      const productos = await res.json();
      renderProductos(productos);
    }
  } catch (err) {
    console.error('Error al cargar productos:', err);
  }
}

// Función para editar producto
async function editarProducto(id) {
  try {
    const res = await fetch(`http://localhost:5001/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      const producto = await res.json();
      document.getElementById('productoId').value = producto.id;
      document.getElementById('nombreProducto').value = producto.name;
      document.getElementById('descripcionProducto').value = producto.description || '';
      document.getElementById('precioProducto').value = producto.price;
      document.getElementById('productoSubmitBtn').textContent = 'Actualizar Producto';
      document.getElementById('cancelarEdicionProducto').classList.remove('hidden');
    }
  } catch (err) {
    console.error('Error al cargar producto para editar:', err);
  }
}

// Función para eliminar producto
async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
  
  try {
    const res = await fetch(`http://localhost:5001/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.ok) {
      alert('Producto eliminado exitosamente');
      cargarProductos();
    } else {
      alert('Error al eliminar producto');
    }
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    alert('Error de red al eliminar producto');
  }
}

// Formulario de productos
document.getElementById('productoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productoId').value;
  const nombre = document.getElementById('nombreProducto').value.trim();
  const descripcion = document.getElementById('descripcionProducto').value.trim();
  const precio = parseFloat(document.getElementById('precioProducto').value);

  const productoData = { name: nombre, description: descripcion, price: precio };
  const url = id ? `http://localhost:5001/products/${id}` : 'http://localhost:5001/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(productoData)
    });
    
    if (res.ok) {
      alert(id ? '✅ Producto actualizado exitosamente.' : '✅ Producto creado exitosamente.');
      resetProductoForm();
      cargarProductos();
    } else {
      alert('❌ Error al procesar producto.');
    }
  } catch (err) {
    alert('❌ Error de red al procesar producto.');
  }
});

// Cancelar edición de producto
document.getElementById('cancelarEdicionProducto').addEventListener('click', resetProductoForm);

function resetProductoForm() {
  document.getElementById('productoForm').reset();
  document.getElementById('productoId').value = '';
  document.getElementById('productoSubmitBtn').textContent = 'Crear Producto';
  document.getElementById('cancelarEdicionProducto').classList.add('hidden');
}