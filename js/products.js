// constants
// const BACKEND_URL = "https://21-luxuries.vercel.app/api";
const BACKEND_URL = "http://localhost:3000/api";
let productLoading = false;
let products = [];
let categories = [];
let productsCategory = "all";
let pagination = {
  hasNext: false,
  hasPrev: false,
  limit: 10,
  page: 1,
  pages: 1,
  total: 1,
};

var ul = document.getElementById("ul_pr");
var li = document.querySelectorAll("li");
let productMainPage = document.querySelector(".products-main");

// Format price with abbreviations (K, M, etc.)
// const formatPrice = (price) => {
//   if (price >= 1_000_000) {
//     return (price / 1_000_000).toFixed(1) + "M";
//   } else if (price >= 1_000) {
//     return (price / 1_000).toFixed(1) + "K";
//   }
//   return price.toFixed(2);
// };

function add(id){
    var li_new = document.createElement("li");
    var li_inp = document.createTextNode(id);
    li_new.appendChild(li_inp);
    ul.appendChild(li_new);
    ul.appendChild(document.createElement("br"));
}

window.emptyList = function () {
    var ul = document.querySelector('#ul_pr');
    var listLength = ul.children.length;
  
    for (i = 0; i < listLength; i++) {
      ul.removeChild(ul.children[0]);
    }
}

// Add event listener for product clicks and add to cart
window.addEventListener('DOMContentLoaded', () => {
  setupProductEventListeners();
  setupCartUI();
});

function setupProductEventListeners() {
  document.addEventListener('click', (e) => {
    const product = e.target.closest('.product');
    const addBtn = e.target.closest('.add-to-cart-btn');

    if (product && !addBtn) {
      const productId = product.id;
      window.location.href = `product-details.html?id=${productId}`;
    } else if (addBtn) {
      e.stopPropagation();
      const product = addBtn.closest('.product');
      const productId = product.id;
      const productData = products.find(p => p._id === productId);
      if (productData) {
        cart.addItem(productData, 1);
        showAddToCartMessage();
      }
    }
  });
}

function showAddToCartMessage() {
  let messageContainer = document.getElementById('messageContainer');
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'messageContainer';
    messageContainer.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 2000;
      max-width: 300px;
    `;
    document.body.appendChild(messageContainer);
  }

  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #c8e6c9;
    color: #2e7d32;
    border-left: 4px solid #2e7d32;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  messageEl.textContent = 'Added to cart!';
  messageContainer.appendChild(messageEl);

  setTimeout(() => {
    messageEl.remove();
  }, 2000);
}

function setupCartUI() {
  // Create cart toggle button if it doesn't exist
  if (!document.getElementById('cartToggleBtn')) {
    const cartBtn = document.createElement('button');
    cartBtn.id = 'cartToggleBtn';
    cartBtn.className = 'cart-toggle-btn';
    cartBtn.innerHTML = '🛒 <span id="cartCount">0</span>';
    cartBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      background-color: #f84258;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(248, 66, 88, 0.3);
      transition: all 0.3s ease;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    `;
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
    document.body.appendChild(cartBtn);
  }

  // Subscribe to cart updates to show count
  cart.subscribe(() => {
    updateCartCount();
  });
  
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const totalItems = cart.getTotalItems();
    cartCount.textContent = totalItems > 0 ? totalItems : '0';
  }
}

// Update URL with query params
const updateURL = () => {
  const params = new URLSearchParams();
  if (productsCategory !== "all") params.set("category", productsCategory);
  if (pagination.page > 1) params.set("page", pagination.page);
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
};

// Get URL params on load
const getURLParams = () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const page = params.get("page");
  
  if (category) productsCategory = category;
  if (page) pagination.page = parseInt(page);
};

// render products
const renderProducts = () => {
  if (productLoading) {
    productMainPage.innerHTML = `
      <div class="loader-container">
          <div class="loader"></div>
          <p>Loading products...</p>
      </div>
    `;
  } else {
    productMainPage.innerHTML = `
      <div class="product-set-header">
        <div class="sub-product-title">
          <h3 class="head-of-products">Showing <span class="colored-word">${products.length}</span> of <span class="colored-word">${pagination.total}</span> Products</h3>
        </div>
        <select name="category" id="category" class="product-category" onchange="filterCategory(this.value)" value="${productsCategory}">
          <option value="all" ${productsCategory === "all" ? 'selected' : ''}>All Categories</option>
          ${categories?.map(category => `
            <option value="${category.name}" ${productsCategory === category.name ? 'selected' : ''}>${category.name}</option>
          `).join('')}
        </select>
      </div>
    
      <div class="product-container">
        ${products.map(product => `
          <div key="${product._id}" class="product" id="${product._id}">
            <img src="${product.images[0]}" alt="">
            <h4>${product.name}</h4>
            <span>${product.description}</span>
            <div class="product-card-bottom">
              <b class="colored-word price">${formatPrice(product.price)}</b>
              <button class="add-to-cart-btn">Add to Cart</button>
            </div>
          </div>
          `)}
      </div>

      <div class="page-navigator">
        <button ${pagination.page === 1 || !pagination.hasPrev ? 'disabled' : ''} onclick="prevPage()">&leftarrow; Prev</button>
        <div class="number-show">
          <span class="active">${pagination.page}</span>
          <span>of</span>
          <span>${pagination.pages}</span>
        </div>
        <button ${pagination.page === pagination.pages || !pagination.hasNext ? 'disabled' : ''} onclick="nextPage()">&rightarrow; Next</button>
      </div>

      <h4 class="sry-msg">Uh-Oh! We are<span class="colored-word"> done</span>🛒</h4>
      <center><hr class="last-hr-of-product"></center>
      <br><br>

      <div class="cart-details">
        <h2 class="head-of-cart">Your Cart</h2>
          <hr class="hr-of-cart-head">
          <br>
        <ul id="ul_pr">
          
        </ul>
      <button class="btn-clear-list" onclick="emptyList()"> <span class="colored-word"> Clear My List</span></button> <br>
        <small>Can't see anything? Click & add your favorite fashion in
        <span class="colored-word"> Shopping List!</span> </small>
      </div>
      <br><br><br>
    `;
  }
};

// fetch products with callback
const fetchProducts = async () => {
  try {
    productLoading = true;
    renderProducts();
    const response = await fetch(`${BACKEND_URL}/products?category=${productsCategory.toString().toLowerCase()}&page=${pagination.page}&limit=${pagination.limit}`);
    const data = await response.json();
    products = data.products;
    pagination = data.pagination;
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    productLoading = false;
    renderProducts();
    updateURL();
  }
};

const fetchCategories = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/categories`);
    const data = await response.json();
    categories = data;
  } catch (error) {
    console.log("Error fetching categories");
  }
}

const nextPage = () => {
  if (pagination.hasNext) {
      pagination.page += 1;
      fetchProducts();
  }
}

const prevPage = () => {
  if (pagination.hasPrev) {
      pagination.page -= 1;
      fetchProducts();
  }
}

const filterCategory = (categoryId) => {
  productsCategory = categoryId;
  pagination.page = 1;
  fetchProducts();
}

getURLParams();
fetchProducts();
fetchCategories();
