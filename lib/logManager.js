// ------------------------------------------------------------
// Archi Web Server — Log Manager (Daily Rotation + Retention)
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const fs = require('fs');     // File system access
const path = require('path'); // Path utilities

/**
 * Log manager state.
 */
let activeLogDate = null;     // Current log date (YYYY-MM-DD)
let activeLogStream = null;   // Current write stream

/**
 * Opens a new daily log file.
 *
 * @param {string} dir - Log directory path
 * @param {string} currentDate - Date string YYYY-MM-DD
 * @param {fs.WriteStream|null} currentStream - Existing stream
 * @returns {fs.WriteStream} New write stream
 */
function openDailyLog(dir, currentDate, currentStream) {

    // Build log file path
    const logPath = path.join(dir, `${currentDate}.log`);

    // Close previous stream if present
    if (currentStream) {
        currentStream.end(); // Close previous log file stream
    }

    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    // Create new write stream
    const stream = fs.createWriteStream(logPath, { flags: 'a' });

    // Return new stream
    return stream;
}

/**
 * Deletes old logs beyond retention period.
 *
 * @param {string} dir - Log directory path
 * @param {number} retainDays - Number of days to keep
 */
function deleteOldLogs(dir, retainDays) {

    // Skip if directory missing
    if (!fs.existsSync(dir)) return;

    // Compute cutoff date
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retainDays);

    // Read directory
    const files = fs.readdirSync(dir);

    // Loop through log files
    for (const file of files) {

        // Skip non-log files
        if (!file.endsWith('.log')) continue;

        // Extract date portion from filename (YYYY-MM-DD)
        const datePart = file.replace('.log', '');
        const fileDate = new Date(datePart);

        // Delete file if older than retention cutoff
        if (fileDate < cutoff) {
            fs.rmSync(path.join(dir, file), { force: true });
        }
    }
}

/**
 * Returns an ISO timestamp in the server's local timezone.
 *
 * @returns {string} Local ISO timestamp without trailing Z
 */
function getLocalIsoTimestamp() {

    const now = new Date();

    // Convert UTC → local server time by applying timezone offset
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Produce ISO string without the trailing Z (because it's not UTC)
    return local.toISOString();
}

/**
 * Writes a JSON log entry.
 *
 * @param {string} msg - Log message
 * @param {object|null} req - Optional request object for endpoint logging
 * @param {string} logDir - Directory where logs are stored
 * @param {number} retainDays - Retention period (days)
 */
function writeLog(msg, req, logDir, retainDays) {

    // Get current date (local server date)
    const today = getLocalIsoTimestamp().slice(0, 10);

    // Check if log file changed (new day)
    if (today !== activeLogDate) {

        // Perform retention cleanup before opening new log file
        deleteOldLogs(logDir, retainDays);

        // Open new daily log file
        activeLogStream = openDailyLog(logDir, today, activeLogStream);

        // Update active log date
        activeLogDate = today;
    }

    // Build log entry object
    const entry = {
        time: getLocalIsoTimestamp(), // Local server timestamp (GMT/BST/etc)
        message: msg                  // Log message
    };

    // Add endpoint details if available
    if (req) {
        entry.method = req.method;                          // HTTP method
        entry.endpoint = req.originalUrl || req.url;        // Requested endpoint
        entry.ip = req.ip;                                  // Client IP address
    }

    // Write log entry followed by newline
    activeLogStream.write(JSON.stringify(entry) + '\n');
}

/**
 * Export log manager functions.
 */
module.exports = {
    writeLog,       // Main logging function
    deleteOldLogs,  // Retention cleanup
    openDailyLog    // Daily log file opener
};