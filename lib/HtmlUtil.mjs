/**
 * @module HtmlUtil
 * HTML utilities.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities

// Re-export client side utilities
export * from '../static/util/HtmlUtil.mjs';

/** Error class for HTML bad request. */
export class BadRequestError extends Error { }

/** Error class for HTML resource not found. */
export class NotFoundError extends Error { }

/** Error class for HTML internal server error. */
export class InternalError extends Error { }

/** Cache of HTML templates. @type {Map<string,string>} */
const cache = new Map();

/**
 * Load and render an HTML template with full template‑literal support.
 *
 * @param {string} filePath - path to the HTML file
 * @param {object} data - variables available inside the template
 * @returns {string} rendered HTML
 */
export function render(filePath, data = {}) {

    // Resolve the file path to an absolute path
    const absolutePath = path.resolve(filePath);

    // Load from cache or read from disk
    let template = cache.get(absolutePath);

    // If not cached, read file and store in cache
    if (!template) {
        template = fs.readFileSync(absolutePath, 'utf8');
        cache.set(absolutePath, template);
    }

    // Build a function that evaluates the template literal
    const fn = new Function('data', `with (data) {return \`${template}\`;}`);

    // Execute the function with the provided data
    return fn(data);
}

/**
 * Escape special characters for safe HTML rendering.
 *
 * @param {string} str - raw text content
 * @returns {string} escaped HTML-safe string
 */
export function escape(str) {

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