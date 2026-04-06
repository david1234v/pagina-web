import { db, ref, set, get, onValue, push, update } from './firebase.js';

// ===== Cart State =====
let cart = JSON.parse(localStorage.getItem('napoles-cart') || '[]');

function saveCart() {
  localStorage.setItem('napoles-cart', JSON.stringify(cart));
}

function addToCart(name, price, emoji) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, emoji, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`🛒 ${name} añadido al carrito`);
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  updateCartUI();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(name);
  else { saveCart(); updateCartUI(); }
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.toggle('show', count > 0);
  }

  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <p>Tu carrito está vacío</p>
        <small>¡Añade tus platos favoritos!</small>
      </div>`;
  } else {
    itemsEl.innerHTML = '';
    cart.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span class="cart-item-emoji">${item.emoji}</span>
        <div class="cart-item-info">
          <div class="name"></div>
          <div class="unit-price"></div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-index="${index}">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-index="${index}">+</button>
        </div>
        <span class="cart-item-price">${(item.price * item.qty).toFixed(2)}€</span>
        <button class="cart-remove" data-action="remove" data-index="${index}">🗑</button>`;
      div.querySelector('.name').textContent = item.name;
      div.querySelector('.unit-price').textContent = `${item.price.toFixed(2)}€ c/u`;
      itemsEl.appendChild(div);
    });
  }

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = getCartTotal().toFixed(2) + '€';
}

// ===== Cart Items Event Delegation =====
function initCartEvents() {
  const itemsEl = document.getElementById('cartItems');
  if (!itemsEl) return;
  itemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (isNaN(index) || index < 0 || index >= cart.length) return;
    const action = btn.dataset.action;
    const name = cart[index].name;
    if (action === 'inc') changeQty(name, 1);
    else if (action === 'dec') changeQty(name, -1);
    else if (action === 'remove') removeFromCart(name);
  });
}

// ===== Cart Panel =====
function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Toast =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ===== Countdown Timer =====
function initCountdown() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  function tick() {
    const diff = end - new Date();
    if (diff <= 0) { setTime(0, 0, 0); return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setTime(h, m, s);
  }

  function setTime(h, m, s) {
    const pad = n => String(n).padStart(2, '0');
    const el = id => document.getElementById(id);
    if (el('cd-hours')) el('cd-hours').textContent = pad(h);
    if (el('cd-minutes')) el('cd-minutes').textContent = pad(m);
    if (el('cd-seconds')) el('cd-seconds').textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

// ===== Menu Tabs =====
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  if (tabs.length > 0) tabs[0].click();
}

// ===== Add to cart via data attributes =====
function initAddBtns() {
  document.querySelectorAll('.add-btn[data-name]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.emoji);
    });
  });
}

// ===== Testimonials Slider =====
function initSlider() {
  const track = document.getElementById('testimonialsTrack');
  const dots = document.querySelectorAll('.dot');
  const total = dots.length;
  let current = 0;
  let autoPlay;

  function goTo(index) {
    current = (index + total) % total;
    if (track) track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('sliderPrev')?.addEventListener('click', () => { clearTimeout(autoPlay); goTo(current - 1); startAuto(); });
  document.getElementById('sliderNext')?.addEventListener('click', () => { clearTimeout(autoPlay); goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { clearTimeout(autoPlay); goTo(i); startAuto(); }));

  function startAuto() {
    autoPlay = setTimeout(() => { goTo(current + 1); startAuto(); }, 5000);
  }

  goTo(0);
  startAuto();
}

// ===== Header Scroll Effect =====
function initHeader() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu?.classList.toggle('open');
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
}

// ===== Scroll Reveal =====
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

// ===== Contact Form =====
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const mensajeData = {
      nombre: document.getElementById('contactName').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      mensaje: document.getElementById('contactMsg').value.trim(),
      estado: 'nuevo',
      timestamp: Date.now()
    };
    try {
      push(ref(db, 'mensajes'), mensajeData)
        .then(() => console.log('Mensaje guardado en Firebase'))
        .catch(e => console.warn('Error guardando mensaje:', e));
    } catch(e) {
      console.warn('Firebase no disponible:', e);
    }
    success.style.display = 'block';
    form.reset();
    setTimeout(() => success.style.display = 'none', 4000);
  });
}

// ===== Birthday Reservation Form =====
function initBirthdayForm() {
  const form = document.getElementById('birthdayForm');
  const success = document.getElementById('birthdaySuccess');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bName').value.trim();
    const date = document.getElementById('bDate').value;
    const time = document.getElementById('bTime').value;
    const people = document.getElementById('bPeople').value;
    const notes = document.getElementById('bNotes').value.trim();

    if (!name || !date || !time || !people) {
      showToast('⚠️ Por favor rellena todos los campos obligatorios');
      return;
    }

    const reservaData = {
      nombre: name,
      fecha: date,
      hora: time,
      personas: people,
      notas: notes,
      estado: 'pendiente',
      timestamp: Date.now()
    };
    try {
      push(ref(db, 'reservas'), reservaData)
        .then(() => console.log('Reserva guardada en Firebase'))
        .catch(e => console.warn('Error guardando reserva:', e));
    } catch(e) {
      console.warn('Firebase no disponible:', e);
    }

    success.style.display = 'flex';
    form.reset();
    setTimeout(() => success.style.display = 'none', 6000);
  });
}

// ===== Delivery Time =====
function openAdminPanel() {
  window.location.href = 'login.html';
}

function saveDeliverySettings() {
  const time = document.getElementById('adminTimeInput')?.value || '30';
  const status = document.getElementById('adminStatusInput')?.value || 'open';
  localStorage.setItem('napoles-delivery-time', time);
  localStorage.setItem('napoles-delivery-status', status);
  loadDeliveryTime();
  const panel = document.getElementById('adminPanel');
  if (panel) panel.style.display = 'none';
  showToast('✅ Configuración guardada');
}

function initDeliveryTime() {
  loadDeliveryTime();

  // Escuchar cambios en tiempo real desde Firebase
  try {
    onValue(ref(db, 'config/delivery'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const time = data.time ? String(data.time) : '30';
        const status = data.status || 'open';
        // Actualizar localStorage con los datos de Firebase
        localStorage.setItem('napoles-delivery-time', time);
        localStorage.setItem('napoles-delivery-status', status);
        loadDeliveryTime(); // re-renderizar con nuevos datos
      }
    });
  } catch(e) {
    console.warn('Firebase no disponible, usando localStorage:', e);
  }
}

function loadDeliveryTime() {
  const time = localStorage.getItem('napoles-delivery-time') || '30';
  const status = localStorage.getItem('napoles-delivery-status') || 'open';

  const displayEl = document.getElementById('deliveryTimeDisplay');
  const badgeEl = document.getElementById('deliveryStatusBadge');

  if (displayEl) displayEl.textContent = time + ' min';

  if (badgeEl) {
    if (status === 'open') {
      badgeEl.textContent = '🟢 Abierto — Pedidos activos';
      badgeEl.className = 'delivery-badge open';
    } else if (status === 'busy') {
      badgeEl.textContent = '🟡 Mucha demanda — Tiempo estimado puede variar';
      badgeEl.className = 'delivery-badge busy';
    } else {
      badgeEl.textContent = '🔴 Cerrado — No aceptamos pedidos ahora';
      badgeEl.className = 'delivery-badge closed';
    }
  }
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== Checkout =====
function checkout() {
  if (cart.length === 0) {
    showToast('⚠️ Tu carrito está vacío');
    return;
  }
  const status = localStorage.getItem('napoles-delivery-status') || 'open';
  if (status === 'closed') {
    showToast('🔴 Lo sentimos, ahora mismo estamos cerrados');
    return;
  }
  const time = localStorage.getItem('napoles-delivery-time') || '30';

  // Guardar pedido en Firebase
  const pedidoData = {
    fecha: new Date().toISOString(),
    productos: cart.map(i => ({ nombre: i.name, precio: i.price, cantidad: i.qty, emoji: i.emoji })),
    total: parseFloat(getCartTotal().toFixed(2)),
    estado: 'pendiente',
    timestamp: Date.now()
  };

  try {
    push(ref(db, 'pedidos'), pedidoData)
      .then(() => console.log('Pedido guardado en Firebase'))
      .catch(e => console.warn('Error guardando pedido:', e));
  } catch(e) {
    console.warn('Firebase no disponible:', e);
  }

  alert(`¡Pedido recibido! 🍔\nTotal: ${getCartTotal().toFixed(2)}€\n\nTiempo estimado de entrega: ~${time} minutos\n\nTe llamaremos para confirmar.\n¡Gracias por elegir Nápoles Chipiona!`);
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initCartEvents();
  initCountdown();
  initTabs();
  initAddBtns();
  initSlider();
  initHeader();
  initMobileMenu();
  initReveal();
  initContactForm();
  initBirthdayForm();
  initDeliveryTime();
  initSmoothScroll();
});

// Exponer funciones globales para los onclick inline del HTML
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.openAdminPanel = openAdminPanel;
window.saveDeliverySettings = saveDeliverySettings;