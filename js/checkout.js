/**
 * Checkout & Order Management System
 * Handles checkout form, order submission, and confirmation
 */

// Configuration
const CHECKOUT_CONFIG = {
  API_BASE_URL: 'https://app.21luxuries.com/api',
  WHATSAPP_NUMBER: '2349019176161',
  TRACKING_BASE_URL: "https://app.21luxuries.com" + '/order/', // Will be appended with order ID
};

/**
 * Initialize checkout system
 */
document.addEventListener('DOMContentLoaded', () => {
  setupCheckoutEventListeners();
});

/**
 * Setup all checkout event listeners
 */
function setupCheckoutEventListeners() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
  const checkoutForm = document.getElementById('checkoutForm');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const checkoutModal = document.getElementById('checkoutModal');

  // Open checkout modal
  checkoutBtn?.addEventListener('click', () => {
    const cartItems = cart.getItems();
    if (cartItems.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }
    openCheckoutModal();
  });

  // Close checkout modal
  closeCheckoutBtn?.addEventListener('click', closeCheckoutModal);
  cancelCheckoutBtn?.addEventListener('click', closeCheckoutModal);
  modalBackdrop?.addEventListener('click', closeCheckoutModal);

  // Prevent modal close when clicking inside the form
  checkoutModal?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Form submission
  checkoutForm?.addEventListener('submit', handleCheckoutSubmit);

  // Setup confirmation modal listeners
  setupConfirmationModalListeners();
}

/**
 * Open checkout modal
 */
function openCheckoutModal() {
  const checkoutModal = document.getElementById('checkoutModal');
  const modalBackdrop = document.getElementById('modalBackdrop');

  // Populate order preview
  updateCheckoutPreview();

  // Show modals
  checkoutModal.style.display = 'flex';
  modalBackdrop.style.display = 'block';

  // Lock body scroll
  document.body.style.overflow = 'hidden';

  // Focus on first input
  setTimeout(() => {
    const firstInput = document.getElementById('fullName');
    firstInput?.focus();
  }, 100);
}

/**
 * Close checkout modal
 */
function closeCheckoutModal() {
  const checkoutModal = document.getElementById('checkoutModal');
  const modalBackdrop = document.getElementById('modalBackdrop');

  checkoutModal.style.display = 'none';
  modalBackdrop.style.display = 'none';

  // Restore body scroll
  document.body.style.overflow = '';

  // Clear any error messages
  clearFormErrors();
}

/**
 * Update checkout preview with current cart values
 */
function updateCheckoutPreview() {
  const subtotal = cart.getTotalPrice();
  const tax = Math.floor(subtotal * 0.1);
  const shipping = subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + tax + shipping;

  document.getElementById('previewSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('previewTax').textContent = formatPrice(tax);
  document.getElementById('previewShipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('previewTotal').textContent = formatPrice(total);
}

/**
 * Validate checkout form
 */
function validateCheckoutForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  const errors = {};

  // Validate full name
  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else if (fullName.length < 3) {
    errors.fullName = 'Full name must be at least 3 characters';
  }

  // Validate email (optional but if provided, must be valid)
  if (email && !isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Validate phone
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Show errors
  clearFormErrors();
  if (Object.keys(errors).length > 0) {
    for (const [field, message] of Object.entries(errors)) {
      showFieldError(field, message);
    }
    return false;
  }

  return true;
}

/**
 * Show field error
 */
function showFieldError(fieldName, message) {
  const errorElement = document.getElementById(`${fieldName}Error`);
  const inputElement = document.getElementById(fieldName);

  if (errorElement) {
    errorElement.textContent = message;
  }
  if (inputElement) {
    inputElement.parentElement.classList.add('error');
  }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  const formGroups = document.querySelectorAll('.form-group.error');

  errorElements.forEach(el => el.textContent = '');
  formGroups.forEach(group => group.classList.remove('error'));
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic validation)
 */
function isValidPhone(phone) {
  // Accept phone numbers with at least 10 digits (with or without formatting)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Handle checkout form submission
 */
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  // Validate form
  if (!validateCheckoutForm()) {
    showNotification('Please fix the errors above', 'error');
    return;
  }

  // Get form data
  const formData = new FormData(document.getElementById('checkoutForm'));
  const orderData = {
    name: formData.get('name'),
    email: formData.get('email') || undefined,
    phone: formData.get('phone'),
    address: formData.get('address') || undefined,
    notes: formData.get('notes') || undefined,
    products: cart.getItems().map(item => ({
      productId: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    })),
    totalPrice: cart.getTotalPrice() + Math.floor(cart.getTotalPrice() * 0.1),
    status: 'pending'
  };

  // Show loading state
  const submitBtn = document.getElementById('submitCheckoutBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'flex';

  try {
    // Submit order to backend
    const response = await fetch(`${CHECKOUT_CONFIG.API_BASE_URL}/dashboard/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const result = await response.json();
    // console.log("Result", result);
    const orderId = result._id;

    // Clear cart
    cart.clearCart();

    // Close checkout modal
    closeCheckoutModal();

    // Show confirmation modal
    showOrderConfirmation(orderId);

  } catch (error) {
    console.error('Error creating order:', error);
    showNotification('Failed to create order. Please try again.', 'error');
  } finally {
    // Reset loading state
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

/**
 * Show order confirmation modal
 */
function showOrderConfirmation(orderId) {
  const trackingLink = `${CHECKOUT_CONFIG.TRACKING_BASE_URL}${orderId}`;

  // Populate confirmation data
  document.getElementById('orderIdDisplay').value = orderId;
  document.getElementById('trackingLinkDisplay').value = trackingLink;

  // Show modal
  const confirmationModal = document.getElementById('orderConfirmationModal');
  const modalBackdrop = document.getElementById('modalBackdrop');

  confirmationModal.style.display = 'flex';
  modalBackdrop.style.display = 'block';

  // Lock body scroll
  document.body.style.overflow = 'hidden';

  // Setup copy buttons
  setupCopyButtons(orderId, trackingLink);

  // Setup action buttons
  setupConfirmationActions(orderId);
}

/**
 * Setup copy to clipboard buttons
 */
function setupCopyButtons(orderId, trackingLink) {
  const copyOrderIdBtn = document.getElementById('copyOrderIdBtn');
  const copyTrackingLinkBtn = document.getElementById('copyTrackingLinkBtn');

  copyOrderIdBtn?.removeEventListener('click', copyOrderIdBtn.handler);
  copyTrackingLinkBtn?.removeEventListener('click', copyTrackingLinkBtn.handler);

  // Copy Order ID
  const copyOrderHandler = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      showCopyFeedback(copyOrderIdBtn, 'Copied!');
    } catch (error) {
      console.error('Failed to copy:', error);
      showNotification('Failed to copy', 'error');
    }
  };

  // Copy Tracking Link
  const copyLinkHandler = async () => {
    try {
      await navigator.clipboard.writeText(trackingLink);
      showCopyFeedback(copyTrackingLinkBtn, 'Copied!');
    } catch (error) {
      console.error('Failed to copy:', error);
      showNotification('Failed to copy', 'error');
    }
  };

  copyOrderIdBtn.handler = copyOrderHandler;
  copyTrackingLinkBtn.handler = copyLinkHandler;

  copyOrderIdBtn?.addEventListener('click', copyOrderHandler);
  copyTrackingLinkBtn?.addEventListener('click', copyLinkHandler);
}

/**
 * Show copy feedback
 */
function showCopyFeedback(button, message) {
  const originalIcon = button.innerHTML;
  button.classList.add('copied');
  button.setAttribute('title', message);

  setTimeout(() => {
    button.classList.remove('copied');
    button.setAttribute('title', 'Copy');
  }, 2000);
}

/**
 * Setup confirmation modal action buttons
 */
function setupConfirmationActions(orderId) {
  const whatsappBtn = document.getElementById('whatsappBtn');
  const continueBrowsingBtn = document.getElementById('continueBrowsingAfterOrderBtn');
  const viewDetailsBtn = document.getElementById('viewOrderDetailsBtn');

  // WhatsApp button
  whatsappBtn?.removeEventListener('click', whatsappBtn.handler);
  const whatsappHandler = () => {
    sendToWhatsApp(orderId);
  };
  whatsappBtn.handler = whatsappHandler;
  whatsappBtn?.addEventListener('click', whatsappHandler);

  // Continue shopping
  continueBrowsingBtn?.removeEventListener('click', continueBrowsingBtn.handler);
  const continueBrowsingHandler = () => {
    closeAllModals();
    window.location.href = 'products.html';
  };
  continueBrowsingBtn.handler = continueBrowsingHandler;
  continueBrowsingBtn?.addEventListener('click', continueBrowsingHandler);

  // View order details (placeholder - can link to order tracking page)
  viewDetailsBtn?.removeEventListener('click', viewDetailsBtn.handler);
  const viewDetailsHandler = () => {
    const trackingLink = document.getElementById('trackingLinkDisplay').value;
    window.open(trackingLink, '_blank');
  };
  viewDetailsBtn.handler = viewDetailsHandler;
  viewDetailsBtn?.addEventListener('click', viewDetailsHandler);
}

/**
 * Send order to WhatsApp
 */
function sendToWhatsApp(orderId) {
  const phone = CHECKOUT_CONFIG.WHATSAPP_NUMBER;
  const message = encodeURIComponent(
    `Hi! I just placed an order with Order ID: ${orderId}\nPlease assist me with my order tracking.`
  );

  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Setup confirmation modal listeners
 */
function setupConfirmationModalListeners() {
  // Close confirmation modal when clicking backdrop
  const modalBackdrop = document.getElementById('modalBackdrop');
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeAllModals();
    }
  });
}

/**
 * Close all modals
 */
function closeAllModals() {
  const checkoutModal = document.getElementById('checkoutModal');
  const confirmationModal = document.getElementById('orderConfirmationModal');
  const modalBackdrop = document.getElementById('modalBackdrop');

  checkoutModal.style.display = 'none';
  confirmationModal.style.display = 'none';
  modalBackdrop.style.display = 'none';

  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  let container = document.getElementById('notificationContainer');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 11000;
      max-width: 350px;
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
    padding: 14px 16px;
    margin-bottom: 10px;
    border-radius: 6px;
    background-color: ${bgColor[type]};
    color: ${textColor[type]};
    border-left: 4px solid ${borderColor[type]};
    font-weight: 500;
    font-size: 14px;
    animation: slideIn 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `;

  notification.textContent = message;
  container.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3500);
}
