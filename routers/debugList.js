// ------------------------------------------------------------
// Express Router for listing debug files
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express');                          // Express router
const fs = require('fs');                                    // File system access
const path = require('path');                                // Path utilities
const { renderTemplate } = require('../lib/renderTemplate'); // HTML template engine

/**
 * Factory function that creates the debug list router.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function debugList(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    // Build the directory where debug files are stored
    const DEBUG_DIR = path.join(ROOT, 'debug');

    /**
     * GET /debug/list
     * Lists all files in the debug directory.
     */
    router.get('/', (req, res) => {

        // Log that the list page was requested
        serverLog('Debug list requested', req);

        // Ensure directory exists (create if missing)
        fs.mkdirSync(DEBUG_DIR, { recursive: true });

        // Read all files in the debug directory
        const files = fs.readdirSync(DEBUG_DIR);

        // Render HTML using template engine
        const html = renderTemplate('./views/debugList.html', { files });

        // Send HTML response
        res.send(html);
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = debugList;