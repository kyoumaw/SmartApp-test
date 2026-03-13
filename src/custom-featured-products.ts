interface Window {
  Shopify?: {
    routes?: {
      root?: string;
    };
  };
}

interface CartAddResponse {
  description?: string;
  errors?: string | string[];
  message?: string;
  sections?: Record<string, string>;
  status?: number;
}

((): void => {
  const BUTTON_SELECTOR = '.featured-products-custom__add-to-cart';
  const CART_BUBBLE_ID = 'cart-icon-bubble';

  document.addEventListener('click', onDocumentClick);

  async function onDocumentClick(event: MouseEvent): Promise<void> {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest(BUTTON_SELECTOR);
    if (!(button instanceof HTMLButtonElement)) return;
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') return;

    const variantId = getVariantId(button);
    if (!variantId) {
      console.error('Invalid variant id.', button);
      return;
    }

    setButtonLoading(button, true);
    setButtonLabel(button, 'Added');

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

      const cartData = (await response.json()) as CartAddResponse;

      if (!response.ok || cartData.status) {
        throw new Error('Add to cart failed');
      }

      updateCartBubble(cartData);
      setButtonLabel(button, 'Add more');
    } catch (error) {
      setButtonLabel(button, 'Add to Cart');
      console.error(error);
    } finally {
      setButtonLoading(button, false);
    }
  }

  function getVariantId(button: HTMLButtonElement): string | null {
    return button.dataset.variantId ?? null;
  }

  function updateCartBubble(cartData: CartAddResponse): void {
    const currentBubble = document.getElementById(CART_BUBBLE_ID);
    const sectionHtml = cartData.sections?.[CART_BUBBLE_ID];

    if (!currentBubble || !sectionHtml) return;

    const parsed = new DOMParser().parseFromString(sectionHtml, 'text/html');
    const newBubble =
      parsed.getElementById(CART_BUBBLE_ID) ||
      parsed.querySelector<HTMLElement>('.shopify-section');

    if (newBubble) {
      currentBubble.innerHTML = newBubble.innerHTML;
    }
  }

  function setButtonLoading(button: HTMLButtonElement, isLoading: boolean): void {
    button.toggleAttribute('aria-busy', isLoading);

    if (isLoading) {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      return;
    }

    button.disabled = false;
    button.removeAttribute('aria-disabled');
  }

  function setButtonLabel(button: HTMLButtonElement, label: string): void {
    button.textContent = label;
  }

  function getAddToCartUrl(): string {
    return `${window.Shopify?.routes?.root ?? '/'}cart/add.js`;
  }
})();
