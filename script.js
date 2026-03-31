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
        <small>¡Añade tus pizzas favoritas!</small>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span class="cart-item-emoji">${item.emoji}</span>
        <div class="cart-item-info">
          <div class="name">${item.name}</div>
          <div class="unit-price">${item.price.toFixed(2)}€ c/u</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
        <span class="cart-item-price">${(item.price * item.qty).toFixed(2)}€</span>
        <button class="cart-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">🗑</button>
      </div>`).join('');
  }

  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = getCartTotal().toFixed(2) + '€';
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
  // Set end to midnight tonight
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  function tick() {
    const diff = end - new Date();
    if (diff <= 0) {
      setTime(0, 0, 0, 0);
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setTime(0, h, m, s);
  }

  function setTime(d, h, m, s) {
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

  // Activate first tab
  if (tabs.length > 0) tabs[0].click();
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

  document.getElementById('sliderPrev')?.addEventListener('click', () => {
    clearTimeout(autoPlay);
    goTo(current - 1);
    startAuto();
  });
  document.getElementById('sliderNext')?.addEventListener('click', () => {
    clearTimeout(autoPlay);
    goTo(current + 1);
    startAuto();
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    clearTimeout(autoPlay);
    goTo(i);
    startAuto();
  }));

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

  // Close on link click
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
    success.style.display = 'block';
    form.reset();
    setTimeout(() => success.style.display = 'none', 4000);
  });
}

// ===== Smooth Scroll for anchor links =====
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
  alert(`¡Pedido recibido! 🍕\nTotal: ${getCartTotal().toFixed(2)}€\n\nTe llamaremos al número que nos facilites.\n¡Gracias por elegir Pizzería Nápoles!`);
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  initCountdown();
  initTabs();
  initSlider();
  initHeader();
  initMobileMenu();
  initReveal();
  initContactForm();
  initSmoothScroll();
});
