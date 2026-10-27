/**
 * @file debugDelete
 * API request handler for deleting debug files.
 */

import { deletePaths, validateFilename } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for deleting debug files.
 * @typedef DebugDeleteRequestBody
 *
 * @property {string[]} filenames - array of filenames to delete
 */

/**
 * API response for deleting debug files.
 * @typedef DebugDeleteResponse
 * 
 * @property {number} deleted - number of deleted debug files
 */

/**
 * API request handler for deleting debug files.
 *
 * @param {import('express').Request<{}, DebugDeleteResponse, DebugDeleteRequestBody>} req - the express request object
 * @param {import('express').Response<DebugDeleteResponse>} res - the express response object
 */
export function debugDeleteApi(req, res) {

    // Extract filenames array
    const { filenames } = req.body;

    // Log request body parameters
    log({ filenames });

    // Delete paths using filename validator
    const deletedCount = deletePaths(config.DEBUG_DIR, filenames, validateFilename);

    // Send response
    res.json({ deleted: deletedCount });
}