// ------------------------------------------------------------
// Express Router for listing log files
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express');                          // Express router
const fs = require('fs');                                    // File system access
const path = require('path');                                // Path utilities
const { renderTemplate } = require('../lib/renderTemplate'); // HTML template engine

/**
 * Factory function that creates the log list router.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function logList(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    // Build the directory where log files are stored
    const LOG_DIR = path.join(ROOT, 'logs', 'server');

    /**
     * GET /logs
     * Lists all log files in the logs directory.
     */
    router.get('/', (req, res) => {

        // Log that the logs page was requested
        serverLog('Log list requested', req);

        // Read all files in the logs directory
        const files = fs.readdirSync(LOG_DIR);

        // Render HTML using template engine
        const html = renderTemplate('./views/logList.html', { files });

        // Send HTML response
        res.send(html);
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = logList;
