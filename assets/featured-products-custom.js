const BUTTON_SELECTOR = '.featured-products-custom__add-to-cart';
const CART_BUBBLE_ID = 'cart-icon-bubble';

document.addEventListener('click', onDocumentClick);

async function onDocumentClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(BUTTON_SELECTOR);
  if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;

  const variantId = getVariantId(button);
  if (!variantId) {
    console.error('Invalid variant id.', button);
    return;
  }

  try {
    const response = await fetch(getAddToCartUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ id: variantId, quantity: 1 }],
        sections: CART_BUBBLE_ID,
        sections_url: window.location.pathname,
      }),
    });

    const cartData = await response.json();

    if (!response.ok || cartData.status) {
      throw new Error(cartData.description || cartData.errors || cartData.message || 'Add to cart failed');
    }
  } catch (error) {
    console.error(error);
  }
}

function getVariantId(button) {
  return button.dataset.variantId;
}

function getAddToCartUrl() {
  return window.Shopify?.routes?.root + 'cart/add.js';
}
