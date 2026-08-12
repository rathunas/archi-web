// ------------------------------------------------------------
// Archi Web Server — HTML Escape Helper
// ------------------------------------------------------------

/**
 * Escapes special characters for safe HTML rendering.
 *
 * @param {string} str - raw text content
 * @returns {string} escaped HTML-safe string
 */
function escapeHtml(str) {

    // Return empty string for null/undefined
    if (!str) return '';

    // Replace characters with HTML-safe equivalents
    return str
        .replace(/&/g, '&amp;')   // Ampersand
        .replace(/</g, '&lt;')    // Less-than
        .replace(/>/g, '&gt;')    // Greater-than
        .replace(/"/g, '&quot;')  // Double quote
        .replace(/'/g, '&#39;');  // Single quote
}

// Export helper
module.exports = escapeHtml;