const API_URL = 'http://localhost:3000';

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarDashboard();
  cargarOrdenes();
  cargarClientes();
  cargarEquipos();
});

// Cambiar entre pestañas de la interfaz de forma limpia
function cambiarSeccion(seccion) {
  // Limpiar el campo de búsqueda al cambiar de vista
  const buscador = document.getElementById('inputBuscador');
  if (buscador) {
    buscador.value = '';
    if (typeof filtrarTablaEnTiempoReal === 'function') filtrarTablaEnTiempoReal();
  }

  // 1. Ocultar TODAS las secciones explícitamente
  const secciones = ['seccionDashboard', 'seccionOrdenes', 'seccionClientes', 'seccionEquipos'];
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  });

  // 2. Desactivar el estado activo de TODOS los botones del menú
  const botones = ['btnTabDashboard', 'btnTabOrdenes', 'btnTabClientes', 'btnTabEquipos'];
  botones.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  // 3. Mostrar la sección seleccionada y activar su botón correspondiente
  if (seccion === 'dashboard') {
    const sec = document.getElementById('seccionDashboard');
    const btn = document.getElementById('btnTabDashboard');
    if (sec) sec.classList.remove('d-none');
    if (btn) btn.classList.add('active');
    
    // Recargar métricas y tabla del Dashboard al volver a la vista
    cargarDashboard();

  } else if (seccion === 'ordenes') {
    const sec = document.getElementById('seccionOrdenes');
    const btn = document.getElementById('btnTabOrdenes');
    if (sec) sec.classList.remove('d-none');
    if (btn) btn.classList.add('active');

  } else if (seccion === 'clientes') {
    const sec = document.getElementById('seccionClientes');
    const btn = document.getElementById('btnTabClientes');
    if (sec) sec.classList.remove('d-none');
    if (btn) btn.classList.add('active');

  } else if (seccion === 'equipos') {
    const sec = document.getElementById('seccionEquipos');
    const btn = document.getElementById('btnTabEquipos');
    if (sec) sec.classList.remove('d-none');
    if (btn) btn.classList.add('active');
  }
}

// ==========================================
// FILTRADOR EN TIEMPO REAL
// ==========================================
function filtrarTablaEnTiempoReal() {
  const buscador = document.getElementById('inputBuscador');
  if (!buscador) return;

  const texto = buscador.value.toLowerCase().trim();

  // Buscar la tabla dentro de la sección que NO está oculta
  const secciones = ['seccionDashboard', 'seccionOrdenes', 'seccionClientes', 'seccionEquipos'];
  let tablaVisible = null;

  for (const id of secciones) {
    const sec = document.getElementById(id);
    if (sec && !sec.classList.contains('d-none')) {
      tablaVisible = sec.querySelector('table');
      break;
    }
  }

  if (!tablaVisible) return;

  const filas = tablaVisible.querySelectorAll('tbody tr');

  filas.forEach(fila => {
    const contenidoFila = fila.textContent.toLowerCase();
    if (contenidoFila.includes(texto)) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}

// ------------------- CÓDIGO DE ÓRDENES -------------------

async function cargarOrdenes() {
  try {
    const res = await fetch(`${API_URL}/ordenes`);
    const ordenes = await res.json();
    const tbody = document.getElementById('tablaOrdenes');
    tbody.innerHTML = '';

    document.getElementById('countTotalOrdenes').innerText = ordenes.length;

    ordenes.forEach(o => {
      let badgeColor = 'bg-warning text-dark';
      if (o.ESTADO === 'EN REPARACION') badgeColor = 'bg-info text-white';
      if (o.ESTADO === 'REPARADO') badgeColor = 'bg-success text-white';
      if (o.ESTADO === 'ENTREGADO') badgeColor = 'bg-secondary text-white';
      if (o.ESTADO === 'ANULADO') badgeColor = 'bg-danger text-white';

      const esAnulado = o.ESTADO === 'ANULADO';

      tbody.innerHTML += `
        <tr class="${esAnulado ? 'table-secondary text-muted' : ''}">
          <td><strong>#${o.ID}</strong></td>
          <td>${o.CLIENTE_NOMBRE}</td>
          <td>${o.EQUIPO_TIPO} - ${o.EQUIPO_MARCA}</td>
          <td>${o.FALLA_REPORTADA}</td>
          <td><span class="badge ${badgeColor}">${o.ESTADO}</span></td>
          <td>${o.COSTO_TOTAL ? '$' + o.COSTO_TOTAL.toLocaleString() : 'Pendiente'}</td>
          <td>
            ${!esAnulado ? `
              <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditar(${o.ID}, '${o.ESTADO}', '${o.DIAGNOSTICO || ''}', ${o.COSTO_TOTAL || 0})">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarOrden(${o.ID})">
                <i class="bi bi-x-circle"></i> Anular
              </button>
            ` : '<span class="text-muted small">Sin acciones</span>'}
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error al cargar órdenes:', err);
  }
}

async function eliminarOrden(id) {
  if (confirm(`¿Estás seguro de que deseas ANULAR la orden #${id}? El consecutivo se mantendrá en el historial.`)) {
    await fetch(`${API_URL}/ordenes/${id}`, { method: 'DELETE' });
    cargarOrdenes();
  }
}

// Submit Nueva Orden
document.getElementById('formNuevaOrden')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const equipo_id = document.getElementById('selectEquipo').value;
  const falla_reportada = document.getElementById('fallaReportada').value;

  await fetch(`${API_URL}/ordenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipo_id, falla_reportada })
  });

  bootstrap.Modal.getInstance(document.getElementById('modalNuevaOrden')).hide();
  document.getElementById('formNuevaOrden').reset();
  cargarOrdenes();
});

function abrirModalEditar(id, estado, diagnostico, costo) {
  document.getElementById('lblIdOrden').innerText = id;
  document.getElementById('editOrdenId').value = id;
  document.getElementById('editEstado').value = estado;
  document.getElementById('editDiagnostico').value = diagnostico;
  document.getElementById('editCosto').value = costo;
  
  new bootstrap.Modal(document.getElementById('modalEditarOrden')).show();
}

// Submit Actualizar Orden
document.getElementById('formEditarOrden')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editOrdenId').value;
  const estado = document.getElementById('editEstado').value;
  const diagnostico = document.getElementById('editDiagnostico').value;
  const costo_total = document.getElementById('editCosto').value;

  await fetch(`${API_URL}/ordenes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado, diagnostico, costo_total })
  });

  bootstrap.Modal.getInstance(document.getElementById('modalEditarOrden')).hide();
  cargarOrdenes();
});

// ------------------- CÓDIGO DE CLIENTES -------------------

async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    const clientes = await res.json();
    const tbody = document.getElementById('tablaClientes');
    tbody.innerHTML = '';

    clientes.forEach(c => {
      const id = c.ID || c[0];
      const nombre = c.NOMBRE || c[1];
      const telefono = c.TELEFONO || c[2] || 'N/A';
      const email = c.EMAIL || c[3] || 'N/A';
      const direccion = c.DIRECCION || c[4] || 'N/A';

      tbody.innerHTML += `
        <tr>
          <td><strong>#${id}</strong></td>
          <td><strong>${nombre}</strong></td>
          <td>${telefono}</td>
          <td>${email}</td>
          <td>${direccion}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditarCliente(${id}, '${nombre}', '${telefono}', '${email}', '${direccion}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente(${id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error al cargar clientes:', err);
  }
}

function abrirModalEditarCliente(id, nombre, telefono, email, direccion) {
  document.getElementById('editClienteId').value = id;
  document.getElementById('editClienteNombre').value = nombre;
  document.getElementById('editClienteTelefono').value = telefono === 'N/A' ? '' : telefono;
  document.getElementById('editClienteEmail').value = email === 'N/A' ? '' : email;
  document.getElementById('editClienteDireccion').value = direccion === 'N/A' ? '' : direccion;

  const modal = new bootstrap.Modal(document.getElementById('modalEditarCliente'));
  modal.show();
}

// Submit Editar Cliente
document.getElementById('formEditarCliente')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editClienteId').value;
  const cliente = {
    nombre: document.getElementById('editClienteNombre').value,
    telefono: document.getElementById('editClienteTelefono').value,
    email: document.getElementById('editClienteEmail').value,
    direccion: document.getElementById('editClienteDireccion').value
  };

  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente)
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('modalEditarCliente')).hide();
    cargarClientes();
  } else {
    alert('Error al actualizar el cliente');
  }
});

async function eliminarCliente(id) {
  if (confirm(`¿Estás seguro de eliminar el cliente #${id}? ¡Recuerda que se borrarán también sus equipos y órdenes asociadas!`)) {
    try {
      const res = await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cargarClientes();
        cargarEquipos();
        cargarOrdenes();
      } else {
        const errorData = await res.json();
        alert(`Error al eliminar: ${errorData.mensaje || errorData.error}`);
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
    }
  }
}

// Guardar Nuevo Cliente
document.getElementById('formNuevoCliente')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('clienteNombre').value;
  const telefono = document.getElementById('clienteTelefono').value;
  const email = document.getElementById('clienteEmail').value;
  const direccion = document.getElementById('clienteDireccion').value;

  try {
    await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, email, direccion })
    });

    bootstrap.Modal.getInstance(document.getElementById('modalNuevoCliente')).hide();
    document.getElementById('formNuevoCliente').reset();
    cargarClientes();
  } catch (err) {
    console.error('Error al crear cliente:', err);
  }
});

// ------------------- CÓDIGO DE EQUIPOS -------------------

async function cargarEquipos() {
  try {
    const res = await fetch(`${API_URL}/equipos`);
    const equipos = await res.json();
    const tbody = document.getElementById('tablaEquipos');
    tbody.innerHTML = '';

    equipos.forEach(eq => {
      const id = eq.ID || eq[0];
      const clienteId = eq.CLIENTE_ID || eq[1];
      const clienteNombre = eq.CLIENTE_NOMBRE || eq[2];
      const tipo = eq.TIPO || eq[3];
      const marca = eq.MARCA || eq[4];
      const modelo = eq.MODELO || eq[5] || 'N/A';
      const serie = eq.NUMERO_SERIE || eq[6] || 'N/A';

      tbody.innerHTML += `
        <tr>
          <td><strong>#${id}</strong></td>
          <td>${clienteNombre}</td>
          <td><span class="badge badge-tipo">${tipo}</span></td>
          <td><strong>${marca}</strong> ${modelo !== 'N/A' ? modelo : ''}</td>
          <td><code>${serie}</code></td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditarEquipo(${id}, ${clienteId}, '${tipo}', '${marca}', '${modelo}', '${serie}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="eliminarEquipo(${id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error al cargar equipos:', err);
  }
}

async function abrirModalEditarEquipo(id, clienteIdActual, tipo, marca, modelo, serie) {
  document.getElementById('editEquipoId').value = id;
  document.getElementById('editEquipoTipo').value = tipo;
  document.getElementById('editEquipoMarca').value = marca;
  document.getElementById('editEquipoModelo').value = modelo === 'N/A' ? '' : modelo;
  document.getElementById('editEquipoNumeroSerie').value = serie === 'N/A' ? '' : serie;

  const res = await fetch(`${API_URL}/clientes`);
  const clientes = await res.json();
  const select = document.getElementById('editEquipoClienteId');
  select.innerHTML = '';

  clientes.forEach(c => {
    const cId = c.ID || c[0];
    const cNombre = c.NOMBRE || c[1];
    const selected = cId === clienteIdActual ? 'selected' : '';
    select.innerHTML += `<option value="${cId}" ${selected}>${cNombre}</option>`;
  });

  const modal = new bootstrap.Modal(document.getElementById('modalEditarEquipo'));
  modal.show();
}

// Submit Editar Equipo
document.getElementById('formEditarEquipo')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editEquipoId').value;
  const equipo = {
    cliente_id: parseInt(document.getElementById('editEquipoClienteId').value),
    tipo: document.getElementById('editEquipoTipo').value,
    marca: document.getElementById('editEquipoMarca').value,
    modelo: document.getElementById('editEquipoModelo').value,
    numero_serie: document.getElementById('editEquipoNumeroSerie').value
  };

  const res = await fetch(`${API_URL}/equipos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipo)
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById('modalEditarEquipo')).hide();
    cargarEquipos();
  } else {
    alert('Error al actualizar el equipo');
  }
});

async function eliminarEquipo(id) {
  if (confirm(`¿Eliminar equipo #${id}? Se eliminarán también las órdenes de servicio asociadas.`)) {
    await fetch(`${API_URL}/equipos/${id}`, { method: 'DELETE' });
    cargarEquipos();
    cargarOrdenes();
  }
}

async function cargarClientesEnSelect() {
  const res = await fetch(`${API_URL}/clientes`);
  const clientes = await res.json();
  const select = document.getElementById('selectClienteEquipo');
  if (!select) return;
  select.innerHTML = '';
  clientes.forEach(c => {
    const id = c.ID || c[0];
    const nombre = c.NOMBRE || c[1];
    select.innerHTML += `<option value="${id}">${nombre}</option>`;
  });
}

async function cargarEquiposEnSelect() {
  const res = await fetch(`${API_URL}/equipos`);
  const equipos = await res.json();
  const select = document.getElementById('selectEquipo');
  if (!select) return;
  select.innerHTML = '';
  equipos.forEach(eq => {
    const id = eq.ID || eq[0];
    const tipo = eq.TIPO || eq[3];
    const marca = eq.MARCA || eq[4];
    const clienteNombre = eq.CLIENTE_NOMBRE || eq[2];
    select.innerHTML += `<option value="${id}">${tipo} ${marca} (${clienteNombre})</option>`;
  });
}

// Submit Nuevo Equipo
document.getElementById('formNuevoEquipo')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cliente_id = document.getElementById('selectClienteEquipo').value;
  const tipo = document.getElementById('equipoTipo').value;
  const marca = document.getElementById('equipoMarca').value;
  const modelo = document.getElementById('equipoModelo').value;
  const numero_serie = document.getElementById('equipoSerie').value;

  await fetch(`${API_URL}/equipos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente_id, tipo, marca, modelo, numero_serie })
  });

  bootstrap.Modal.getInstance(document.getElementById('modalNuevoEquipo')).hide();
  document.getElementById('formNuevoEquipo').reset();
  cargarEquipos();
});

// ------------------- LÓGICA DE CAMBIO DE TEMA -------------------

document.addEventListener('DOMContentLoaded', () => {
  aplicarTemaGuardado();
});

function alternarTema() {
  const temaActual = document.documentElement.getAttribute('data-bs-theme') || 'dark';
  const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-bs-theme', nuevoTema);
  localStorage.setItem('theme', nuevoTema);
  actualizarBotonTema(nuevoTema);
}

function aplicarTemaGuardado() {
  const temaGuardado = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-bs-theme', temaGuardado);
  actualizarBotonTema(temaGuardado);
}

function actualizarBotonTema(tema) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;

  if (tema === 'dark') {
    icon.className = 'bi bi-sun-fill text-warning fs-5';
  } else {
    icon.className = 'bi bi-moon-stars-fill text-white-50 fs-5';
  }
}

// ==========================================
// FILTRADOR EN TIEMPO REAL
// ==========================================
function filtrarTablaEnTiempoReal() {
  const buscador = document.getElementById('inputBuscador');
  if (!buscador) return;

  const texto = buscador.value.toLowerCase().trim();

  // Seleccionar todas las tablas de la página
  const tablas = document.querySelectorAll('main table');

  tablas.forEach(tabla => {
    // Si la tabla o su contenedor padre no están ocultos
    const contenedor = tabla.closest('.d-none');
    if (!contenedor) {
      const filas = tabla.querySelectorAll('tbody tr');
      filas.forEach(fila => {
        const contenidoFila = fila.textContent.toLowerCase();
        if (contenidoFila.includes(texto)) {
          fila.style.display = '';
        } else {
          fila.style.display = 'none';
        }
      });
    }
  });
}

// ==========================================
// LÓGICA DEL DASHBOARD (PROPIEDADES EXACTAS)
// ==========================================
async function cargarDashboard() {
  try {
    const [resOrdenes, resClientes] = await Promise.all([
      fetch(`${API_URL}/ordenes`),
      fetch(`${API_URL}/clientes`)
    ]);

    const ordenes = await resOrdenes.json();
    const clientes = await resClientes.json();

    if (!Array.isArray(ordenes)) return;

    // 1. Métricas de las Tarjetas
    const activas = ordenes.filter(o => 
      ['EN REVISION', 'EN REPARACION', 'RECIBIDO', 'PENDIENTE'].includes((o.ESTADO || '').toUpperCase())
    ).length;

    const listas = ordenes.filter(o => 
      (o.ESTADO || '').toUpperCase() === 'REPARADO'
    ).length;

    const totalClientes = Array.isArray(clientes) ? clientes.length : 0;

    const recaudo = ordenes
      .filter(o => (o.ESTADO || '').toUpperCase() === 'ENTREGADO')
      .reduce((acc, o) => acc + (Number(o.COSTO_TOTAL) || 0), 0);

    // Actualizar Tarjetas
    const elActivas = document.getElementById('dashOrdenesActivas');
    const elListas = document.getElementById('dashOrdenesListas');
    const elClientes = document.getElementById('dashTotalClientes');
    const elRecaudo = document.getElementById('dashRecaudoTotal');

    if (elActivas) elActivas.textContent = activas;
    if (elListas) elListas.textContent = listas;
    if (elClientes) elClientes.textContent = totalClientes;
    if (elRecaudo) elRecaudo.textContent = `$${recaudo.toLocaleString('es-CO')}`;

    // 2. Renderizar Tabla Recientes (#tablaDashboardRecientes)
    const tbody = document.getElementById('tablaDashboardRecientes');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Tomar las últimas 5 órdenes (ordenadas por ID descendente)
    const ultimas = [...ordenes].sort((a, b) => (Number(b.ID) || 0) - (Number(a.ID) || 0)).slice(0, 5);

    if (ultimas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No hay órdenes registradas.</td></tr>`;
      return;
    }

    ultimas.forEach(o => {
      const id = o.ID || 'S/I';
      const cliente = o.CLIENTE_NOMBRE || 'Cliente General';
      
      // Armar la descripción del equipo exactamente como en la pestaña de órdenes
      const tipo = o.EQUIPO_TIPO || '';
      const marca = o.EQUIPO_MARCA || '';
      const equipoTexto = (tipo || marca) ? `${tipo} - ${marca}`.trim() : 'Sin Especificar';

      const estado = o.ESTADO || 'PENDIENTE';
      const costo = Number(o.COSTO_TOTAL) || 0;

      // Colores de las insignias (badges)
      let badgeColor = 'bg-warning text-dark';
      if (estado === 'EN REPARACION') badgeColor = 'bg-info text-white';
      if (estado === 'REPARADO') badgeColor = 'bg-success text-white';
      if (estado === 'ENTREGADO') badgeColor = 'bg-secondary text-white';
      if (estado === 'ANULADO') badgeColor = 'bg-danger text-white';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold">#${id}</td>
        <td>${cliente}</td>
        <td>${equipoTexto}</td>
        <td><span class="badge ${badgeColor}">${estado}</span></td>
        <td class="fw-bold">${costo > 0 ? '$' + costo.toLocaleString('es-CO') : 'Pendiente'}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error al cargar datos del Dashboard:', err);
  }
}