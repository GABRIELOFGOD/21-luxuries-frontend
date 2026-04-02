/**
 * Cart System with localStorage
 * Manages shopping cart data, storage, and retrieval
 */

// const BACKEND_URL = "https://www.app.21luxuries.com/api";
const CART_STORAGE_KEY = "merlin_fashion_cart";
const WISHLIST_STORAGE_KEY = "merlin_fashion_wishlist";

// Cart Class for managing cart operations
class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      this.notifyObservers();
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }

  /**
   * Add item to cart
   */
  addItem(product, quantity = 1) {
    const existingItem = this.items.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
        category: product.category,
      });
    }

    this.saveCart();
    return true;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.items = this.items.filter((item) => item._id !== productId);
    this.saveCart();
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item._id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  /**
   * Clear entire cart
   */
  clearCart() {
    this.items = [];
    this.saveCart();
  }

  /**
   * Get total price of cart
   */
  getTotalPrice() {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Get total items in cart
   */
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get all cart items
   */
  getItems() {
    return this.items;
  }

  /**
   * Check if item is in cart
   */
  isInCart(productId) {
    return this.items.some((item) => item._id === productId);
  }

  /**
   * Get item quantity
   */
  getItemQuantity(productId) {
    const item = this.items.find((item) => item._id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Observer pattern for cart updates
   */
  observers = [];

  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers() {
    this.observers.forEach((callback) => callback(this.items));
  }
}

// Wishlist Class
class Wishlist {
  constructor() {
    this.items = this.loadWishlist();
  }

  loadWishlist() {
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
      console.error("Error loading wishlist:", error);
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error("Error saving wishlist:", error);
    }
  }

  addItem(product) {
    if (!this.items.find((item) => item._id === product._id)) {
      this.items.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
      });
      this.saveWishlist();
      return true;
    }
    return false;
  }

  removeItem(productId) {
    this.items = this.items.filter((item) => item._id !== productId);
    this.saveWishlist();
  }

  isInWishlist(productId) {
    return this.items.some((item) => item._id === productId);
  }

  getItems() {
    return this.items;
  }

  clearWishlist() {
    this.items = [];
    this.saveWishlist();
  }
}

// Initialize cart and wishlist globally
const cart = new Cart();
const wishlist = new Wishlist();

/**
 * Format price with currency symbol
 */
function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format price with abbreviations (K, M, etc.)
 */
function formatPriceAbbreviated(price) {
  if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(1) + "M";
  } else if (price >= 1_000) {
    return (price / 1_000).toFixed(1) + "K";
  }
  return price.toFixed(2);
}

/**
 * Update cart UI elements
 */
function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const subtotal = document.getElementById("subtotal");
  const taxAmount = document.getElementById("tax");
  const cartTotal = document.getElementById("cartTotal");

  if (cartCount) {
    const totalItems = cart.getTotalItems();
    cartCount.textContent = totalItems > 0 ? totalItems : "0";
  }

  if (subtotal) {
    const total = cart.getTotalPrice();
    subtotal.textContent = formatPrice(total);
  }

  if (taxAmount) {
    const total = cart.getTotalPrice();
    const tax = Math.floor(total * 0.1);
    taxAmount.textContent = formatPrice(tax);
  }

  if (cartTotal) {
    const total = cart.getTotalPrice();
    const tax = Math.floor(total * 0.1);
    cartTotal.textContent = formatPrice(total + tax);
  }

  renderCartItems();
}

/**
 * Render cart items in sidebar
 */
function renderCartItems() {
  const cartContent = document.getElementById("cartSidebarContent");

  if (!cartContent) return;

  const items = cart.getItems();

  if (items.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart-message">
        <p>🛍️</p>
        <p>Your cart is empty</p>
        <small>Add some items to get started</small>
      </div>
    `;
  } else {
    cartContent.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-controls">
            <div class="cart-item-qty">
              <button onclick="updateCartItemQuantity('${item._id}', ${item.quantity - 1})">−</button>
              <input type="number" value="${item.quantity}" readonly>
              <button onclick="updateCartItemQuantity('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item._id}')">✕</button>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }
}

/**
 * Update cart item quantity
 */
window.updateCartItemQuantity = function (productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    cart.updateQuantity(productId, quantity);
    updateCartUI();
  }
};

/**
 * Remove item from cart
 */
window.removeFromCart = function (productId) {
  cart.removeItem(productId);
  updateCartUI();
};

/**
 * Subscribe to cart changes (observer pattern)
 */
cart.subscribe((items) => {
  updateCartUI();
});

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { cart, wishlist, formatPrice, formatPriceAbbreviated };
}
