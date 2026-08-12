// ------------------------------------------------------------
// Express Router for debug file saving
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express'); // Express router
const fs = require('fs');           // File system access
const path = require('path');       // Path utilities

/**
 * Factory function that creates the debug save router.
 *
 * @param {string} ROOT - Base root directory from config
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function debugSave(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    // Build the directory where saved files will be stored
    const DEBUG_DIR = path.join(ROOT, 'debug');

    // Ensure the debug directory exists
    fs.mkdirSync(DEBUG_DIR, { recursive: true });

    /**
     * POST /debug/save
     * Saves a file to the debug directory.
     */
    router.post('/', (req, res) => {

        // Log that a save request was received
        serverLog('Debug save request', req);

        // Extract filename and contents from JSON body
        const { filename, contents } = req.body;

        // Validate filename
        if (!filename || filename.trim() === '') {
            return res.json({ ok: false, message: 'Filename cannot be empty' });
        }

        // Validate contents
        if (!contents || contents.length === 0) {
            return res.json({ ok: false, message: 'Contents cannot be empty' });
        }

        // Build full path to the file inside the debug directory
        const fullPath = path.join(DEBUG_DIR, filename.trim());

        // Write the file contents to disk
        fs.writeFileSync(fullPath, contents, 'utf8');

        // Log successful save
        serverLog(`Debug saved file: ${fullPath}`);

        // Send success response
        res.json({ ok: true, message: 'Saved to ' + fullPath });
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = debugSave;