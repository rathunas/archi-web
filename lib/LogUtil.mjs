/**
 * @module LogUtil
 * Log file utilities.
 */

import fs from 'fs'; // File system access
import http from 'http'; // HTTP utilities
import path from 'path'; // Path utilities
import { InvalidPathSegment } from '../lib/FileUtil.mjs';
import { config } from './ServerUtil.mjs'; // Server utilities

// Re-export client side utilities
export * from '../static/util/LogUtil.mjs';

/**
 * Determine if value is a Node or Express request object.
 *
 * @param {*} obj - unknown value to test
 * @returns {obj is import('express').Request} boolean indicating if value is request-like
 */
export function isRequestLike(obj) {

    // Return true if obj is non-null object
    return (

        // Return true if obj is object
        obj && typeof obj === 'object' &&

        // Return true if obj is IncomingMessage (Express extends this)
        obj instanceof http.IncomingMessage &&

        // Return true if obj has HTTP method
        typeof obj.method === 'string' &&

        // Return true if obj has Express originalUrl or Node url
        (typeof obj.originalUrl === 'string' || typeof obj.url === 'string')
    );
}

/**
 * Write log function.
 *
 * @typedef {function(string, object|null):void} Logger
 */

/**
 * Create a new logger instance.
 *
 * @param {string} logDir - directory where log are stored
 * @param {number} retainDays - retention period (days)
 * @returns {{ writeLog: Logger }} logger instance
 */
export function createLogger(logDir, retainDays) {

    // Current log in unix timestamp number truncated to day
    let activeLogDate = null;

    // Current write stream
    let activeLogStream = null;

    /**
     * Open a new daily log file.
     *
     * @param {string} currentDate - date string YYYY-MM-DD
     */
    function openDailyLog(currentDate) {

        // Build log file path
        const logPath = path.join(logDir, `${currentDate}.log`);

        // Close previous stream if present
        if (activeLogStream) {
            activeLogStream.end();
        }

        // Ensure directory exists
        fs.mkdirSync(logDir, { recursive: true });

        // Create new write stream
        activeLogStream = fs.createWriteStream(logPath, { flags: 'a' });

        // Update active log date
        activeLogDate = currentDate;
    }

    /**
     * Delete old logs beyond retention period.
     */
    function deleteOldLogs() {

        // Skip if directory missing
        if (!fs.existsSync(logDir)) return;

        // Compute cutoff date
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - retainDays);

        // Read directory
        const files = fs.readdirSync(logDir);

        // Loop through log files
        for (const file of files) {

            // Skip non-log files
            if (!file.endsWith('.log')) continue;

            // Extract date portion from filename (YYYY-MM-DD)
            const datePart = file.replace('.log', '');
            const fileDate = new Date(datePart);

            // Delete file if older than retention cutoff
            if (fileDate < cutoff) {
                fs.rmSync(path.join(logDir, file), { force: true });
            }
        }
    }

    /**
     * Write a JSON log entry.
     * Log entry time is UTC not local time.
     *
     * @param {string|import('express').Request|object} value - message or express request or object
     */
    function writeLog(value) {

        // Get current date (YYYY-MM-DD)
        const today = new Date().toISOString().slice(0, 10);

        // Check if log file changed (new day)
        if (today !== activeLogDate) {

            // Perform retention cleanup
            deleteOldLogs();

            // Open new daily log file
            openDailyLog(today);
        }

        // Build log entry
        let entry = {

            // Current UTC timestamp as ISO string
            time: new Date().toISOString()
        };

        // Check if value is a string
        if (typeof value === 'string') {

            // Log message
            entry.message = value;
        }

        // Or check if value is like express request
        else if (isRequestLike(value)) {

            // Log express request
            entry.method = value.method;
            entry.endpoint = value.originalUrl || value.url;
            entry.ip = value.ip;
        }

        // Else value is object
        else {

            // Log the value object
            entry = {
                ...entry,
                ...value
            };
        }

        // Write log entry followed by newline
        activeLogStream.write(JSON.stringify(entry) + '\n');
    }

    // Return logger instance
    return { writeLog };
}

/**
 * Create server log instance.
 */
const serverLogger = createLogger(
    config.LOG_DIR,
    config.LOG_DAYS
);

/**
 * Write a message to the server log.
 *
 * @@param {string|import('express').Request|object} value - message or express request or object
 */
export function log(value) {

    // Write to server log
    serverLogger.writeLog(value);
}

/** Regex enforces numeric year, month 01-12, day 01-31 */
export const LOG_FILE_FORMAT = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\.log$/;

/**
 * Determine if a filesystem entry is a server log file.
 * 
 * @param {import('../lib/FileUtil.mjs').FileSystemEntry} entry - the filesystem entry metadata
 * @returns {boolean} true if the entry name matches the server log file format, otherwise false
 */
export function isLogFile(entry) {

    // Return true if entry is a regular file and name matches server log format
    return (entry.isFile && LOG_FILE_FORMAT.test(entry.name));
}

/**
 * Validate a server log filename.
 *
 * A server log filename must be a valid path segment and must not allow drive letters.
 *
 * @param {any} filename - the server logfile to validate
 * @returns {string} validated package name
 *
 * @throws TypeError if value is not a string
 * @throws RangeError if value is empty or contains invalid characters
 */
export function validateLogFilename(filename) {

    // Reject if filename not a string
    if (typeof filename !== 'string') {
        throw new InvalidPathSegment(`Filename must be a string: ${JSON.stringify(filename)}`);
    }

    // Return filename if valid
    if (LOG_FILE_FORMAT.test(filename)) return filename;

    // Else throw error
    throw new InvalidPathSegment(`Server log filename contains illegal characters: "${filename}"`);
}