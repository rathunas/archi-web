// ------------------------------------------------------------
// Archi Web Server — Configuration Loader
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const fs = require('fs');     // File system access
const path = require('path'); // Path utilities

/**
 * Path to configuration file.
 */
const CONFIG_PATH = path.join(__dirname, '..', 'server.json');

/**
 * Load configuration JSON.
 */
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Root folder for all Archi server operations.
 */
const ROOT = path.join(__dirname, '..', CONFIG.root);

/**
 * Ensure root folder exists.
 */
fs.mkdirSync(ROOT, { recursive: true });

/**
 * Log folder root.
 */
const LOG_ROOT = path.join(ROOT, 'logs');

/**
 * Server log directory.
 */
const SERVER_LOG_DIR = path.join(LOG_ROOT, 'server');

/**
 * Log retention period (days).
 */
const RETAIN_DAYS = CONFIG.retain_days || 14;

/**
 * HTTPS certificate paths (only used if HTTPS enabled).
 */
const HTTPS_KEY = CONFIG.https_key;
const HTTPS_CERT = CONFIG.https_cert;

/**
 * Server port (HTTP or HTTPS depending on config).
 */
const PORT = CONFIG.use_https ? CONFIG.https_port : CONFIG.http_port;

/**
 * Export configuration values for use by server.js and other modules.
 */
module.exports = {
    CONFIG,          // Raw configuration JSON
    ROOT,            // Root folder for server operations
    LOG_ROOT,        // Base log folder
    SERVER_LOG_DIR,  // Daily server log folder
    RETAIN_DAYS,     // Log retention period
    HTTPS_KEY,       // HTTPS key path
    HTTPS_CERT,      // HTTPS cert path
    PORT             // Selected port (HTTP or HTTPS)
};