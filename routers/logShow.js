// ------------------------------------------------------------
// Express Router for showing log file contents
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express');                          // Express router
const fs = require('fs');                                    // File system access
const path = require('path');                                // Path utilities
const { renderTemplate } = require('../lib/renderTemplate'); // HTML template engine
const escapeHtml = require('../lib/escapeHtml');             // Escape special characters

/**
 * Factory function that creates the debug log show router.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function logShow(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    // Build the directory where log files are stored
    const LOG_DIR = path.join(ROOT, 'logs', 'server');

    /**
     * GET /logs/show/:file
     * Shows the contents of a log file.
     */
    router.get('/:file', (req, res) => {

        // Extract filename from route parameter
        const filename = req.params.file;

        // Log that the file was requested
        serverLog(`Debug log show requested for file: ${filename}`, req);

        // Build full path to file
        const fullPath = path.join(LOG_DIR, filename);

        // Check file exists
        if (!fs.existsSync(fullPath)) {
            return res.status(404).send('Log file not found');
        }

        // Read file contents
        const contents = fs.readFileSync(fullPath, 'utf8');

        // Escape HTML so raw log text displays safely
        const escaped = escapeHtml(contents);

        // Render HTML using template engine
        const html = renderTemplate('./views/debugShow.html', {
            filename,
            escaped
        });

        // Send HTML response
        res.send(html);
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = logShow;