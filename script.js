// Expanded product list and repo-hosted SVG images
const products = [
  { id: 'cl_frock', title: 'Floral Frock', category: 'clothes', price: 39.99, img: 'images/cl_frock.svg' },
  { id: 'cl_skirt', title: 'Pleated Skirt', category: 'clothes', price: 29.99, img: 'images/cl_skirt.svg' },
  { id: 'cl_shorts', title: 'Chino Shorts', category: 'clothes', price: 24.99, img: 'images/cl_shorts.svg' },
  { id: 'cl_shirt', title: 'Oxford Shirt', category: 'clothes', price: 34.99, img: 'images/cl_shirt.svg' },
  { id: 'cl_tshirt', title: 'Organic T-Shirt', category: 'clothes', price: 19.99, img: 'images/cl_tshirt.svg' },
  { id: 'cl_jeans', title: 'Straight Jeans', category: 'clothes', price: 49.99, img: 'images/cl_jeans.svg' },
  { id: 'cl_denim_jacket', title: 'Denim Jacket', category: 'clothes', price: 79.00, img: 'images/cl_denim_jacket.svg' },
  { id: 'cl_blazer', title: 'Casual Blazer', category: 'clothes', price: 99.00, img: 'images/cl_blazer.svg' },
  { id: 'cl_maxi', title: 'Maxi Dress', category: 'clothes', price: 59.99, img: 'images/cl_maxi.svg' },
  { id: 'cl_mini', title: 'Mini Dress', category: 'clothes', price: 44.99, img: 'images/cl_mini.svg' },
  { id: 'cl_sweater', title: 'Cozy Sweater', category: 'clothes', price: 54.99, img: 'images/cl_sweater.svg' },
  { id: 'cl_cardigan', title: 'Knit Cardigan', category: 'clothes', price: 39.50, img: 'images/cl_cardigan.svg' },
  { id: 'cl_hoodie', title: 'Zip Hoodie', category: 'clothes', price: 45.00, img: 'images/cl_hoodie.svg' },
  { id: 'cl_tracksuit', title: 'Tracksuit', category: 'clothes', price: 69.99, img: 'images/cl_tracksuit.svg' },
  { id: 'cl_leggings', title: 'Everyday Leggings', category: 'clothes', price: 22.00, img: 'images/cl_leggings.svg' },
  { id: 'j1', title: 'Gold Hoops', category: 'jewelry', price: 19.99, img: 'images/j1.svg' },
  { id: 'j2', title: 'Pearl Necklace', category: 'jewelry', price: 59.99, img: 'images/j2.svg' },
  { id: 'j3', title: 'Minimalist Ring', category: 'jewelry', price: 15.00, img: 'images/j3.svg' },
];

// Simple cart stored as { productId: quantity }
let cart = JSON.parse(localStorage.getItem('sara_cart') || '{}');

// UI element refs
const productsEl = document.getElementById('products');
const cartCountEl = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const cartItemsEl = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const modal = document.getElementById('modal');
const orderSummary = document.getElementById('orderSummary');
const confirmOrder = document.getElementById('confirmOrder');
const cancelOrder = document.getElementById('cancelOrder');
const searchInput = document.getElementById('searchInput');
const catButtons = document.querySelectorAll('.cat-btn');

let currentCategory = 'all';

// Render functions
function renderProducts(filter = 'all', q = '') {
  const list = products.filter(p => (filter === 'all' || p.category === filter) &&
    p.title.toLowerCase().includes(q.toLowerCase()));
  productsEl.innerHTML = list.map(p => productCard(p)).join('');
  // attach add handlers
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
}

function productCard(p) {
  return `
    <article class="card" role="article" aria-label="${p.title}">
      <img src="${p.img}" alt="${p.title}" loading="lazy">
      <h4>${p.title}</h4>
      <div class="meta">
        <div class="price">$${p.price.toFixed(2)}</div>
        <button class="btn small primary add-to-cart" data-id="${p.id}">Add</button>
      </div>
    </article>
  `;
}

function addToCart(id, qty = 1) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  updateCartUI();
  openCart();
}

function saveCart() {
  localStorage.setItem('sara_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const entries = Object.entries(cart);
  let subtotal = 0;
  cartItemsEl.innerHTML = '';
  if (entries.length === 0) {
    cartItemsEl.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>';
  } else {
    entries.forEach(([id, qty]) => {
      const prod = products.find(p => p.id === id);
      if (!prod) return;
      subtotal += prod.price * qty;
      const item = document.createElement('div');
      item.className = 'cart-item';
      item.innerHTML = `
        <img src="${prod.img}" alt="${prod.title}">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between"><strong>${prod.title}</strong><div class="price">$${(prod.price*qty).toFixed(2)}</div></div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.4rem">
            <div class="qty-controls">
              <button class="btn small" data-action="decrease" data-id="${id}">−</button>
              <span style="min-width:28px;display:inline-block;text-align:center">${qty}</span>
              <button class="btn small" data-action="increase" data-id="${id}">+</button>
            </div>
            <button class="btn small" data-action="remove" data-id="${id}">Remove</button>
          </div>
        </div>
      `;
      cartItemsEl.appendChild(item);
    });
    // attach item handlers
    cartItemsEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'increase') { cart[id] = (cart[id] || 0) + 1; }
        if (action === 'decrease') { cart[id] = Math.max(0, (cart[id] || 0) - 1); if (cart[id] === 0) delete cart[id]; }
        if (action === 'remove') { delete cart[id]; }
        saveCart();
        updateCartUI();
      });
    });
  }
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  cartCountEl.textContent = Object.values(cart).reduce((a,b)=>a+b,0);
}

function openCart() {
  cartSidebar.classList.add('open');
  cartSidebar.setAttribute('aria-hidden','false');
  overlay.hidden = false;
  overlay.style.display = 'block';
}
function closeCartFn() {
  cartSidebar.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden','true');
  overlay.hidden = true;
  overlay.style.display = 'none';
}

// Checkout
checkoutBtn.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) return alert('Cart is empty.');
  showOrderModal();
});

function showOrderModal() {
  orderSummary.innerHTML = '';
  let total = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const p = products.find(x => x.id === id);
    const line = document.createElement('div');
    line.style.display = 'flex';
    line.style.justifyContent = 'space-between';
    line.style.margin = '.25rem 0';
    line.textContent = `${qty} × ${p.title}`;
    const right = document.createElement('div');
    right.textContent = `$${(p.price*qty).toFixed(2)}`;
    line.appendChild(right);
    orderSummary.appendChild(line);
    total += p.price * qty;
  });
  const totalRow = document.createElement('div');
  totalRow.style.display = 'flex';
  totalRow.style.justifyContent = 'space-between';
  totalRow.style.fontWeight = '700';
  totalRow.style.marginTop = '.5rem';
  totalRow.innerHTML = `<div>Total</div><div>$${total.toFixed(2)}</div>`;
  orderSummary.appendChild(totalRow);

  modal.setAttribute('aria-hidden','false');
  modal.style.display = 'flex';
  overlay.hidden = false;
  overlay.style.display = 'block';
}

confirmOrder.addEventListener('click', () => {
  // simple simulated order placement
  const orderId = 'SARA' + Math.floor(Math.random()*900000 + 100000);
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  alert(`Thanks! Your order ${orderId} is placed. We will email you the details.`);
  cart = {};
  saveCart();
  updateCartUI();
  closeCartFn();
  overlay.hidden = true;
  overlay.style.display = 'none';
});
cancelOrder.addEventListener('click', () => {
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  overlay.hidden = true;
  overlay.style.display = 'none';
});

// header/cart toggles
cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
overlay.addEventListener('click', () => {
  closeCartFn();
  modal.setAttribute('aria-hidden','true');
  modal.style.display = 'none';
  overlay.hidden = true;
  overlay.style.display = 'none';
});

// Clear cart
clearCartBtn.addEventListener('click', () => {
  if (!confirm('Clear cart?')) return;
  cart = {};
  saveCart();
  updateCartUI();
});

// search / category
searchInput.addEventListener('input', (e) => {
  renderProducts(currentCategory, e.target.value);
});
catButtons.forEach(btn => btn.addEventListener('click', (e) => {
  catButtons.forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  currentCategory = e.target.dataset.cat;
  renderProducts(currentCategory, searchInput.value);
}));

// init
renderProducts();
updateCartUI();
