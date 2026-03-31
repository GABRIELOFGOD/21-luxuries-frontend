/**
 * Cart Page Script
 * Handles display and management of shopping cart items
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  setupCartEventListeners();
});

/**
 * Render cart page - show either cart items or empty state
 */
function renderCartPage() {
  const cartItems = cart.getItems();
  const cartContainer = document.getElementById('cartItemsContainer');
  const emptyContainer = document.getElementById('emptyCartContainer');

  if (cartItems.length === 0) {
    cartContainer.style.display = 'none';
    document.querySelector('.cart-summary-section').style.display = 'none';
    emptyContainer.style.display = 'block';
  } else {
    cartContainer.style.display = 'block';
    document.querySelector('.cart-summary-section').style.display = 'block';
    emptyContainer.style.display = 'none';
    renderCartItems();
    updateCartSummary();
  }
}

/**
 * Render individual cart items
 */
function renderCartItems() {
  const cartContainer = document.getElementById('cartItemsContainer');
  const cartItems = cart.getItems();

  cartContainer.innerHTML = cartItems.map((item) => `
    <div class="cart-item-row" data-product-id="${item._id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>

      <div class="cart-item-details">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-category">${item.category || 'Product'}</p>
        <p class="item-price">${formatPrice(item.price)}</p>
      </div>

      <div class="cart-item-quantity">
        <button class="qty-btn" onclick="updateItemQuantity('${item._id}', ${item.quantity - 1})">−</button>
        <input type="number" value="${item.quantity}" readonly>
        <button class="qty-btn" onclick="updateItemQuantity('${item._id}', ${item.quantity + 1})">+</button>
      </div>

      <div class="cart-item-total">
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>

      <button class="remove-btn" onclick="removeItemFromCart('${item._id}')" title="Remove item">
        ✕
      </button>
    </div>
  `).join('');
}

/**
 * Update cart item quantity
 */
window.updateItemQuantity = function (productId, quantity) {
  if (quantity <= 0) {
    removeItemFromCart(productId);
  } else {
    cart.updateQuantity(productId, quantity);
    renderCartPage();
  }
};

/**
 * Remove item from cart
 */
window.removeItemFromCart = function (productId) {
  cart.removeItem(productId);
  renderCartPage();
  showNotification('Item removed from cart', 'success');
};

/**
 * Update cart summary (totals)
 */
function updateCartSummary() {
  const subtotal = cart.getTotalPrice();
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
  document.getElementById('summaryTax').textContent = formatPrice(tax);
  document.getElementById('summaryTotal').textContent = formatPrice(total);

  // Update shipping based on subtotal (free over ₦50,000)
  const shippingElement = document.getElementById('summaryShipping');
  if (subtotal >= 50000) {
    shippingElement.textContent = 'FREE';
  } else {
    shippingElement.textContent = formatPrice(2500);
  }
}

/**
 * Setup event listeners for cart page buttons
 */
function setupCartEventListeners() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const continueBrowsingBtn = document.getElementById('continueBrowsingBtn');
  const applyPromoBtn = document.getElementById('applyPromoBtn');

  // Checkout button - now handled by checkout.js
  // The checkout.js file will manage the modal opening

  continueBrowsingBtn?.addEventListener('click', () => {
    window.location.href = 'products.html';
  });

  applyPromoBtn?.addEventListener('click', () => {
    const promoCode = document.getElementById('promoCode').value.trim();
    if (!promoCode) {
      showNotification('Please enter a promo code', 'error');
      return;
    }
    // Promo code validation would happen here
    showNotification('Promo code applied!', 'success');
  });

  // Subscribe to cart updates
  cart.subscribe(() => {
    renderCartPage();
  });
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  let container = document.getElementById('notificationContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 2000;
      max-width: 300px;
    `;
    document.body.appendChild(container);
  }

  const notification = document.createElement('div');
  const bgColor = {
    'success': '#c8e6c9',
    'error': '#ffcdd2',
    'info': '#e3f2fd'
  };
  const textColor = {
    'success': '#2e7d32',
    'error': '#c62828',
    'info': '#1565c0'
  };
  const borderColor = {
    'success': '#2e7d32',
    'error': '#c62828',
    'info': '#1565c0'
  };

  notification.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: ${bgColor[type]};
    color: ${textColor[type]};
    border-left: 4px solid ${borderColor[type]};
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;

  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
