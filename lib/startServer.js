// ------------------------------------------------------------
// Archi Web Server — Startup (HTTP or HTTPS)
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const fs = require('fs');     // File system access
const https = require('https'); // HTTPS server

/**
 * Starts the HTTP or HTTPS server depending on configuration.
 *
 * @param {Express} app - Configured Express app instance
 * @param {object} CONFIG - Loaded configuration JSON
 * @param {function} serverLog - Logging function from logManager.js
 */
function startServer(app, CONFIG, serverLog) {

    // Determine port (HTTP or HTTPS)
    const PORT = CONFIG.use_https ? CONFIG.https_port : CONFIG.http_port;

    // ------------------------------------------------------------
    // HTTPS Mode
    // ------------------------------------------------------------
    if (CONFIG.use_https) {

        // Load HTTPS certificate + key
        const httpsOptions = {
            key: fs.readFileSync(CONFIG.https_key),
            cert: fs.readFileSync(CONFIG.https_cert)
        };

        // Create HTTPS server instance
        const httpsServer = https.createServer(httpsOptions, app);

        // Start HTTPS server
        httpsServer.listen(PORT, () => {
            serverLog('HTTPS server running on port ' + PORT.toString(10));
        });

        return; // Exit early
    }

    // ------------------------------------------------------------
    // HTTP Mode
    // ------------------------------------------------------------

    // Start HTTP server instead of HTTPS
    app.listen(PORT, () => {
        serverLog('HTTP server running on port ' + PORT.toString(10));
    });
}

// Export startup function
module.exports = startServer;