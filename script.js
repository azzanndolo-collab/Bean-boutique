/* ============================================================
   BEAN BOUTIQUE — script.js
   Cinematic interactions, cart, animations, slider
   ============================================================ */

'use strict';

/* ── Page Loader ──────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.classList.add('hide');
  }, 900);

  // Trigger hero bg zoom
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 100);
});

/* ── Custom Cursor ────────────────────────────────────────── */
const cursorDot  = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // Smooth ring follow
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover expand
  const hoverables = document.querySelectorAll('a, button, .filter-btn, .add-to-cart-btn, .qty-btn');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });
}

/* ── Scroll Progress Bar ──────────────────────────────────── */
const scrollBar = document.getElementById('scroll-progress');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollBar.style.width = ((scrollTop / docHeight) * 100) + '%';
  });
}

/* ── Navbar Scroll ────────────────────────────────────────── */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ── Active Nav Link ──────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a, .mobile-nav a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ── Mobile Hamburger ─────────────────────────────────────── */
const hamburger  = document.querySelector('.hamburger');
const mobileNav  = document.querySelector('.mobile-nav');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Scroll Reveal ────────────────────────────────────────── */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));
}
initReveal();

/* ── Parallax ─────────────────────────────────────────────── */
function initParallax() {
  const parallaxEls = document.querySelectorAll('.parallax-img');
  if (!parallaxEls.length) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const parent = el.closest('.parallax-container');
      if (!parent) return;
      const rect   = parent.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (center - window.innerHeight / 2) * 0.3;
      el.style.transform = `translateY(${offset}px)`;
    });
  });
}
initParallax();

/* ── Modal ────────────────────────────────────────────────── */
function initModal() {
  const overlay = document.getElementById('discount-modal');
  if (!overlay) return;

  // Show after delay if not dismissed before
  if (!sessionStorage.getItem('modal-dismissed')) {
    setTimeout(() => overlay.classList.add('open'), 3500);
  }

  const closeBtns = overlay.querySelectorAll('.modal-close, .modal-dismiss');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.classList.remove('open');
      sessionStorage.setItem('modal-dismissed', '1');
    });
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      sessionStorage.setItem('modal-dismissed', '1');
    }
  });
}
initModal();

/* ── Toast Notification ───────────────────────────────────── */
function showToast(title, msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="toast-title"></div><div class="toast-msg"></div>`;
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-title').textContent = title;
  toast.querySelector('.toast-msg').textContent   = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Shopping Cart (localStorage) ────────────────────────── */
const CART_KEY = 'bean_boutique_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, price, img, note) {
  const cart  = getCart();
  const index = cart.findIndex(i => i.id === id);
  if (index > -1) {
    cart[index].qty += 1;
  } else {
    cart.push({ id, name, price, img, note, qty: 1 });
  }
  saveCart(cart);
  showToast('Added to Cart', name + ' has been added.');
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function changeQty(id, delta) {
  const cart  = getCart();
  const index = cart.findIndex(i => i.id === id);
  if (index === -1) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const listEl    = document.getElementById('cart-list');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const wrapperEl = document.getElementById('cart-wrapper');
  if (!listEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl)   emptyEl.style.display  = 'block';
    if (wrapperEl) wrapperEl.style.display = 'none';
    if (summaryEl) summaryEl.classList.add('hidden');
    return;
  }

  if (emptyEl)   emptyEl.style.display  = 'none';
  if (wrapperEl) wrapperEl.style.display = '';
  if (summaryEl) summaryEl.classList.remove('hidden');

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-note">${item.note || ''}</div>
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    </div>
  `).join('');

  // Update summary
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax      = subtotal * 0.08;
  const total    = subtotal + shipping + tax;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('summary-subtotal', '$' + subtotal.toFixed(2));
  set('summary-shipping', '$' + shipping.toFixed(2));
  set('summary-tax',      '$' + tax.toFixed(2));
  set('summary-total',    '$' + total.toFixed(2));
}

// Init cart count on all pages
updateCartCount();

// Bind add-to-cart buttons
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;

  // Ripple
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
  btn.style.position = 'relative';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);

  const id    = btn.dataset.id    || btn.dataset.name?.replace(/\s/g,'-').toLowerCase();
  const name  = btn.dataset.name  || 'Coffee';
  const price = parseFloat(btn.dataset.price) || 12.00;
  const img   = btn.dataset.img   || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&q=70';
  const note  = btn.dataset.note  || '';
  addToCart(id, name, price, img, note);
});

// Render cart if on cart page
if (document.getElementById('cart-list')) renderCart();

/* ── Filter & Search ──────────────────────────────────────── */
function initFilter() {
  const searchInput = document.getElementById('product-search');
  const filterBtns  = document.querySelectorAll('.filter-btn[data-cat]');
  const cards       = document.querySelectorAll('.product-card[data-cat], .equip-card[data-cat]');

  function applyFilter() {
    const query  = searchInput ? searchInput.value.toLowerCase() : '';
    const active = document.querySelector('.filter-btn.active[data-cat]');
    const cat    = active ? active.dataset.cat : 'all';

    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const desc = (card.dataset.desc || '').toLowerCase();
      const cCat = card.dataset.cat || '';
      const matchCat  = cat === 'all' || cCat === cat;
      const matchText = !query || name.includes(query) || desc.includes(query);

      card.style.display = (matchCat && matchText) ? '' : 'none';
      card.style.opacity = '';
    });
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });
}
initFilter();

/* ── Featured Slider ──────────────────────────────────────── */
function initSlider(wrapperId) {
  const wrapper  = document.getElementById(wrapperId);
  if (!wrapper) return;
  const track    = wrapper.querySelector('.slider-track');
  const slides   = wrapper.querySelectorAll('.slider-slide');
  const prevBtn  = wrapper.querySelector('.prev-btn');
  const nextBtn  = wrapper.querySelector('.next-btn');
  const dotsEl   = wrapper.querySelector('.slider-dots');
  if (!track || !slides.length) return;

  let current = 0;
  const visibleCount = () => window.innerWidth < 600 ? 1 : window.innerWidth < 900 ? 2 : 3;

  function createDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const count = Math.ceil(slides.length / visibleCount());
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    const count = Math.ceil(slides.length / visibleCount());
    current = Math.max(0, Math.min(index, count - 1));
    const slideWidth = slides[0].offsetWidth + 16;
    track.style.transform = `translateX(-${current * visibleCount() * slideWidth}px)`;
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  createDots();
  window.addEventListener('resize', () => { createDots(); goTo(0); });

  // Auto-advance
  let autoPlay = setInterval(() => goTo(current + 1 >= Math.ceil(slides.length / visibleCount()) ? 0 : current + 1), 5000);
  wrapper.addEventListener('mouseenter', () => clearInterval(autoPlay));
  wrapper.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goTo(current + 1 >= Math.ceil(slides.length / visibleCount()) ? 0 : current + 1), 5000);
  });
}
initSlider('featured-slider');
initSlider('equipment-slider');

/* ── Registration Form ────────────────────────────────────── */
const regForm = document.getElementById('reg-form');
if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = regForm.querySelector('button[type="submit"]');
    const origText = btn.innerHTML;
    btn.innerHTML = '<span>Registered ✓</span>';
    btn.style.background = '#2d5a27';
    btn.style.borderColor = '#2d5a27';
    setTimeout(() => {
      btn.innerHTML = origText;
      btn.style.background = '';
      btn.style.borderColor = '';
      regForm.reset();
    }, 3000);
    showToast('Registered!', 'See you at the event.');
  });
}

/* ── Subscription Form ────────────────────────────────────── */
document.querySelectorAll('.subscribe-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.dataset.plan || 'Basic';
    showToast('Subscribed!', 'Welcome to the ' + plan + ' plan.');
  });
});

/* ── Smooth Scroll Anchor ─────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Checkout Button ──────────────────────────────────────── */
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (!cart.length) { showToast('Cart is Empty', 'Add some coffee first!'); return; }
    showToast('Order Placed!', 'Thank you for your order. ☕');
    saveCart([]);
    renderCart();
  });
}

/* ── Keyboard support (escape closes modal) ───────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.querySelector('.modal-overlay.open');
    if (modal) {
      modal.classList.remove('open');
      sessionStorage.setItem('modal-dismissed', '1');
    }
    const mNav = document.querySelector('.mobile-nav.open');
    if (mNav) {
      mNav.classList.remove('open');
      document.querySelector('.hamburger')?.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});