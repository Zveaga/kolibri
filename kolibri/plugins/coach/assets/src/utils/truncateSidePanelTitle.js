/**
 * Returns max number of characters allowed based on the provided window width.
 *
 * @param {number} windowWidth - The current window width
 * @returns {number} The maximum allowed characters
 */
export function getMaxLengthByWidth(windowWidth) {
  if (windowWidth <= 350) return 21;
  if (windowWidth <= 450) return 25;
  if (windowWidth <= 600) return 38;
  if (windowWidth < 700) return 50;
  // For width >= 700
  return 60;
}

/**
 * Returns a truncated version of the given text based on the window width.
 *
 * @param {string} text - The text to be truncated
 * @param {number} windowWidth - The current window width
 * @param {boolean} hasIconButton - Determines if extra characters can be displayed
 * @returns {string} The truncated text with an ellipsis if it exceeds the max length
 */
export function truncateSidePanelTitle(text, windowWidth, hasIconButton = true) {
  if (!text) return '';
  const baseMaxLength = getMaxLengthByWidth(windowWidth);
  // If side panel icon button is not present, more of the title can be displayed
  const maxLength = hasIconButton ? baseMaxLength : baseMaxLength + 5;
  if (text.length > maxLength) {
    const truncated = text.slice(0, maxLength);
    // Add closing quotation mark if the truncated text includes one
    return truncated.includes("'") ? `${truncated}...'` : `${truncated}...`;
  }
  return text;
}
