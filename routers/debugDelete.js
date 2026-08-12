// ------------------------------------------------------------
// Express Router for deleting debug files
// ------------------------------------------------------------

/**
 * Load required modules.
 */
const express = require('express'); // Express router
const fs = require('fs');           // File system access
const path = require('path');       // Path utilities

/**
 * Factory function that creates the debug delete router.
 *
 * @param {string} ROOT - Base root directory
 * @param {function} serverLog - Logging function from server.js
 * @returns {Router} Express router instance
 */
function debugDelete(ROOT, serverLog) {

    // Create a new Express router instance
    const router = express.Router();

    // Build the directory where debug files are stored
    const DEBUG_DIR = path.join(ROOT, 'debug');

    /**
     * POST /debug/delete
     * Deletes one or more debug files.
     */
    router.post('/', (req, res) => {

        // Extract list of files from POST body
        const { files } = req.body;

        // Validate input
        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ message: 'No files provided' });
        }

        // Log delete request
        serverLog(`Debug delete requested for: ${files.join(', ')}`, req);

        // Track number of deleted files
        let deletedCount = 0;

        // Delete each file safely
        for (const file of files) {

            // Build full path to file
            const fullPath = path.join(DEBUG_DIR, file);

            // Delete file if it exists
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                deletedCount++;
            }
        }

        // Respond with JSON result
        res.json({ message: `Deleted ${deletedCount} file(s)` });
    });

    // Return the router instance
    return router;
}

// Export the factory function
module.exports = debugDelete;