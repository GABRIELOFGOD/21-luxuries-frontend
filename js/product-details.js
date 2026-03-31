/**
 * Product Details Page Script
 * Manages product display, cart operations, and wishlist
 */

let currentProduct = null;
let relatedProducts = [];
// const BACKEND_URL = "https://21-luxuries.vercel.app/api";
const BACKEND_URL = "https://21-luxuries.vercel.app/api";

/**
 * Initialize page on load
 */
document.addEventListener("DOMContentLoaded", () => {
  getProductIdFromURL();
  setupEventListeners();
  setupCartSidebar();
  updateCartUI();
});

/**
 * Get product ID from URL and fetch product details
 */
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    fetchProductDetails(productId);
  } else {
    showErrorState("Product not found");
  }
}

/**
 * Fetch product details from backend
 */
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`${BACKEND_URL}/products/${productId}`);

    if (!response.ok) {
      throw new Error("Product not found");
    }

    const data = await response.json();
    // console.log("Fetched product:", data);
    currentProduct = data;
    displayProductDetails(currentProduct);
    fetchRelatedProducts(currentProduct.category);
  } catch (error) {
    console.error("Error fetching product:", error);
    showErrorState("Failed to load product details");
  }
}

/**
 * Fetch related products based on category
 */
async function fetchRelatedProducts(category) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/products?category=${category}&limit=4`
    );
    const data = await response.json();
    relatedProducts = data.products.filter(
      (p) => p._id !== currentProduct._id
    );
    displayRelatedProducts(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
  }
}

/**
 * Display product details on page
 */
function displayProductDetails(product) {
  // Update breadcrumb
  document.getElementById("breadcrumb-product").textContent = product.name;

  // Update product name
  document.getElementById("productName").textContent = product.name;

  // Update price
  const priceElement = document.getElementById("productPrice");
  priceElement.textContent = formatPrice(product.price);

  // Update stock status
  const stockIndicator = document.getElementById("stockIndicator");
  const stockText = document.getElementById("stockText");

  if (product.stock > 0) {
    stockIndicator.classList.add("stock-in");
    stockIndicator.classList.remove("stock-out");
    stockText.textContent = `In Stock (${product.stock} available)`;
  } else {
    stockIndicator.classList.remove("stock-in");
    stockIndicator.classList.add("stock-out");
    stockText.textContent = "Out of Stock";
  }

  // Update description
  document.getElementById("productDescription").textContent =
    product.description;

  // Update category
  document.getElementById("productCategory").textContent = product.category;

  // Update stock
  document.getElementById("productStock").textContent = `${product.stock} units`;

  // Update images
  displayProductImages(product.images);

  // Update add to cart button state
  const addToCartBtn = document.getElementById("addToCartBtn");
  if (product.stock === 0) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "Out of Stock";
  }

  // Update wishlist button
  const wishlistBtn = document.getElementById("wishlistBtn");
  if (wishlist.isInWishlist(product._id)) {
    wishlistBtn.classList.add("active");
  }
}

/**
 * Display product images with thumbnails
 */
function displayProductImages(images) {
  if (!images || images.length === 0) return;

  const mainImage = document.getElementById("mainImage");
  const thumbnailContainer = document.getElementById("thumbnailContainer");

  // Set main image
  mainImage.src = images[0];

  // Create thumbnails
  thumbnailContainer.innerHTML = images
    .map(
      (image, index) => `
    <div class="thumbnail-image ${index === 0 ? "active" : ""}" onclick="changeMainImage('${image}', this)">
      <img src="${image}" alt="Product image ${index + 1}">
    </div>
  `
    )
    .join("");
}

/**
 * Change main image when thumbnail is clicked
 */
window.changeMainImage = function (imageUrl, element) {
  document.getElementById("mainImage").src = imageUrl;
  document.querySelectorAll(".thumbnail-image").forEach((thumb) => {
    thumb.classList.remove("active");
  });
  element.classList.add("active");
};

/**
 * Display related products
 */
function displayRelatedProducts(products) {
  const container = document.getElementById("relatedProductsContainer");

  if (products.length === 0) {
    container.innerHTML = "<p>No related products found</p>";
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
    <div class="related-product-card" onclick="goToProductDetails('${product._id}')">
      <div class="related-product-image">
        <img src="${product.images[0]}" alt="${product.name}">
      </div>
      <div class="related-product-info">
        <h4>${product.name}</h4>
        <div class="related-product-price">${formatPrice(product.price)}</div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Navigate to product details page
 */
window.goToProductDetails = function (productId) {
  window.location.href = `product-details.html?id=${productId}`;
};

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Quantity controls
  const quantityInput = document.getElementById("quantity");
  const increaseBtn = document.getElementById("increaseQty");
  const decreaseBtn = document.getElementById("decreaseQty");

  increaseBtn?.addEventListener("click", () => {
    quantityInput.value = parseInt(quantityInput.value) + 1;
  });

  decreaseBtn?.addEventListener("click", () => {
    if (parseInt(quantityInput.value) > 1) {
      quantityInput.value = parseInt(quantityInput.value) - 1;
    }
  });

  // Add to cart
  const addToCartBtn = document.getElementById("addToCartBtn");
  addToCartBtn?.addEventListener("click", addToCart);

  // Wishlist
  const wishlistBtn = document.getElementById("wishlistBtn");
  wishlistBtn?.addEventListener("click", toggleWishlist);

  // Cart toggle
  const cartToggleBtn = document.getElementById("cartToggleBtn");
  const closeSidebarBtn = document.getElementById("closeSidebarBtn");
  const continueShopping = document.getElementById("continueShopping");
  const overlay = document.getElementById("sidebarOverlay");

  cartToggleBtn?.addEventListener("click", openCartSidebar);
  closeSidebarBtn?.addEventListener("click", closeCartSidebar);
  continueShopping?.addEventListener("click", closeCartSidebar);
  overlay?.addEventListener("click", closeCartSidebar);
}

/**
 * Add product to cart
 */
function addToCart() {
  if (!currentProduct) return;

  if (currentProduct.stock === 0) {
    showMessage("This product is out of stock", "error");
    return;
  }

  const quantity = parseInt(document.getElementById("quantity").value);

  if (quantity > currentProduct.stock) {
    showMessage(
      `Only ${currentProduct.stock} items available`,
      "error"
    );
    return;
  }

  cart.addItem(currentProduct, quantity);
  updateCartUI();

  // Show success message
  const successMsg = document.getElementById("successMessage");
  successMsg.classList.add("show");

  setTimeout(() => {
    successMsg.classList.remove("show");
  }, 3000);

  // Reset quantity
  document.getElementById("quantity").value = 1;
}

/**
 * Toggle wishlist
 */
function toggleWishlist() {
  if (!currentProduct) return;

  const wishlistBtn = document.getElementById("wishlistBtn");

  if (wishlist.isInWishlist(currentProduct._id)) {
    wishlist.removeItem(currentProduct._id);
    wishlistBtn.classList.remove("active");
    showMessage("Removed from wishlist", "info");
  } else {
    wishlist.addItem(currentProduct);
    wishlistBtn.classList.add("active");
    showMessage("Added to wishlist", "success");
  }
}

/**
 * Update cart display
 */
function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.getTotalItems();
    cartCount.textContent = totalItems > 0 ? totalItems : '0';
  }
}

/**
 * Setup cart sidebar subscription
 */
function setupCartSidebar() {
  cart.subscribe(() => {
    updateCartUI();
  });
}

/**
 * Open cart sidebar
 */
function openCartSidebar() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar?.classList.add("open");
  overlay?.classList.add("show");
}

/**
 * Close cart sidebar
 */
function closeCartSidebar() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  sidebar?.classList.remove("open");
  overlay?.classList.remove("show");
}

/**
 * Show error state
 */
function showErrorState(message) {
  const container = document.querySelector(".product-details-container");
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2>Oops! ${message}</h2>
        <p style="margin: 20px 0; color: #666;">The product you're looking for is not available.</p>
        <a href="products.html" style="
          display: inline-block;
          padding: 12px 30px;
          background-color: #f84258;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 700;
        ">Back to Products</a>
      </div>
    `;
  }
}

/**
 * Show message notification
 */
function showMessage(message, type = "info") {
  // Create message element if it doesn't exist
  let messageContainer = document.getElementById("messageContainer");

  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 2000;
      max-width: 300px;
    `;
    document.body.appendChild(messageContainer);
  }

  const messageEl = document.createElement("div");
  messageEl.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: ${
      type === "error"
        ? "#ffcdd2"
        : type === "success"
          ? "#c8e6c9"
          : "#e3f2fd"
    };
    color: ${
      type === "error"
        ? "#c62828"
        : type === "success"
          ? "#2e7d32"
          : "#1565c0"
    };
    border-left: 4px solid ${
      type === "error"
        ? "#c62828"
        : type === "success"
          ? "#2e7d32"
          : "#1565c0"
    };
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  messageEl.textContent = message;
  messageContainer.appendChild(messageEl);

  setTimeout(() => {
    messageEl.remove();
  }, 3000);
}

/**
 * Handle navigation from products page
 */
function navigateToProductDetails(productId) {
  window.location.href = `product-details.html?id=${productId}`;
}
