/**
 * @module ServerUtil
 * Server utilities.
 */

import fs from 'fs'; // File system access
import https from 'https'; // HTTPS server
import path from 'path'; // Path utilities
import { fileURLToPath } from 'url'; // ES-module dirname support
import { log } from './LogUtil.mjs'; // Logging utilities

export * from '../static/util/ServerUtil.mjs'; // Re-export client side server utilities

// ------------------------------------------------------------
// ES‑module __dirname replacement
// ------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to configuration file. */
const CONFIG_PATH = path.join(__dirname, '..', 'server.json');

/**
 * Load raw configuration json.
 *
 * @typedef {Object} ServerOptionsType
 *
 * @property {boolean} use_https - true to enable https (default false)
 * @property {number} [http_port] - port number for http server (default 8080)
 * @property {number} [https_port] - port number for https server (default 443)
 * @property {string} [https_key] - path to https private key file
 * @property {string} [https_cert] - path to https certificate file
 * @property {string} [root] - path to file store directory (default './public')
 * @property {number} [log_days] - number of days to retain log files (default 14)
 * @property {string} archi - path to Archi executable
 * @property {string} [wiki] - Wiki design package page URL prefix
 * @property {string} [master] - Master design package name (default 'MASTER')
 */

/**
 * Raw server configuration options read from `server.json` file.
 * @type {ServerOptionsType}
 */
const options = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/** Root folder for all server operations. */
const rootArg = options.root || 'public';

/** Resolved root folder for all server operations. */
const ROOT = path.isAbsolute(rootArg)
    ? rootArg
    : path.resolve(__dirname, '..', rootArg);

fs.mkdirSync(ROOT, { recursive: true });

/** Server log directory. */
const LOG_DIR = path.join(ROOT, 'log');
fs.mkdirSync(LOG_DIR, { recursive: true });

/** Server log retention period (days). */
const LOG_DAYS = options.log_days || 14;

/** Path to Archi executable. */
const ARCHI = options.archi;

/** Wiki design package page URL prefix. */
const WIKI = options.wiki;

/** Master design package name. */
const MASTER = options.master || 'MASTER';

/** Debug directory. */
const DEBUG_DIR = path.join(ROOT, 'debug');
fs.mkdirSync(DEBUG_DIR, { recursive: true });

/** Queue directory. */
const QUEUE_DIR = path.join(ROOT, 'queue');
fs.mkdirSync(QUEUE_DIR, { recursive: true });

/** Model directory. */
const MODEL_DIR = path.join(ROOT, 'models');
fs.mkdirSync(MODEL_DIR, { recursive: true });

/** True if using HTTPS. */
const USE_HTTPS = options.use_https || false;

/** Path to HTTPS private key file. */
const HTTPS_KEY = options.https_key || './ssl/archi.key';

/** Path to HTTPS certificate file. */
const HTTPS_CERT = options.https_cert || './ssl/archi.crt';

/** HTTP port. */
const HTTP_PORT = options.http_port || 8080;

/** HTTPS port. */
const HTTPS_PORT = options.https_port || 443;

/** Selected port (http or https). */
const PORT = USE_HTTPS ? HTTPS_PORT : HTTP_PORT;

/**
 * Resolved configuration object.
 *
 * @typedef {Object} ConfigOptionsType
 *
 * @property {ServerOptionsType} RAW_OPTIONS - raw configuration options
 * @property {string} ROOT - root folder for server operations
 * @property {string} LOG_DIR - daily server log folder
 * @property {number} LOG_DAYS - server log retention period
 * @property {string} ARCHI - path to Archi executable
 * @property {string|null} WIKI - wiki design package page URL prefix
 * @property {string} MASTER - master design package name
 * @property {string} DEBUG_DIR - debug directory
 * @property {string} QUEUE_DIR - queue directory
 * @property {string} MODEL_DIR - model directory
 * @property {number} HTTP_PORT - http port
 * @property {number} HTTPS_PORT - https port
 * @property {boolean} USE_HTTPS - true if using https
 * @property {string} HTTPS_KEY - https private key path
 * @property {string} HTTPS_CERT - https certificate path
 * @property {number} PORT - selected port
 */
export const config = {
    RAW_OPTIONS: options,
    ROOT,
    LOG_DIR,
    LOG_DAYS,
    ARCHI,
    WIKI,
    MASTER,
    DEBUG_DIR,
    QUEUE_DIR,
    MODEL_DIR,
    HTTP_PORT,
    HTTPS_PORT,
    USE_HTTPS,
    HTTPS_KEY,
    HTTPS_CERT,
    PORT
};

// ------------------------------------------------------------
// Server Startup (HTTP or HTTPS)
// ------------------------------------------------------------

/**
 * Start the HTTP or HTTPS server depending on configuration.
 *
 * @param {Express} app - configured express app instance
 */
export function start(app) {

    // HTTPS mode
    if (config.USE_HTTPS) {

        // Load HTTPS key and certificate
        const httpsOptions = {
            key: fs.readFileSync(config.HTTPS_KEY),
            cert: fs.readFileSync(config.HTTPS_CERT)
        };

        // Create HTTPS server instance
        const httpsServer = https.createServer(httpsOptions, app);

        // Start HTTPS server
        httpsServer.listen(config.PORT, () => {
            log('HTTPS server running on port ' + config.PORT.toString(10));
        });

        return;
    }

    // HTTP mode
    app.listen(config.PORT, () => {
        log('HTTP server running on port ' + config.PORT.toString(10));
    });
}