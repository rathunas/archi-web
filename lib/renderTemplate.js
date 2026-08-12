const fs = require('fs');
const path = require('path');

// Simple in‑memory cache so templates aren't re-read every request
const cache = new Map();

/**
 * Load and render an HTML template with full template‑literal support.
 *
 * @param {string} filePath - Path to the HTML file.
 * @param {object} data - Variables available inside the template.
 * @returns {string} Rendered HTML.
 */
function renderTemplate(filePath, data = {}) {

  // Todo: Resolve the file path to an absolute path
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

// Export the factory function
module.exports = { renderTemplate };