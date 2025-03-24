import { nextTick } from 'vue';

/*
 * Checks if the element is focusable.
 * @param {HTMLElement} el - The element to check.
 * @returns {boolean} - True if the element is focusable, false otherwise.
 */
function isFocusable(el) {
  if (el.tabIndex < 0) {
    return false;
  }
  if (el.offsetParent === null && window.getComputedStyle(el).position !== 'fixed') {
    // If the element or any of its ancestors is set display none,
    // it will have offsetParent set to null.
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    return false;
  }
  switch (el.tagName) {
    case 'A':
      return !!el.href;
    case 'INPUT':
      return el.type !== 'hidden' && !el.disabled;
    case 'SELECT':
    case 'TEXTAREA':
    case 'BUTTON':
      return !el.disabled;
    default:
      return false;
  }
}

function getFirstFocusableElement(el) {
  if (!el) return null;

  const focusableSelectors = ['button', 'a', 'input', 'select', 'textarea'];
  return Array.from(el.querySelectorAll(focusableSelectors.join(','))).find(isFocusable);
}

export default {
  async inserted(el) {
    // Some KDS components like KBreadcrumbs needs at least 2 ticks to be properly rendered
    await nextTick();
    await nextTick();
    await nextTick();
    const firstFocusableElement = getFirstFocusableElement(el);
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }
  },
};
