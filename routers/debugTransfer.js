// ------------------------------------------------------------
// Express Router for debug transfer
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express');                          // Express router
const { renderTemplate } = require('../lib/renderTemplate'); // HTML template engine

/**
 * Factory function that creates the debug transfer router.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function debugTransfer(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    /**
     * GET /debug/transfer
     * Renders the HTML page for the debug transfer tool.
     */
    router.get('/', (req, res) => {

        // Log that the page was requested
        serverLog('Debug transfer page requested', req);

        // Render HTML using template engine
        const html = renderTemplate('./views/debugTransfer.html', {});

        // Send HTML response
        res.send(html);
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = debugTransfer;