// ------------------------------------------------------------
// Archi Web Server
// ------------------------------------------------------------

/**
 * Load configuration and logging modules.
 */
const {
    CONFIG,          // Raw configuration JSON
    ROOT,            // Root folder for server operations
    SERVER_LOG_DIR,  // Daily server log folder
    RETAIN_DAYS,     // Log retention period
    PORT             // Selected port (HTTP or HTTPS)
} = require('./lib/setupConfig');

const { writeLog } = require('./lib/logManager'); // Logging subsystem

/**
 * Load Express app factory + server startup module.
 */
const createApp = require('./lib/createApp');     // Express app setup
const startServer = require('./lib/startServer'); // HTTP/HTTPS startup

// ------------------------------------------------------------
// Express App Creation
// ------------------------------------------------------------

/**
 * Create Express app instance.
 * Pass logging wrapper so routers can log requests.
 */
const app = createApp(ROOT, (msg, req) => writeLog(msg, req, SERVER_LOG_DIR, RETAIN_DAYS));

// ------------------------------------------------------------
// Server Startup (HTTP or HTTPS based on config)
// ------------------------------------------------------------

/**
 * Start server using configuration and logging.
 */
startServer(app, CONFIG, (msg, req) => writeLog(msg, req, SERVER_LOG_DIR, RETAIN_DAYS));