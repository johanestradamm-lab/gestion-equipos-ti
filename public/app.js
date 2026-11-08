// --- VARIABLES GLOBALES DE ESTADO PARA MODAL UNIFICADO ---
let ordenIdAAnular = null;
let clienteIdAEliminar = null;
let equipoIdAEliminar = null;
const API_URL = window.location.origin;

// Helper global para extraer costo independientemente del nombre de la propiedad en el backend
const obtenerCosto = (o) => Number(o?.COSTO_TOTAL ?? o?.costo_total ?? o?.costo ?? o?.COSTO) || 0;

// Cargar datos e inicializar escuchas al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  cargarDashboard();
  cargarOrdenes();
  cargarClientes();
  cargarEquipos();
  aplicarTemaGuardado();
  inicializarEventos();
});

// ==========================================
// INICIALIZACIÓN DE EVENTOS DE FORMULARIOS Y BOTONES
// ==========================================
function inicializarEventos() {
  // 1. Confirmación de Eliminación / Anulación Unificada
  document.getElementById('btnConfirmarAnular')?.addEventListener('click', async () => {
    const modalElement = document.getElementById('modalConfirmarAnular');
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (ordenIdAAnular) {
      try {
        const res = await fetch(`${API_URL}/ordenes/${ordenIdAAnular}`, { method: 'DELETE' });
        if (modal) modal.hide();
        if (res.ok) {
          mostrarNotificacion(`La orden #${ordenIdAAnular} ha sido anulada`, 'danger');
          cargarOrdenes();
          cargarDashboard();
        } else {
          mostrarNotificacion('No se pudo anular la orden', 'warning');
        }
      } catch (err) {
        mostrarNotificacion('Error de conexión al anular orden', 'danger');
      } finally {
        ordenIdAAnular = null;
      }
    } 
    else if (clienteIdAEliminar) {
      try {
        const res = await fetch(`${API_URL}/clientes/${clienteIdAEliminar}`, { method: 'DELETE' });
        if (modal) modal.hide();
        if (res.ok) {
          mostrarNotificacion(`Cliente #${clienteIdAEliminar} eliminado correctamente`, 'danger');
          cargarClientes();
          cargarEquipos();
          cargarOrdenes();
          cargarDashboard();
        } else {
          const errorData = await res.json();
          mostrarNotificacion(`Error: ${errorData.mensaje || errorData.error}`, 'warning');
        }
      } catch (err) {
        mostrarNotificacion('Error de conexión al eliminar cliente', 'danger');
      } finally {
        clienteIdAEliminar = null;
      }
    } 
    else if (equipoIdAEliminar) {
      try {
        const res = await fetch(`${API_URL}/equipos/${equipoIdAEliminar}`, { method: 'DELETE' });
        if (modal) modal.hide();
        if (res.ok) {
          mostrarNotificacion(`Equipo #${equipoIdAEliminar} eliminado correctamente`, 'danger');
          cargarEquipos();
          cargarOrdenes();
          cargarDashboard();
        } else {
          mostrarNotificacion('Error al eliminar el equipo', 'warning');
        }
      } catch (err) {
        mostrarNotificacion('Error de conexión al eliminar equipo', 'danger');
      } finally {
        equipoIdAEliminar = null;
      }
    }
  });

  // 2. Submit Nueva Orden
  document.getElementById('formNuevaOrden')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const equipo_id = document.getElementById('selectEquipo').value;
    const falla_reportada = document.getElementById('fallaReportada').value;
    const costo = parseFloat(document.getElementById('nuevaOrdenCosto')?.value) || 0;

    try {
      const res = await fetch(`${API_URL}/ordenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          equipo_id, 
          falla_reportada, 
          costo: costo,
          costo_total: costo 
        })
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalNuevaOrden')).hide();
        document.getElementById('formNuevaOrden').reset();
        cargarOrdenes();
        cargarDashboard();
        mostrarNotificacion('Orden creada correctamente', 'success');
      } else {
        mostrarNotificacion('Error al crear la orden', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al crear la orden', 'danger');
    }
  });


// 3. Submit Editar Orden
  document.getElementById('formEditarOrden')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrdenId').value;
    const estado = document.getElementById('editEstado').value;
    const falla_reportada = document.getElementById('editFallaReportada').value;
    const diagnostico = document.getElementById('editDiagnostico').value;
    const costoValor = parseFloat(document.getElementById('editCosto').value) || 0;
    const historial = document.getElementById('editHistorial').value;

    try {
      const res = await fetch(`${API_URL}/ordenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado,
          ESTADO: estado,
          falla_reportada,
          FALLA_REPORTADA: falla_reportada,
          falla: falla_reportada,
          diagnostico,
          DIAGNOSTICO: diagnostico,
          historial,
          HISTORIAL: historial,
          costo: costoValor,
          costo_total: costoValor,
          COSTO_TOTAL: costoValor
        })
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarOrden')).hide();
        document.getElementById('formEditarOrden').reset();
        cargarOrdenes();
        cargarDashboard();
        mostrarNotificacion(`Orden #${id} actualizada correctamente`, 'success');
      } else {
        mostrarNotificacion('Error al actualizar la orden', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al actualizar la orden', 'danger');
    }
  });

  // 4. Submit Nuevo Cliente
  document.getElementById('formNuevoCliente')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('clienteNombre').value;
    const telefono = document.getElementById('clienteTelefono').value;
    const email = document.getElementById('clienteEmail').value;
    const direccion = document.getElementById('clienteDireccion').value;

    try {
      const res = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, email, direccion })
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalNuevoCliente')).hide();
        document.getElementById('formNuevoCliente').reset();
        cargarClientes();
        cargarDashboard();
        mostrarNotificacion('Cliente guardado correctamente', 'success');
      } else {
        mostrarNotificacion('Error al guardar el cliente', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al guardar cliente', 'danger');
    }
  });

  // 5. Submit Editar Cliente
  document.getElementById('formEditarCliente')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editClienteId').value;
    const cliente = {
      nombre: document.getElementById('editClienteNombre').value,
      telefono: document.getElementById('editClienteTelefono').value,
      email: document.getElementById('editClienteEmail').value,
      direccion: document.getElementById('editClienteDireccion').value
    };

    try {
      const res = await fetch(`${API_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarCliente')).hide();
        cargarClientes();
        mostrarNotificacion(`Cliente #${id} actualizado correctamente`, 'success');
      } else {
        mostrarNotificacion('Error al actualizar el cliente', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al actualizar cliente', 'danger');
    }
  });

  // 6. Submit Nuevo Equipo
  document.getElementById('formNuevoEquipo')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cliente_id = document.getElementById('selectClienteEquipo').value;
    const tipo = document.getElementById('equipoTipo').value;
    const marca = document.getElementById('equipoMarca').value;
    const modelo = document.getElementById('equipoModelo').value;
    const numero_serie = document.getElementById('equipoSerie').value;

    try {
      const res = await fetch(`${API_URL}/equipos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id, tipo, marca, modelo, numero_serie })
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalNuevoEquipo')).hide();
        document.getElementById('formNuevoEquipo').reset();
        cargarEquipos();
        mostrarNotificacion('Equipo guardado correctamente', 'success');
      } else {
        mostrarNotificacion('Error al guardar el equipo', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al guardar equipo', 'danger');
    }
  });

  // 7. Submit Editar Equipo
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

    try {
      const res = await fetch(`${API_URL}/equipos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipo)
      });

      if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('modalEditarEquipo')).hide();
        cargarEquipos();
        mostrarNotificacion('Equipo actualizado correctamente', 'success');
      } else {
        mostrarNotificacion('Error al actualizar el equipo', 'warning');
      }
    } catch (err) {
      mostrarNotificacion('Error de conexión al actualizar equipo', 'danger');
    }
  });

  // --- CARGA DINÁMICA Y RESET AL ABRIR MODALES ---
  document.getElementById('modalNuevaOrden')?.addEventListener('show.bs.modal', async () => {
    document.getElementById('formNuevaOrden')?.reset();
    await cargarEquiposEnSelect();
  });

  document.getElementById('modalNuevoEquipo')?.addEventListener('show.bs.modal', async () => {
    document.getElementById('formNuevoEquipo')?.reset();
    await cargarClientesEnSelect();
  });

  document.getElementById('modalNuevoCliente')?.addEventListener('show.bs.modal', () => {
    document.getElementById('formNuevoCliente')?.reset();
  });

  // Listener para cambio en el filtro de tiempo del Dashboard
  document.getElementById('filtroTiempo')?.addEventListener('change', () => {
    cargarDashboard();
  });
}

// ==========================================
// NAVEGACIÓN Y VISTAS
// ==========================================
function cambiarSeccion(seccion) {
  const buscador = document.getElementById('inputBuscador');
  if (buscador) {
    buscador.value = '';
    filtrarTablaEnTiempoReal();
  }

  const secciones = ['seccionDashboard', 'seccionOrdenes', 'seccionClientes', 'seccionEquipos'];
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('d-none');
  });

  const botones = ['btnTabDashboard', 'btnTabOrdenes', 'btnTabClientes', 'btnTabEquipos'];
  botones.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  if (seccion === 'dashboard') {
    document.getElementById('seccionDashboard')?.classList.remove('d-none');
    document.getElementById('btnTabDashboard')?.classList.add('active');
    cargarDashboard();
  } else if (seccion === 'ordenes') {
    document.getElementById('seccionOrdenes')?.classList.remove('d-none');
    document.getElementById('btnTabOrdenes')?.classList.add('active');
  } else if (seccion === 'clientes') {
    document.getElementById('seccionClientes')?.classList.remove('d-none');
    document.getElementById('btnTabClientes')?.classList.add('active');
  } else if (seccion === 'equipos') {
    document.getElementById('seccionEquipos')?.classList.remove('d-none');
    document.getElementById('btnTabEquipos')?.classList.add('active');
  }
}

function filtrarTablaEnTiempoReal() {
  const buscador = document.getElementById('inputBuscador');
  if (!buscador) return;

  const texto = buscador.value.toLowerCase().trim();
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
    fila.style.display = contenidoFila.includes(texto) ? '' : 'none';
  });
}

// ==========================================
// ÓRDENES
// ==========================================
async function cargarOrdenes() {
  try {
    const res = await fetch(`${API_URL}/ordenes`);
    const ordenes = await res.json();
    const tbody = document.getElementById('tablaOrdenes');
    if (!tbody) return;
    tbody.innerHTML = '';

    const countElem = document.getElementById('countTotalOrdenes');
    if (countElem) countElem.innerText = ordenes.length;

    ordenes.forEach(o => {  
      let badgeColor = 'bg-warning text-dark';
      if (o.ESTADO === 'EN REPARACION') badgeColor = 'bg-info text-white';
      if (o.ESTADO === 'REPARADO') badgeColor = 'bg-success text-white';
      if (o.ESTADO === 'ENTREGADO') badgeColor = 'bg-secondary text-white';
      if (o.ESTADO === 'ANULADO') badgeColor = 'bg-danger text-white';

      const esAnulado = o.ESTADO === 'ANULADO';
      const tipo = o.EQUIPO_TIPO || o.equipo_tipo || '';
      const marca = o.EQUIPO_MARCA || o.equipo_marca || '';
      const equipoTexto = (tipo || marca) ? `${tipo} ${marca}`.trim() : 'Sin Especificar';
      const costo = obtenerCosto(o);

      tbody.innerHTML += `
        <tr class="${esAnulado ? 'orden-anulada' : ''}">
          <td onclick="verDetalleOrden(${o.ID || o[0]})"><strong>#${o.ID || o[0]}</strong></td>
          <td onclick="verDetalleOrden(${o.ID || o[0]})">${o.CLIENTE_NOMBRE || o.cliente_nombre || 'Cliente General'}</td>
          <td onclick="verDetalleOrden(${o.ID || o[0]})">${equipoTexto}</td>
          <td onclick="verDetalleOrden(${o.ID || o[0]})">${o.FALLA_REPORTADA || o.falla_reportada || 'Sin informe'}</td>
          <td onclick="verDetalleOrden(${o.ID || o[0]})"><span class="badge ${badgeColor}">${o.ESTADO || o.estado}</span></td>
          <td onclick="verDetalleOrden(${o.ID || o[0]})" class="fw-bold">${costo > 0 ? '$' + costo.toLocaleString('es-CO') : 'Pendiente'}</td>
          <td>
            ${!esAnulado ? `
              <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEditar(${o.ID || o[0]}); event.stopPropagation();">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarOrden(${o.ID || o[0]}); event.stopPropagation();">
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

function eliminarOrden(id) {
  ordenIdAAnular = id;
  clienteIdAEliminar = null;
  equipoIdAEliminar = null;
  
  const mensaje = document.getElementById('mensajeConfirmarAnular');
  if (mensaje) mensaje.innerText = `¿Estás seguro de que deseas anular la orden #${id}? Esta acción no se puede deshacer.`;
  
  const btnConfirmar = document.getElementById('btnConfirmarAnular');
  if (btnConfirmar) btnConfirmar.innerText = 'Sí, Anular Orden';

  const modalElement = document.getElementById('modalConfirmarAnular');
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
}

// Abrir modal de edición consultando los datos limpios de la orden
async function abrirModalEditar(id) {
  try {
    const res = await fetch(`${API_URL}/ordenes`);
    const ordenes = await res.json();
    const orden = ordenes.find(o => (o.ID || o.id || o[0]) == id);

    if (!orden) {
      mostrarNotificacion('No se encontró la información de la orden', 'warning');
      return;
    }

    const costo = obtenerCosto(orden);

    document.getElementById('lblIdOrden').innerText = orden.ID || orden.id || orden[0];
    document.getElementById('editOrdenId').value = orden.ID || orden.id || orden[0];
    document.getElementById('editEstado').value = orden.ESTADO || orden.estado || 'PENDIENTE';
    document.getElementById('editFallaReportada').value = orden.FALLA_REPORTADA || orden.falla_reportada || '';
    document.getElementById('editDiagnostico').value = orden.DIAGNOSTICO || orden.diagnostico || '';
    document.getElementById('editCosto').value = costo > 0 ? costo : '';
    document.getElementById('editHistorial').value = orden.HISTORIAL || orden.historial || orden[9] || '';

    const modalElement = document.getElementById('modalEditarOrden');
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show();
  } catch (err) {
    console.error('Error al abrir modal de edición:', err);
    mostrarNotificacion('Error al obtener datos para edición', 'danger');
  }
}

// Abrir vista detallada de la Orden cruzando Clientes y Equipos
async function verDetalleOrden(id) {
  try {
    const [resOrdenes, resClientes, resEquipos] = await Promise.all([
      fetch(`${API_URL}/ordenes`),
      fetch(`${API_URL}/clientes`),
      fetch(`${API_URL}/equipos`)
    ]);

    const ordenes = await resOrdenes.json();
    const clientes = await resClientes.json();
    const equipos = await resEquipos.json();

    const orden = ordenes.find(o => (o.ID || o.id || o[0]) == id);
    if (!orden) {
      mostrarNotificacion('No se encontró la información de la orden', 'warning');
      return;
    }

    const equipoIdOrden = orden.EQUIPO_ID || orden.equipo_id || orden[1];
    const equipo = equipos.find(eq => (eq.ID || eq.id || eq[0]) == equipoIdOrden) || {};
    
    const clienteIdBusqueda = equipo.CLIENTE_ID || equipo.cliente_id || equipo[1] || orden.CLIENTE_ID || orden.cliente_id;
    const cliente = clientes.find(c => (c.ID || c.id || c[0]) == clienteIdBusqueda) || {};

    const clienteNombre = cliente.NOMBRE || cliente.nombre || cliente[1] || orden.CLIENTE_NOMBRE || orden.cliente_nombre || 'Cliente General';
    const clienteTelefono = cliente.TELEFONO || cliente.telefono || cliente[2] || 'N/A';
    const clienteEmail = cliente.EMAIL || cliente.email || cliente[3] || 'N/A';

    const tipo = equipo.TIPO || equipo.tipo || equipo[3] || orden.EQUIPO_TIPO || orden.equipo_tipo || '';
    const marca = equipo.MARCA || equipo.marca || equipo[4] || orden.EQUIPO_MARCA || orden.equipo_marca || '';
    const modelo = equipo.MODELO || equipo.modelo || equipo[5] || orden.EQUIPO_MODELO || orden.equipo_modelo || '';
    const serie = equipo.NUMERO_SERIE || equipo.numero_serie || equipo.SERIE || equipo.serie || equipo[6] || 'N/A';

    document.getElementById('detOrdenId').innerText = orden.ID || orden.id || orden[0];
    document.getElementById('detClienteNombre').innerText = clienteNombre;
    document.getElementById('detClienteTelefono').innerText = clienteTelefono;
    document.getElementById('detClienteEmail').innerText = clienteEmail;

    const equipoTexto = `${tipo} ${marca} ${modelo}`.trim() || 'No especificado';
    document.getElementById('detEquipoInfo').innerText = equipoTexto;
    document.getElementById('detEquipoSerie').innerText = serie;
    document.getElementById('detEquipoId').innerText = equipoIdOrden || 'N/A';

    document.getElementById('detFallaReportada').innerText = orden.FALLA_REPORTADA || orden.falla_reportada || 'Sin información registrada';
    document.getElementById('detDiagnostico').innerText = orden.DIAGNOSTICO || orden.diagnostico || 'En proceso de evaluación técnica';
    document.getElementById('detHistorial').innerText = orden.HISTORIAL || orden.historial || orden[9] || 'Sin historial de novedades registrado';

    const estado = orden.ESTADO || orden.estado || 'PENDIENTE';
    const badge = document.getElementById('detEstadoBadge');
    badge.innerText = estado;
    badge.className = `badge fs-6 ${
      estado === 'REPARADO' ? 'bg-success' :
      estado === 'EN REPARACION' ? 'bg-info text-white' :
      estado === 'ENTREGADO' ? 'bg-secondary' :
      estado === 'ANULADO' ? 'bg-danger' : 'bg-warning text-dark'
    }`;

    const costo = obtenerCosto(orden);
    document.getElementById('detCostoTotal').innerText = costo > 0 ? `$${costo.toLocaleString('es-CO')}` : 'Pendiente por cotizar';

    const modalElement = document.getElementById('modalDetalleOrden');
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.show();
  } catch (err) {
    console.error('Error al obtener detalle:', err);
    mostrarNotificacion('Error al cargar detalle de la orden', 'danger');
  }
}

// Función para imprimir la Ficha Técnica / Recibo
function imprimirOrden() {
  window.print();
}

// ==========================================
// CLIENTES
// ==========================================
async function cargarClientes() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    const clientes = await res.json();
    const tbody = document.getElementById('tablaClientes');
    if (!tbody) return;
    tbody.innerHTML = '';

    clientes.forEach(c => {
      const id = c.ID || c.id || c[0];
      const nombre = c.NOMBRE || c.nombre || c[1];
      const telefono = c.TELEFONO || c.telefono || c[2] || 'N/A';
      const email = c.EMAIL || c.email || c[3] || 'N/A';
      const direccion = c.DIRECCION || c.direccion || c[4] || 'N/A';

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

function eliminarCliente(id) {
  ordenIdAAnular = null;
  equipoIdAEliminar = null;
  clienteIdAEliminar = id;
  
  const mensaje = document.getElementById('mensajeConfirmarAnular');
  if (mensaje) mensaje.innerText = `¿Estás seguro de eliminar el cliente #${id}? ¡Recuerda que se borrarán también sus equipos y órdenes asociadas!`;
  
  const btnConfirmar = document.getElementById('btnConfirmarAnular');
  if (btnConfirmar) btnConfirmar.innerText = 'Sí, Eliminar Cliente';

  const modalElement = document.getElementById('modalConfirmarAnular');
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
}

function abrirModalEditarCliente(id, nombre, telefono, email, direccion) {
  document.getElementById('editClienteId').value = id;
  document.getElementById('editClienteNombre').value = nombre;
  document.getElementById('editClienteTelefono').value = telefono === 'N/A' ? '' : telefono;
  document.getElementById('editClienteEmail').value = email === 'N/A' ? '' : email;
  document.getElementById('editClienteDireccion').value = direccion === 'N/A' ? '' : direccion;

  const modalElement = document.getElementById('modalEditarCliente');
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
}

// ==========================================
// EQUIPOS
// ==========================================
async function cargarEquipos() {
  try {
    const res = await fetch(`${API_URL}/equipos`);
    const equipos = await res.json();
    const tbody = document.getElementById('tablaEquipos');
    if (!tbody) return;
    tbody.innerHTML = '';

    equipos.forEach(eq => {
      const id = eq.ID || eq.id || eq[0];
      const clienteId = eq.CLIENTE_ID || eq.cliente_id || eq[1];
      const clienteNombre = eq.CLIENTE_NOMBRE || eq.cliente_nombre || eq[2];
      const tipo = eq.TIPO || eq.tipo || eq[3];
      const marca = eq.MARCA || eq.marca || eq[4];
      const modelo = eq.MODELO || eq.modelo || eq[5] || 'N/A';
      const serie = eq.NUMERO_SERIE || eq.numero_serie || eq[6] || 'N/A';

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

function eliminarEquipo(id) {
  ordenIdAAnular = null;
  clienteIdAEliminar = null;
  equipoIdAEliminar = id;
  
  const mensaje = document.getElementById('mensajeConfirmarAnular');
  if (mensaje) mensaje.innerText = `¿Eliminar equipo #${id}? Se eliminarán también las órdenes de servicio asociadas.`;
  
  const btnConfirmar = document.getElementById('btnConfirmarAnular');
  if (btnConfirmar) btnConfirmar.innerText = 'Sí, Eliminar Equipo';

  const modalElement = document.getElementById('modalConfirmarAnular');
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
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
  if (select) {
    select.innerHTML = '';
    clientes.forEach(c => {
      const cId = c.ID || c.id || c[0];
      const cNombre = c.NOMBRE || c.nombre || c[1];
      const selected = cId === clienteIdActual ? 'selected' : '';
      select.innerHTML += `<option value="${cId}" ${selected}>${cNombre}</option>`;
    });
  }

  const modalElement = document.getElementById('modalEditarEquipo');
  const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
  modal.show();
}

async function cargarClientesEnSelect() {
  try {
    const res = await fetch(`${API_URL}/clientes`);
    const clientes = await res.json();
    const select = document.getElementById('selectClienteEquipo');
    if (!select) return;

    if (!Array.isArray(clientes) || clientes.length === 0) {
      select.innerHTML = '<option value="">No hay clientes registrados</option>';
      return;
    }

    select.innerHTML = '<option value="" selected disabled>Seleccione un cliente...</option>';
    clientes.forEach(c => {
      const id = c.ID || c.id || c[0];
      const nombre = c.NOMBRE || c.nombre || c[1];
      select.innerHTML += `<option value="${id}">${nombre} (#${id})</option>`;
    });
  } catch (err) {
    console.error('Error al poblar select de clientes:', err);
  }
}

async function cargarEquiposEnSelect() {
  try {
    const res = await fetch(`${API_URL}/equipos`);
    const equipos = await res.json();
    const select = document.getElementById('selectEquipo');
    if (!select) return;

    if (!Array.isArray(equipos) || equipos.length === 0) {
      select.innerHTML = '<option value="">No hay equipos registrados</option>';
      return;
    }

    select.innerHTML = '<option value="" selected disabled>Seleccione un equipo...</option>';
    
    // Límite de caracteres para que la opción no desborde el modal
    const MAX_LONGITUD = 40;

    equipos.forEach(eq => {
      const id = eq.ID || eq.id || eq[0];
      const tipo = eq.TIPO || eq.tipo || eq[3] || 'Equipo';
      const marca = eq.MARCA || eq.marca || eq[4] || '';
      const modelo = eq.MODELO || eq.modelo || eq[5] || '';
      const clienteNombre = eq.CLIENTE_NOMBRE || eq.cliente_nombre || eq[2] || 'Cliente Sin Nombre';

      const descripcion = `${tipo} ${marca} ${modelo}`.trim();
      const textoCompleto = `${clienteNombre} — ${descripcion} (#${id})`;
      
      // Si el texto supera el límite, se corta y se agregan puntos suspensivos (...)
      const textoVisible = textoCompleto.length > MAX_LONGITUD 
        ? textoCompleto.substring(0, MAX_LONGITUD) + '...' 
        : textoCompleto;

      // 'textoVisible' en la etiqueta y 'textoCompleto' en el title para el hover
      select.innerHTML += `<option value="${id}" title="${textoCompleto}">${textoVisible}</option>`;
    });
  } catch (err) {
    console.error('Error al poblar select de equipos:', err);
  }
}

// ==========================================
// LÓGICA DE TEMAS Y UTILERÍAS
// ==========================================
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
  icon.className = tema === 'dark' ? 'bi bi-sun-fill text-warning fs-5' : 'bi bi-moon-stars-fill text-white-50 fs-5';
}

function mostrarNotificacion(mensaje, tipo = 'success') {
  const toastElement = document.getElementById('liveToast');
  const toastMensaje = document.getElementById('toastMensaje');
  if (!toastElement || !toastMensaje) return;

  toastElement.className = `toast align-items-center text-white border-0 bg-${tipo}`;
  toastMensaje.innerText = mensaje;

  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
}

// ==========================================
// DASHBOARD
// ==========================================
async function cargarDashboard() {
  try {
    const [resOrdenes, resClientes] = await Promise.all([
      fetch(`${API_URL}/ordenes`),
      fetch(`${API_URL}/clientes`)
    ]);

    const todasLasOrdenes = await resOrdenes.json();
    const clientes = await resClientes.json();

    if (!Array.isArray(todasLasOrdenes)) return;

    const filtro = document.getElementById('filtroTiempo')?.value || 'todos';
    const ahora = new Date();

    let ordenes = todasLasOrdenes.filter(o => {
      if (filtro === 'todos') return true;
      const rawFecha = o.FECHA_CREACION || o.fecha_creacion || o.FECHA_INGRESO || o.fecha_ingreso || o.FECHA || o.fecha;
      if (!rawFecha) return true;
      const fechaOrden = new Date(rawFecha);
      if (isNaN(fechaOrden.getTime())) return true;

      if (filtro === 'hoy') return fechaOrden.toDateString() === ahora.toDateString();
      if (filtro === 'mes') return fechaOrden.getMonth() === ahora.getMonth() && fechaOrden.getFullYear() === ahora.getFullYear();
      if (filtro === 'anio') return fechaOrden.getFullYear() === ahora.getFullYear();
      return true;
    });

    const activas = ordenes.filter(o => 
      ['EN REVISION', 'EN REPARACION', 'RECIBIDO', 'PENDIENTE'].includes(((o.ESTADO || o.estado) || '').toUpperCase())
    ).length;

    const listas = ordenes.filter(o => 
      ((o.ESTADO || o.estado) || '').toUpperCase() === 'REPARADO'
    ).length;

    const totalClientes = Array.isArray(clientes) ? clientes.length : 0;
    const recaudo = ordenes
      .filter(o => ((o.ESTADO || o.estado) || '').toUpperCase() === 'ENTREGADO')
      .reduce((acc, o) => acc + obtenerCosto(o), 0);

    const elActivas = document.getElementById('dashOrdenesActivas');
    const elListas = document.getElementById('dashOrdenesListas');
    const elClientes = document.getElementById('dashTotalClientes');
    const elRecaudo = document.getElementById('dashRecaudoTotal');

    if (elActivas) elActivas.textContent = activas;
    if (elListas) elListas.textContent = listas;
    if (elClientes) elClientes.textContent = totalClientes;
    if (elRecaudo) elRecaudo.textContent = `$${recaudo.toLocaleString('es-CO')}`;

    const tbody = document.getElementById('tablaDashboardRecientes');
    if (!tbody) return;
    tbody.innerHTML = '';

    const ultimas = [...ordenes].sort((a, b) => (Number(b.ID || b.id) || 0) - (Number(a.ID || a.id) || 0)).slice(0, 5);

    if (ultimas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No hay órdenes registradas para este periodo.</td></tr>`;
      return;
    }

    ultimas.forEach(o => {
      const id = o.ID || o.id || 'S/I';
      const cliente = o.CLIENTE_NOMBRE || o.cliente_nombre || 'Cliente General';
      const tipo = o.EQUIPO_TIPO || o.equipo_tipo || '';
      const marca = o.EQUIPO_MARCA || o.equipo_marca || '';
      const equipoTexto = (tipo || marca) ? `${tipo} ${marca}`.trim() : 'Sin Especificar';
      const estado = o.ESTADO || o.estado || 'PENDIENTE';
      const costo = obtenerCosto(o);

      let badgeColor = 'bg-warning text-dark';
      if (estado === 'EN REPARACION') badgeColor = 'bg-info text-white';
      if (estado === 'REPARADO') badgeColor = 'bg-success text-white';
      if (estado === 'ENTREGADO') badgeColor = 'bg-secondary text-white';
      if (estado === 'ANULADO') badgeColor = 'bg-danger text-white';

      const tr = document.createElement('tr');
      tr.setAttribute('onclick', `verDetalleOrden(${id})`);
      
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