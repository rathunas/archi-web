// ------------------------------------------------------------
// Archi Web Server — Express App Factory
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express'); // Express web framework
const cors = require('cors');       // Cross‑Origin Resource Sharing
const path = require('path');       // Path utilities

/**
 * Load router modules.
 */
const logList = require('../routers/logList.js');             // List log files
const logShow = require('../routers/logShow.js');             // Show log file

const debugList = require('../routers/debugList.js');         // List debug files
const debugShow = require('../routers/debugShow.js');         // Show debug file
const debugTransfer = require('../routers/debugTransfer.js'); // Transfer debug file
const debugSave = require('../routers/debugSave.js');         // Save debug file
const debugDelete = require('../routers/debugDelete.js');     // Delete debug file

/**
 * Factory function that creates and configures the Express app.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from logManager.js
 * @returns {Express} Configured Express app instance
 */
function createApp(ROOT, serverLog) {

    // Create Express app instance
    const app = express();

    // Allow any origin (safe because no credentials)
    app.use(cors());

    // Serve static files
    app.use('/static', express.static(path.join(__dirname, '..', 'static')));

    // Global no-cache middleware for all endpoints
    app.use((req, res, next) => {

        // Prevent browser caching for all responses
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Continue processing request
        next();
    });

    // Enable JSON body parsing for POST requests
    app.use(express.json());

    // ------------------------------------------------------------
    // Routers
    // ------------------------------------------------------------

    // Mount list log files router
    app.use('/logs', logList(ROOT, serverLog));

    // Mount show log file router
    app.use('/logs/show', logShow(ROOT, serverLog));

    // Mount debug list files router
    app.use('/debug', debugList(ROOT, serverLog));

    // Mount debug show file router
    app.use('/debug/show', debugShow(ROOT, serverLog));

    // Mount debug transfer file router
    app.use('/debug/transfer', debugTransfer(ROOT, serverLog));

    // Mount debug save file router
    app.use('/debug/save', debugSave(ROOT, serverLog));

    // Mount debug delete router
    app.use('/debug/delete', debugDelete(ROOT, serverLog));

    // ------------------------------------------------------------
    // Core Endpoints
    // ------------------------------------------------------------

    // Root endpoint
    app.get('/', (req, res) => {
        serverLog('Root request received', req);
        res.send('Archi Web Server OK');
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        serverLog('Health check request', req);
        res.json({ status: 'OK', time: new Date().toISOString() });
    });

    // Return configured app instance
    return app;
}

// Export factory function
module.exports = createApp;