// constants
// const BACKEND_URL = "https://www.app.21luxuries.com/api";
const BACKEND_URL = "https://www.app.21luxuries.com/api";
let categories = [];
let categoriesLoading = false;
let categoriesByProductsContainer = document.querySelector(".categories-by-products");

// Format price with abbreviations (K, M, etc.)
const formatPrice = (price) => {
  if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(1) + "M";
  } else if (price >= 1_000) {
    return (price / 1_000).toFixed(1) + "K";
  }
  return price.toFixed(2);
};

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/categories`);
    const data = await response.json();
    categories = data;
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Fetch products by category with limit of 6
const fetchProductsByCategory = async (categoryName) => {
  try {
    const response = await fetch(`${BACKEND_URL}/products?category=${categoryName.toLowerCase()}&limit=6&page=1`);
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryName}:`, error);
    return [];
  }
};

// Render loading state
const renderLoading = () => {
  categoriesByProductsContainer.innerHTML = `
    <div class="loader-container">
        <div class="loader"></div>
        <p>Loading categories...</p>
    </div>
  `;
};

// Initialize and render all categories with their products
const initializeCategories = async () => {
  try {
    categoriesLoading = true;
    renderLoading();

    const cats = await fetchCategories();
    let html = '';

    for (const category of cats) {
      const products = await fetchProductsByCategory(category.name);
      
      html += `
        <div class="category-section">
          <center><h2 class="trends-header">+ ${category.name}</h2></center>
          <br><br>
          <div class="category-products-grid">
            ${products.map(product => `
              <a href="products.html?category=${category.name}" class="product-card">
                <div class="product-image-wrapper">
                  <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-card-info">
                  <h4 class="product-name">${product.name}</h4>
                  <span class="product-description">${product.description || 'Explore this item'}</span>
                  <div class="product-card-bottom">
                    <b class="colored-word price">₦${formatPrice(product.price)}</b>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
          <br><br>
        </div>
      `;
    }

    categoriesByProductsContainer.innerHTML = html;
  } catch (error) {
    console.error("Error initializing categories:", error);
    categoriesByProductsContainer.innerHTML = '<p>Error loading categories</p>';
  } finally {
    categoriesLoading = false;
  }
};

// Initialize on page load
initializeCategories();
