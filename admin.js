/* ===== admin.js — Panel de Administración Nápoles Chipiona ===== */

'use strict';

// ===== AUTENTICACIÓN =====
function checkSession() {
  if (localStorage.getItem('napoles-admin-session') !== 'true') {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('napoles-admin-session');
  window.location.href = 'login.html';
}

// ===== RELOJ EN TIEMPO REAL =====
function initClock() {
  const el = document.getElementById('adminClock');
  if (!el) return;
  function tick() {
    const now = new Date();
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const pad = n => String(n).padStart(2, '0');
    el.textContent = `${dias[now.getDay()]} ${now.getDate()} ${meses[now.getMonth()]} · ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ===== NAVEGACIÓN DE SECCIONES =====
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      showSection(item.dataset.section);
      // Cerrar sidebar en móvil
      document.querySelector('.sidebar')?.classList.remove('mobile-open');
      document.getElementById('sidebarOverlay')?.classList.remove('open');
    });
  });
}

function showSection(id) {
  // Ocultar todas las secciones
  document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
  // Desactivar todos los nav items
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

  // Mostrar la sección indicada
  const section = document.getElementById('section-' + id);
  if (section) section.classList.add('active');

  // Marcar item activo
  const navItem = document.querySelector(`.nav-item[data-section="${id}"]`);
  if (navItem) navItem.classList.add('active');

  // Actualizar título del header
  const titles = {
    dashboard:    '📊 Dashboard',
    pedidos:      '🛒 Pedidos',
    menu:         '🍔 Gestión del Menú',
    ofertas:      '🏷️ Ofertas',
    delivery:     '🛵 Entrega & Estado',
    reservas:     '🎂 Reservas Cumpleaños',
    mensajes:     '📞 Mensajes de Contacto',
    resenas:      '⭐ Reseñas',
    estadisticas: '📈 Estadísticas',
    config:       '⚙️ Configuración',
  };
  const titleEl = document.getElementById('headerTitle');
  if (titleEl) titleEl.textContent = titles[id] || id;

  // Recargar la sección si tiene función init
  if (id === 'dashboard')    renderDashboard();
  if (id === 'delivery')     loadDeliverySettings();
  if (id === 'config')       loadConfig();
  if (id === 'estadisticas') renderEstadisticas();
}

// ===== TOAST NOTIFICATIONS =====
function showToast(msg, type = 'success') {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'admin-toast ' + (type === 'error' ? 'error' : '');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== MODALES =====
function openModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) overlay.classList.add('open');
}
function closeModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) overlay.classList.remove('open');
}

// Cerrar modales al hacer clic en el overlay
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

// ===== DATOS SIMULADOS =====
const PEDIDOS_SIMULADOS = [
  { id: '#1047', fecha: '06/04 14:23', cliente: 'Carlos M.', productos: 'Burguer Doble x2, Patatas', total: '14,30€', estado: 'entregado' },
  { id: '#1046', fecha: '06/04 14:11', cliente: 'Ana R.',    productos: 'Nachos Mex, Enrollado Pollo', total: '11,50€', estado: 'camino' },
  { id: '#1045', fecha: '06/04 13:58', cliente: 'Miguel F.', productos: 'Sandwich Completo, Pat. Salvajes', total: '9,60€', estado: 'preparacion' },
  { id: '#1044', fecha: '06/04 13:45', cliente: 'Lucía T.',  productos: 'Lasaña, Espaguetis Carbonara', total: '11,00€', estado: 'entregado' },
  { id: '#1043', fecha: '06/04 13:30', cliente: 'Pedro G.',  productos: 'Menú XXL x2', total: '14,00€', estado: 'entregado' },
  { id: '#1042', fecha: '06/04 13:12', cliente: 'Sara L.',   productos: 'Chicken Rulo, Patatas Salvajes', total: '9,60€', estado: 'preparacion' },
  { id: '#1041', fecha: '06/04 12:55', cliente: 'Javier B.', productos: 'Nachos Mex x2, Burguer Simple', total: '13,00€', estado: 'cancelado' },
  { id: '#1040', fecha: '06/04 12:40', cliente: 'Marta V.',  productos: 'Perrito Nápoles x3', total: '12,00€', estado: 'entregado' },
  { id: '#1039', fecha: '05/04 22:10', cliente: 'Diego C.',  productos: 'Burguer Barbacoa, Patatas + Bacon', total: '9,60€', estado: 'entregado' },
  { id: '#1038', fecha: '05/04 21:45', cliente: 'Elena M.',  productos: 'Enrollado Pollo x2, Nachos', total: '14,50€', estado: 'entregado' },
  { id: '#1037', fecha: '05/04 21:20', cliente: 'Roberto K.', productos: 'Menú Familiar', total: '19,99€', estado: 'entregado' },
  { id: '#1036', fecha: '05/04 20:55', cliente: 'Isabel P.', productos: 'Rulo Ternera, Pat. Salvajes + Queso', total: '10,60€', estado: 'entregado' },
];

const RESERVAS_SIMULADAS = [
  { nombre: 'Laura García',   fecha: '12/04/2026', hora: '20:00', personas: '15', notas: 'Decoración rosa, tarta de chocolate', estado: 'pendiente' },
  { nombre: 'Manuel Ruiz',    fecha: '19/04/2026', hora: '14:00', personas: '8',  notas: 'Sin gluten para 2 personas', estado: 'confirmada' },
  { nombre: 'Sofía López',    fecha: '25/04/2026', hora: '21:00', personas: '20', notas: 'Necesitan zona reservada', estado: 'pendiente' },
  { nombre: 'Antonio Martín', fecha: '03/05/2026', hora: '13:30', personas: '6',  notas: '', estado: 'confirmada' },
  { nombre: 'Carmen Torres',  fecha: '10/05/2026', hora: '20:30', personas: '12', notas: 'Alergias a frutos secos', estado: 'cancelada' },
];

const MENSAJES_SIMULADOS = [
  { nombre: 'Juan Pablo M.',   email: 'juanpm@gmail.com',    mensaje: 'Hola, quería saber si hacéis pedidos fuera de Chipiona, concretamente a Rota. Muchas gracias por vuestro servicio.', fecha: '06/04 09:15', estado: 'nuevo' },
  { nombre: 'Patricia Soto',   email: 'pati.soto@hotmail.com', mensaje: '¿Tenéis opción vegetariana completa? Me encantaría ver más opciones sin carne en el menú.', fecha: '05/04 18:40', estado: 'leido' },
  { nombre: 'Francisco Reyes', email: 'freyes@empresa.es',   mensaje: 'Somos una empresa y nos gustaría hacer un pedido de empresa para 25 personas. ¿Hacéis descuentos por volumen?', fecha: '04/04 11:22', estado: 'respondido' },
  { nombre: 'Cristina Alba',   email: 'cristina.alba@gmail.com', mensaje: 'Felicidades por vuestra comida, la mejor burguer que hemos probado en toda la costa. ¡Seguiréis siendo nuestro sitio favorito!', fecha: '03/04 20:05', estado: 'leido' },
  { nombre: 'Andrés Campos',   email: 'andres@campos.net',   mensaje: 'Hice un pedido el martes y llegó con 45 minutos de retraso. El repartidor fue muy amable pero me gustaría que mejorasen los tiempos.', fecha: '01/04 22:18', estado: 'respondido' },
  { nombre: 'Natalia Vega',    email: 'nvega90@gmail.com',   mensaje: '¿Tenéis carta de postres? Me encantaría pedir algo dulce para terminar.', fecha: '29/03 15:30', estado: 'nuevo' },
];

const RESENAS_SIMULADAS = [
  { nombre: 'María G.',     texto: '¡La mejor hamburguesa de Chipiona! Ingredientes frescos y mucho sabor.',        estrellas: 5, fecha: 'Enero 2026',    activa: true },
  { nombre: 'Carlos R.',    texto: 'Los nachos están increíbles, y el servicio a domicilio muy rápido.',            estrellas: 5, fecha: 'Febrero 2026',  activa: true },
  { nombre: 'Ana P.',       texto: 'Buena calidad y precio justo. El menú XXL merece cada céntimo.',                estrellas: 5, fecha: 'Marzo 2026',    activa: true },
  { nombre: 'David L.',     texto: 'Muy rico todo, aunque tardaron un poco más de lo esperado.',                    estrellas: 4, fecha: 'Enero 2026',    activa: true },
  { nombre: 'Sofía M.',     texto: 'El enrollado de pollo está delicioso. Repetiré sin duda.',                      estrellas: 5, fecha: 'Febrero 2026',  activa: true },
  { nombre: 'Pablo T.',     texto: 'Me encanta la variedad del menú. Siempre encuentro algo nuevo que probar.',     estrellas: 4, fecha: 'Marzo 2026',    activa: true },
  { nombre: 'Laura S.',     texto: 'El perrito Nápoles es espectacular. El toque de cebolla crujiente lo hace único.', estrellas: 5, fecha: 'Febrero 2026', activa: true },
  { nombre: 'Roberto F.',   texto: 'Buen restaurante, comida sabrosa y precios razonables.',                        estrellas: 4, fecha: 'Enero 2026',    activa: true },
  { nombre: 'Elena V.',     texto: '¡La lasaña casera es lo mejor! Muy recomendable para llevar.',                  estrellas: 5, fecha: 'Marzo 2026',    activa: false },
];

const MENU_PRODUCTOS = [
  { cat: 'Fritos',      emoji: '🍟', nombre: 'Patatas',                precio: 3.80 },
  { cat: 'Fritos',      emoji: '🧀', nombre: 'Patatas + Queso',        precio: 4.80 },
  { cat: 'Fritos',      emoji: '🥓', nombre: 'Patatas + Bacon + Queso',precio: 5.30 },
  { cat: 'Fritos',      emoji: '🍟', nombre: 'Patatas Salvajes',       precio: 4.30 },
  { cat: 'Sandwiches',  emoji: '🥪', nombre: 'Sandwich Mixto',         precio: 2.70 },
  { cat: 'Sandwiches',  emoji: '🍗', nombre: 'Sandwich Pollo',         precio: 3.20 },
  { cat: 'Sandwiches',  emoji: '🥚', nombre: 'Sandwich Completo',      precio: 3.60 },
  { cat: 'Perritos',    emoji: '🌭', nombre: 'Perrito Simple',         precio: 2.80 },
  { cat: 'Perritos',    emoji: '🌭', nombre: 'Perrito Completo',       precio: 3.50 },
  { cat: 'Perritos',    emoji: '🌭', nombre: 'Perrito Nápoles',        precio: 4.00 },
  { cat: 'Pasta',       emoji: '🍝', nombre: 'Lasaña',                 precio: 6.00 },
  { cat: 'Pasta',       emoji: '🍝', nombre: 'Espaguetis Boloñesa',    precio: 5.00 },
  { cat: 'Pasta',       emoji: '🍝', nombre: 'Espaguetis Carbonara',   precio: 5.00 },
  { cat: 'Burguers',    emoji: '🍔', nombre: 'Burguer Simple',         precio: 3.00 },
  { cat: 'Burguers',    emoji: '🍔', nombre: 'Burguer Completa',       precio: 4.50 },
  { cat: 'Burguers',    emoji: '🍔', nombre: 'Burguer Doble',          precio: 5.00 },
  { cat: 'Burguers',    emoji: '🍔', nombre: 'Menú XXL',               precio: 7.00 },
  { cat: 'Baguettes',   emoji: '🥖', nombre: 'Baguette Mixto',         precio: 3.30 },
  { cat: 'Baguettes',   emoji: '🍗', nombre: 'Baguette Pollo',         precio: 3.80 },
  { cat: 'Baguettes',   emoji: '🥚', nombre: 'Baguette Completo',      precio: 3.80 },
  { cat: 'Tex-Mex',     emoji: '🌮', nombre: 'Nachos Mex',             precio: 5.50 },
  { cat: 'Tex-Mex',     emoji: '🌯', nombre: 'Enrollado de Pollo',     precio: 5.00 },
  { cat: 'Ensaladas',   emoji: '🥗', nombre: 'Ensalada César',         precio: 5.50 },
  { cat: 'Ensaladas',   emoji: '🥗', nombre: 'Ensalada Mediterránea',  precio: 5.00 },
  { cat: 'Filetes',     emoji: '🥩', nombre: 'Filete de Pollo',        precio: 7.50 },
  { cat: 'Filetes',     emoji: '🥩', nombre: 'Filete de Ternera',      precio: 9.50 },
];

// ===== SECCIÓN 1: DASHBOARD =====
function renderDashboard() {
  const deliveryTime   = localStorage.getItem('napoles-delivery-time')   || '30';
  const deliveryStatus = localStorage.getItem('napoles-delivery-status') || 'open';

  const statusLabels = { open: '🟢 Abierto', busy: '🟡 Alta demanda', closed: '🔴 Cerrado' };
  setElText('dash-delivery-time',   deliveryTime + ' min');
  setElText('dash-delivery-status', statusLabels[deliveryStatus] || deliveryStatus);

  renderBarChart();
  renderLastOrdersTable();
  renderTopProducts();
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderBarChart() {
  const datos = [
    { day: 'Lun', val: 18 }, { day: 'Mar', val: 31 }, { day: 'Mié', val: 22 },
    { day: 'Jue', val: 19 }, { day: 'Vie', val: 45 }, { day: 'Sáb', val: 67 },
    { day: 'Dom', val: 52 },
  ];
  const container = document.getElementById('barChartContainer');
  if (!container) return;

  const maxVal = Math.max(...datos.map(d => d.val));
  const W = 560, H = 200, barW = 50, gap = 30, padL = 20, padB = 40, padT = 20;

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px" xmlns="http://www.w3.org/2000/svg">`;
  // Horizontal grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(frac => {
    const y = padT + (1 - frac) * (H - padB - padT);
    const val = Math.round(frac * maxVal);
    svg += `<line x1="${padL}" x2="${W - 10}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
    svg += `<text x="${padL - 2}" y="${y + 4}" fill="#9a9ab0" font-size="9" text-anchor="end">${val}</text>`;
  });

  datos.forEach((d, i) => {
    const x = padL + i * (barW + gap) + 20;
    const barH = ((d.val / maxVal) * (H - padB - padT));
    const y = H - padB - barH;
    // Gradient rect
    svg += `<defs><linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6b35"/><stop offset="100%" stop-color="#e63946"/></linearGradient></defs>`;
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="5" fill="url(#g${i})"/>`;
    svg += `<text x="${x + barW / 2}" y="${y - 5}" fill="#e8e8f0" font-size="10" text-anchor="middle" font-weight="700">${d.val}</text>`;
    svg += `<text x="${x + barW / 2}" y="${H - padB + 16}" fill="#9a9ab0" font-size="11" text-anchor="middle">${d.day}</text>`;
  });
  svg += '</svg>';
  container.innerHTML = svg;
}

function renderLastOrdersTable() {
  const tbody = document.getElementById('lastOrdersTbody');
  if (!tbody) return;
  const estadoBadge = {
    entregado:   '<span class="badge badge-success">✅ Entregado</span>',
    preparacion: '<span class="badge badge-warning">🔄 En preparación</span>',
    camino:      '<span class="badge badge-info">🛵 En camino</span>',
    pendiente:   '<span class="badge badge-muted">⏳ Pendiente</span>',
    cancelado:   '<span class="badge badge-danger">❌ Cancelado</span>',
  };
  tbody.innerHTML = PEDIDOS_SIMULADOS.slice(0, 6).map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.fecha}</td>
      <td>${p.productos}</td>
      <td><strong>${p.total}</strong></td>
      <td>${estadoBadge[p.estado] || p.estado}</td>
    </tr>`).join('');
}

function renderTopProducts() {
  const container = document.getElementById('topProductsContainer');
  if (!container) return;
  const top = [
    { emoji: '🍔', nombre: 'Burguer Doble',        pedidos: 127 },
    { emoji: '🌮', nombre: 'Nachos Mex',            pedidos: 98  },
    { emoji: '🥪', nombre: 'Sandwich Completo',     pedidos: 87  },
    { emoji: '🥓', nombre: 'Patatas + Bacon + Queso',pedidos: 76 },
    { emoji: '🌯', nombre: 'Enrollado de Pollo',    pedidos: 65  },
  ];
  const max = top[0].pedidos;
  container.innerHTML = top.map(p => `
    <div class="progress-bar-wrap">
      <div class="progress-label">${p.emoji} ${p.nombre}</div>
      <div class="progress-bar-bg" style="max-width:180px">
        <div class="progress-bar-fill" style="width:${(p.pedidos / max * 100).toFixed(0)}%"></div>
      </div>
      <div class="progress-count">${p.pedidos} pedidos</div>
    </div>`).join('');
}

// ===== SECCIÓN 2: PEDIDOS =====
let pedidosFilter = 'todos';
let pedidosSearch = '';

function initPedidos() {
  renderPedidosTable();
}

function setPedidosFilter(f) {
  pedidosFilter = f;
  document.querySelectorAll('#section-pedidos .filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.filter === f);
  });
  renderPedidosTable();
}

function renderPedidosTable() {
  const tbody = document.getElementById('pedidosTbody');
  if (!tbody) return;
  const estadoBadge = {
    entregado:   '<span class="badge badge-success">✅ Entregado</span>',
    preparacion: '<span class="badge badge-warning">🔄 Preparación</span>',
    camino:      '<span class="badge badge-info">🛵 En camino</span>',
    pendiente:   '<span class="badge badge-muted">⏳ Pendiente</span>',
    cancelado:   '<span class="badge badge-danger">❌ Cancelado</span>',
  };
  const filtered = PEDIDOS_SIMULADOS.filter(p => {
    const matchFilter = pedidosFilter === 'todos' || p.estado === pedidosFilter;
    const q = pedidosSearch.toLowerCase();
    const matchSearch = !q || p.id.toLowerCase().includes(q) || p.productos.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:2rem">No hay pedidos con ese filtro.</td></tr>`
    : filtered.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.fecha}</td>
      <td>${p.cliente}</td>
      <td>${p.productos}</td>
      <td><strong>${p.total}</strong></td>
      <td>${estadoBadge[p.estado] || p.estado}</td>
      <td>
        <select class="form-control" style="width:auto;font-size:0.75rem;padding:0.25rem 0.5rem"
          onchange="cambiarEstadoPedido('${p.id}',this.value)">
          <option value="pendiente"   ${p.estado==='pendiente'?'selected':''}>⏳ Pendiente</option>
          <option value="preparacion" ${p.estado==='preparacion'?'selected':''}>🔄 Preparación</option>
          <option value="camino"      ${p.estado==='camino'?'selected':''}>🛵 En camino</option>
          <option value="entregado"   ${p.estado==='entregado'?'selected':''}>✅ Entregado</option>
          <option value="cancelado"   ${p.estado==='cancelado'?'selected':''}>❌ Cancelado</option>
        </select>
      </td>
    </tr>`).join('');
}

function cambiarEstadoPedido(id, nuevoEstado) {
  const pedido = PEDIDOS_SIMULADOS.find(p => p.id === id);
  if (pedido) { pedido.estado = nuevoEstado; renderPedidosTable(); }
  showToast(`Pedido ${id} → ${nuevoEstado}`);
}

// ===== SECCIÓN 3: MENÚ =====
let menuCatFilter = 'Todos';

function initMenu() {
  renderMenuTable();
}

function setMenuCat(cat) {
  menuCatFilter = cat;
  document.querySelectorAll('#section-menu .filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });
  renderMenuTable();
}

function renderMenuTable() {
  const tbody = document.getElementById('menuTbody');
  if (!tbody) return;
  const prices = JSON.parse(localStorage.getItem('napoles-prices') || '{}');
  const filtered = menuCatFilter === 'Todos'
    ? MENU_PRODUCTOS
    : MENU_PRODUCTOS.filter(p => p.cat === menuCatFilter);

  tbody.innerHTML = filtered.map((p, i) => {
    const precio = prices[p.nombre] !== undefined ? prices[p.nombre] : p.precio;
    const globalIdx = MENU_PRODUCTOS.indexOf(p);
    return `
    <tr>
      <td>${p.emoji}</td>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="badge badge-muted">${p.cat}</span></td>
      <td>
        <strong id="precio-${globalIdx}">${precio.toFixed(2)}€</strong>
        <div class="inline-edit-form" id="editForm-${globalIdx}">
          <input type="number" step="0.10" min="0" value="${precio.toFixed(2)}" id="editInput-${globalIdx}" />
          <button class="btn btn-success btn-xs" onclick="guardarPrecio(${globalIdx})">✓</button>
          <button class="btn btn-secondary btn-xs" onclick="cancelarEditPrecio(${globalIdx})">✕</button>
        </div>
      </td>
      <td>
        <label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
      </td>
      <td>
        <button class="btn btn-secondary btn-xs" onclick="editarPrecio(${globalIdx})">
          <i class="fas fa-edit"></i> Precio
        </button>
      </td>
    </tr>`;
  }).join('');
}

function editarPrecio(idx) {
  document.getElementById('editForm-' + idx)?.classList.add('open');
}
function cancelarEditPrecio(idx) {
  document.getElementById('editForm-' + idx)?.classList.remove('open');
}
function guardarPrecio(idx) {
  const input = document.getElementById('editInput-' + idx);
  if (!input) return;
  const val = parseFloat(input.value);
  if (isNaN(val) || val < 0) { showToast('Precio inválido', 'error'); return; }
  const producto = MENU_PRODUCTOS[idx];
  const prices = JSON.parse(localStorage.getItem('napoles-prices') || '{}');
  prices[producto.nombre] = val;
  localStorage.setItem('napoles-prices', JSON.stringify(prices));
  setElText('precio-' + idx, val.toFixed(2) + '€');
  cancelarEditPrecio(idx);
  showToast(`💾 Precio de "${producto.nombre}" actualizado a ${val.toFixed(2)}€`);
}

// Añadir producto (modal)
function guardarNuevoProducto() {
  const nombre  = document.getElementById('newProdNombre')?.value.trim();
  const emoji   = document.getElementById('newProdEmoji')?.value.trim()  || '🍽️';
  const precio  = parseFloat(document.getElementById('newProdPrecio')?.value);
  const cat     = document.getElementById('newProdCat')?.value;
  if (!nombre || isNaN(precio)) { showToast('Rellena nombre y precio', 'error'); return; }
  MENU_PRODUCTOS.push({ cat, emoji, nombre, precio });
  closeModal('addProduct');
  renderMenuTable();
  showToast(`✅ Producto "${nombre}" añadido`);
}

// ===== SECCIÓN 4: OFERTAS =====
const OFERTAS = [
  { id: 0, tag: 'HOT', titulo: '2×1 los Martes',          descripcion: 'Dos burguers al precio de una. Válido todos los martes.', precio: '¡GRATIS! segunda burguer', activa: true },
  { id: 1, tag: 'FAM', titulo: 'Menú Familiar',           descripcion: '2 burguers + patatas + 4 bebidas.',                       precio: '19,99€',                  activa: true },
  { id: 2, tag: 'DEAL',titulo: 'Sandwich + Bebida + Pat.',descripcion: 'Sandwich + bebida 33cl + patatas. El combo perfecto.',     precio: '12,99€',                  activa: true },
];

function renderOfertas() {
  const container = document.getElementById('ofertasContainer');
  if (!container) return;
  container.innerHTML = OFERTAS.map(o => `
    <div class="offer-edit-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="badge badge-orange">${o.tag}</span>
          <span style="font-weight:700;color:var(--admin-text)">${o.titulo}</span>
        </div>
        <label class="toggle">
          <input type="checkbox" ${o.activa ? 'checked' : ''} onchange="toggleOferta(${o.id},this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">Título</label>
        <input class="form-control" value="${o.titulo}" onblur="actualizarOferta(${o.id},'titulo',this.value)" />
      </div>
      <div class="form-group">
        <label class="form-label">Descripción</label>
        <input class="form-control" value="${o.descripcion}" onblur="actualizarOferta(${o.id},'descripcion',this.value)" />
      </div>
      <div class="form-group">
        <label class="form-label">Texto del precio</label>
        <input class="form-control" value="${o.precio}" onblur="actualizarOferta(${o.id},'precio',this.value)" />
      </div>
      <div class="offer-preview">
        <div class="offer-preview-title">${o.titulo}</div>
        <div>${o.descripcion}</div>
        <div style="color:var(--admin-accent);font-weight:700;margin-top:0.3rem">${o.precio}</div>
      </div>
    </div>`).join('');
}

function toggleOferta(id, val) {
  OFERTAS[id].activa = val;
  showToast(val ? '✅ Oferta activada' : '⚠️ Oferta desactivada');
}
function actualizarOferta(id, campo, val) {
  OFERTAS[id][campo] = val;
  renderOfertas();
  showToast('💾 Oferta actualizada');
}

// ===== SECCIÓN 5: DELIVERY =====
function loadDeliverySettings() {
  const status = localStorage.getItem('napoles-delivery-status') || 'open';
  const time   = localStorage.getItem('napoles-delivery-time')   || '30';

  document.querySelectorAll('.delivery-btn').forEach(btn => {
    btn.className = 'delivery-btn';
    if (btn.dataset.status === status) {
      btn.classList.add('active-' + status);
    }
  });

  const timeInput = document.getElementById('deliveryTimeInput');
  if (timeInput) timeInput.value = time;

  renderDeliveryHistory();
  loadSchedule();
}

function setDeliveryStatus(status) {
  document.querySelectorAll('.delivery-btn').forEach(btn => {
    btn.className = 'delivery-btn';
    if (btn.dataset.status === status) btn.classList.add('active-' + status);
  });
}

function saveDeliverySettings() {
  const status = document.querySelector('.delivery-btn.active-open, .delivery-btn.active-busy, .delivery-btn.active-closed');
  const statusVal = status ? status.dataset.status : 'open';
  const time = document.getElementById('deliveryTimeInput')?.value || '30';

  localStorage.setItem('napoles-delivery-status', statusVal);
  localStorage.setItem('napoles-delivery-time', time);

  // Guardar historial
  const history = JSON.parse(localStorage.getItem('napoles-delivery-history') || '[]');
  const labels = { open: '🟢 Abierto', busy: '🟡 Alta demanda', closed: '🔴 Cerrado' };
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  history.unshift({
    status: statusVal,
    label: labels[statusVal],
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    date: `${pad(now.getDate())}/${pad(now.getMonth()+1)}`,
  });
  localStorage.setItem('napoles-delivery-history', JSON.stringify(history.slice(0, 5)));

  renderDeliveryHistory();
  showToast('✅ Configuración de entrega guardada');
}

function renderDeliveryHistory() {
  const container = document.getElementById('deliveryHistoryList');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('napoles-delivery-history') || '[]');
  if (history.length === 0) {
    container.innerHTML = '<div style="color:var(--admin-text-muted);font-size:0.82rem">Sin historial aún.</div>';
    return;
  }
  container.innerHTML = history.map(h => `
    <div class="history-item">
      <div class="history-dot ${h.status}"></div>
      <div>${h.label}</div>
      <div class="history-time">${h.date} ${h.time}</div>
    </div>`).join('');
}

// Horario
const DIAS_SEMANA = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

function loadSchedule() {
  const saved = JSON.parse(localStorage.getItem('napoles-horario') || 'null');
  const tbody = document.getElementById('scheduleTbody');
  if (!tbody) return;

  const defaultOpen  = ['12:00','12:00','12:00','12:00','12:00','11:30','11:30'];
  const defaultClose = ['23:30','23:30','23:30','23:30','23:30','00:00','00:00'];

  tbody.innerHTML = DIAS_SEMANA.map((dia, i) => {
    const row = saved ? saved[i] : { open: defaultOpen[i], close: defaultClose[i], cerrado: false };
    return `
    <tr>
      <td style="font-weight:600">${dia}</td>
      <td><input type="time" class="sch-open" data-i="${i}" value="${row.open}" /></td>
      <td><input type="time" class="sch-close" data-i="${i}" value="${row.close}" /></td>
      <td>
        <label class="toggle">
          <input type="checkbox" class="sch-cerrado" data-i="${i}" ${row.cerrado ? 'checked' : ''} />
          <span class="toggle-slider"></span>
        </label>
      </td>
    </tr>`;
  }).join('');
}

function saveSchedule() {
  const rows = DIAS_SEMANA.map((_, i) => ({
    open:    document.querySelector(`.sch-open[data-i="${i}"]`)?.value   || '12:00',
    close:   document.querySelector(`.sch-close[data-i="${i}"]`)?.value  || '23:30',
    cerrado: document.querySelector(`.sch-cerrado[data-i="${i}"]`)?.checked || false,
  }));
  localStorage.setItem('napoles-horario', JSON.stringify(rows));
  showToast('✅ Horario guardado');
}

// ===== SECCIÓN 6: RESERVAS =====
let reservasFilter = 'todas';

function initReservas() {
  updateReservasBadge();
  renderReservasTable();
}

function updateReservasBadge() {
  const pendientes = RESERVAS_SIMULADAS.filter(r => r.estado === 'pendiente').length;
  const badge = document.getElementById('reservasBadge');
  if (badge) badge.textContent = pendientes;
}

function setReservasFilter(f) {
  reservasFilter = f;
  document.querySelectorAll('#section-reservas .filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.filter === f);
  });
  renderReservasTable();
}

function renderReservasTable() {
  const tbody = document.getElementById('reservasTbody');
  if (!tbody) return;
  const estadoBadge = {
    pendiente:  '<span class="badge badge-warning">⏳ Pendiente</span>',
    confirmada: '<span class="badge badge-success">✅ Confirmada</span>',
    cancelada:  '<span class="badge badge-danger">❌ Cancelada</span>',
  };
  const filtered = reservasFilter === 'todas'
    ? RESERVAS_SIMULADAS
    : RESERVAS_SIMULADAS.filter(r => r.estado === reservasFilter);

  tbody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="7" style="text-align:center;color:var(--admin-text-muted);padding:2rem">Sin reservas.</td></tr>`
    : filtered.map((r, i) => `
    <tr>
      <td><strong>${r.nombre}</strong></td>
      <td>${r.fecha}</td>
      <td>${r.hora}</td>
      <td>${r.personas} pers.</td>
      <td title="${r.notas}">${r.notas ? r.notas.substring(0, 30) + (r.notas.length > 30 ? '…' : '') : '—'}</td>
      <td>${estadoBadge[r.estado]}</td>
      <td style="display:flex;gap:0.3rem;flex-wrap:wrap">
        ${r.estado !== 'confirmada' ? `<button class="btn btn-success btn-xs" onclick="cambiarEstadoReserva(${RESERVAS_SIMULADAS.indexOf(r)},'confirmada')">✅</button>` : ''}
        ${r.estado !== 'cancelada'  ? `<button class="btn btn-danger btn-xs"  onclick="cambiarEstadoReserva(${RESERVAS_SIMULADAS.indexOf(r)},'cancelada')">❌</button>` : ''}
      </td>
    </tr>`).join('');
}

function cambiarEstadoReserva(idx, estado) {
  RESERVAS_SIMULADAS[idx].estado = estado;
  updateReservasBadge();
  renderReservasTable();
  showToast(`Reserva de ${RESERVAS_SIMULADAS[idx].nombre} → ${estado}`);
}

// ===== SECCIÓN 7: MENSAJES =====
let mensajesFilter = 'todos';

function initMensajes() {
  updateMensajesBadge();
  renderMensajesTable();
}

function updateMensajesBadge() {
  const nuevos = MENSAJES_SIMULADOS.filter(m => m.estado === 'nuevo').length;
  const badge = document.getElementById('mensajesBadge');
  if (badge) badge.textContent = nuevos || '';
}

function setMensajesFilter(f) {
  mensajesFilter = f;
  document.querySelectorAll('#section-mensajes .filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.filter === f);
  });
  renderMensajesTable();
}

function renderMensajesTable() {
  const tbody = document.getElementById('mensajesTbody');
  if (!tbody) return;
  const estadoBadge = {
    nuevo:      '<span class="badge badge-danger">🔴 Nuevo</span>',
    leido:      '<span class="badge badge-muted">👁️ Leído</span>',
    respondido: '<span class="badge badge-success">✅ Respondido</span>',
  };
  const filtered = mensajesFilter === 'todos'
    ? MENSAJES_SIMULADOS
    : MENSAJES_SIMULADOS.filter(m => m.estado === mensajesFilter);

  tbody.innerHTML = filtered.map((m, i) => {
    const globalIdx = MENSAJES_SIMULADOS.indexOf(m);
    return `
    <tr class="expandable-row" onclick="toggleMensaje(${globalIdx})">
      <td><strong>${m.nombre}</strong></td>
      <td style="color:var(--admin-text-muted)">${m.email}</td>
      <td>${m.mensaje.substring(0, 60)}${m.mensaje.length > 60 ? '…' : ''}</td>
      <td>${m.fecha}</td>
      <td>${estadoBadge[m.estado] || m.estado}</td>
      <td onclick="event.stopPropagation()">
        ${m.estado !== 'leido' && m.estado !== 'respondido' ? `<button class="btn btn-secondary btn-xs" onclick="marcarMensaje(${globalIdx},'leido')">👁️ Leer</button>` : ''}
      </td>
    </tr>
    <tr id="msg-expand-${globalIdx}" style="display:none">
      <td colspan="6" style="background:rgba(255,255,255,0.02);padding:0.8rem 0.9rem">
        <strong>Mensaje completo:</strong><br/>
        <p style="color:var(--admin-text-muted);margin-top:0.4rem">${m.mensaje}</p>
        <br/>
        <button class="btn btn-secondary btn-xs" onclick="marcarMensaje(${globalIdx},'respondido');event.stopPropagation()">✅ Marcar respondido</button>
      </td>
    </tr>`;
  }).join('');
}

function toggleMensaje(idx) {
  const row = document.getElementById('msg-expand-' + idx);
  if (!row) return;
  row.style.display = row.style.display === 'none' ? '' : 'none';
  if (MENSAJES_SIMULADOS[idx].estado === 'nuevo') {
    marcarMensaje(idx, 'leido');
  }
}
function marcarMensaje(idx, estado) {
  MENSAJES_SIMULADOS[idx].estado = estado;
  updateMensajesBadge();
  renderMensajesTable();
}

// ===== SECCIÓN 8: RESEÑAS =====
function initResenas() {
  renderResenas();
  renderStarDistribution();
}

function renderResenas() {
  const container = document.getElementById('resenasContainer');
  if (!container) return;
  container.innerHTML = RESENAS_SIMULADAS.map((r, i) => `
    <div class="admin-card" style="margin-bottom:0.7rem">
      <div style="display:flex;align-items:flex-start;gap:1rem">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem">
            <strong>${r.nombre}</strong>
            <span class="stars-display">${'⭐'.repeat(r.estrellas)}</span>
            <span style="color:var(--admin-text-muted);font-size:0.75rem">${r.fecha}</span>
          </div>
          <p style="font-size:0.85rem;color:var(--admin-text-muted)">"${r.texto}"</p>
        </div>
        <label class="toggle" title="${r.activa ? 'Visible' : 'Oculta'}">
          <input type="checkbox" ${r.activa ? 'checked' : ''} onchange="toggleResena(${i},this.checked)" />
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>`).join('');
}

function toggleResena(i, val) {
  RESENAS_SIMULADAS[i].activa = val;
  renderStarDistribution();
  showToast(val ? '✅ Reseña visible' : '⚠️ Reseña oculta');
}

function renderStarDistribution() {
  const container = document.getElementById('starDistribution');
  if (!container) return;
  const counts = [0,0,0,0,0];
  RESENAS_SIMULADAS.filter(r => r.activa).forEach(r => counts[r.estrellas - 1]++);
  const total = counts.reduce((a, b) => a + b, 0);
  const avg = total ? (RESENAS_SIMULADAS.filter(r => r.activa).reduce((s, r) => s + r.estrellas, 0) / total).toFixed(1) : '0.0';
  setElText('avgRating', avg);

  container.innerHTML = [5,4,3,2,1].map(s => `
    <div class="star-bar-row">
      <div class="star-bar-label">${s}⭐</div>
      <div class="star-bar-bg">
        <div class="star-bar-fill" style="width:${total ? (counts[s-1]/total*100).toFixed(0) : 0}%"></div>
      </div>
      <div class="star-bar-count">${counts[s-1]}</div>
    </div>`).join('');
}

function guardarNuevaResena() {
  const nombre   = document.getElementById('newRNombre')?.value.trim();
  const texto    = document.getElementById('newRTexto')?.value.trim();
  const estrellas= parseInt(document.getElementById('newREstrellas')?.value) || 5;
  const fecha    = document.getElementById('newRFecha')?.value || new Date().toLocaleDateString('es-ES', {month:'long',year:'numeric'});
  if (!nombre || !texto) { showToast('Rellena nombre y texto', 'error'); return; }
  RESENAS_SIMULADAS.unshift({ nombre, texto, estrellas, fecha, activa: true });
  closeModal('addResena');
  renderResenas();
  renderStarDistribution();
  showToast('✅ Reseña añadida');
}

// ===== SECCIÓN 9: ESTADÍSTICAS =====
function renderEstadisticas() {
  renderWeeklyChart();
  renderHourlyChart();
}

function renderWeeklyChart() {
  const container = document.getElementById('weeklyChartContainer');
  if (!container) return;
  const semActual = [1240, 890, 1100, 780, 1560, 2100, 1850];
  const semAnterior = [980, 1020, 850, 900, 1400, 1980, 1700];
  const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const W = 560, H = 200, barW = 28, gap = 8, groupGap = 20, padL = 40, padB = 40, padT = 20;
  const maxVal = Math.max(...semActual, ...semAnterior);

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px" xmlns="http://www.w3.org/2000/svg">`;
  dias.forEach((dia, i) => {
    const groupX = padL + i * (barW * 2 + gap + groupGap);
    [semActual[i], semAnterior[i]].forEach((val, j) => {
      const x = groupX + j * (barW + gap);
      const bH = ((val / maxVal) * (H - padB - padT));
      const y = H - padB - bH;
      const color = j === 0 ? 'url(#wg1)' : 'rgba(52,152,219,0.6)';
      svg += `<defs><linearGradient id="wg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6b35"/><stop offset="100%" stop-color="#e63946"/></linearGradient></defs>`;
      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${bH}" rx="3" fill="${color}"/>`;
    });
    svg += `<text x="${groupX + barW}" y="${H - padB + 16}" fill="#9a9ab0" font-size="11" text-anchor="middle">${dia}</text>`;
  });
  // Leyenda
  svg += `<rect x="${W-130}" y="10" width="12" height="12" rx="2" fill="#ff6b35"/>`;
  svg += `<text x="${W-112}" y="21" fill="#9a9ab0" font-size="11">Esta semana</text>`;
  svg += `<rect x="${W-130}" y="30" width="12" height="12" rx="2" fill="rgba(52,152,219,0.6)"/>`;
  svg += `<text x="${W-112}" y="41" fill="#9a9ab0" font-size="11">Semana anterior</text>`;
  svg += '</svg>';
  container.innerHTML = svg;
}

function renderHourlyChart() {
  const container = document.getElementById('hourlyChartContainer');
  if (!container) return;
  const franjas = [
    { label: '12-15h', val: 28 }, { label: '15-18h', val: 15 },
    { label: '18-21h', val: 42 }, { label: '21-23h', val: 38 },
  ];
  const maxVal = Math.max(...franjas.map(f => f.val));
  const W = 400, H = 180, barW = 60, gap = 25, padL = 20, padB = 40, padT = 20;

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px" xmlns="http://www.w3.org/2000/svg">`;
  franjas.forEach((f, i) => {
    const x = padL + i * (barW + gap) + 10;
    const bH = (f.val / maxVal) * (H - padB - padT);
    const y = H - padB - bH;
    svg += `<defs><linearGradient id="hg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff6b35"/><stop offset="100%" stop-color="#e63946"/></linearGradient></defs>`;
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${bH}" rx="5" fill="url(#hg${i})"/>`;
    svg += `<text x="${x + barW/2}" y="${y - 5}" fill="#e8e8f0" font-size="11" text-anchor="middle" font-weight="700">${f.val}%</text>`;
    svg += `<text x="${x + barW/2}" y="${H - padB + 16}" fill="#9a9ab0" font-size="11" text-anchor="middle">${f.label}</text>`;
  });
  svg += '</svg>';
  container.innerHTML = svg;
}

// ===== SECCIÓN 10: CONFIGURACIÓN =====
function loadConfig() {
  const defaults = {
    restaurantName: 'Nápoles Chipiona',
    telefono:       '956 000 000',
    whatsapp:       'https://wa.me/34956000000',
    direccion:      'Chipiona, Cádiz',
    horarioTexto:   '12:00 – 23:30 (todos los días)',
    descuentoFlash: '20',
    precioMinimo:   '10',
    showBirthday:   true,
    showCountdown:  true,
  };
  const config = Object.assign({}, defaults, JSON.parse(localStorage.getItem('napoles-config') || '{}'));

  Object.keys(defaults).forEach(key => {
    const el = document.getElementById('cfg-' + key);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!config[key];
    else el.value = config[key];
  });
}

function saveConfig() {
  const keys = ['restaurantName','telefono','whatsapp','direccion','horarioTexto','descuentoFlash','precioMinimo','showBirthday','showCountdown'];
  const config = {};
  keys.forEach(key => {
    const el = document.getElementById('cfg-' + key);
    if (!el) return;
    config[key] = el.type === 'checkbox' ? el.checked : el.value;
  });
  localStorage.setItem('napoles-config', JSON.stringify(config));
  showToast('✅ Configuración guardada correctamente');
}

function cambiarPassword() {
  const actual  = document.getElementById('pwdActual')?.value;
  const nueva   = document.getElementById('pwdNueva')?.value;
  const confirm = document.getElementById('pwdConfirm')?.value;
  const storedPwd = localStorage.getItem('napoles-admin-password') || 'napoles2026';

  if (actual !== storedPwd)    { showToast('❌ Contraseña actual incorrecta', 'error'); return; }
  if (!nueva || nueva.length < 6) { showToast('❌ La nueva contraseña debe tener al menos 6 caracteres', 'error'); return; }
  if (nueva !== confirm)       { showToast('❌ Las contraseñas no coinciden', 'error'); return; }

  localStorage.setItem('napoles-admin-password', nueva);
  document.getElementById('pwdActual').value  = '';
  document.getElementById('pwdNueva').value   = '';
  document.getElementById('pwdConfirm').value = '';
  showToast('✅ Contraseña cambiada correctamente');
}

// ===== SIDEBAR MÓVIL =====
function initMobileSidebar() {
  const hamburger = document.getElementById('hamburgerAdmin');
  const sidebar   = document.querySelector('.sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  hamburger?.addEventListener('click', () => {
    sidebar?.classList.toggle('mobile-open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('open');
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  initClock();
  initNavigation();
  initModals();
  initMobileSidebar();

  // Inicializar badges
  updateReservasBadge();
  updateMensajesBadge();

  // Cargar datos para tablas que se renderizarán cuando se visite
  initPedidos();
  initMenu();
  initReservas();
  initMensajes();
  initResenas();
  renderOfertas();

  // Mostrar dashboard por defecto
  showSection('dashboard');
});
