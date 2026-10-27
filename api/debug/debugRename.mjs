/**
 * @file debugRename
 * API request handler for renaming a debug file.
 */

import { renamePath, validateFilename } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for renaming a debug file.
 * @typedef DebugRenameRequestBody
 *
 * @property {string} source - the old filename
 * @property {string} target - the new filename
 */

/**
 * API response for renaming a debug file.
 * @typedef DebugRenameResponse
 * 
 * @property {string} filename - the renamed filename
 */

/**
 * API request handler for renaming a debug file.
 *
 * @param {import('express').Request<{}, DebugRenameRequestBody, DebugRenameResponse>} req - the express request object
 * @param {import('express').Response<DebugRenameResponse>} res - the express response object
 */
export function debugRenameApi(req, res) {

    // Extract source and target filenames
    const { source, target } = req.body;

    // Log request body parameters
    log({ source, target });

    // Rename path using filename validator
    const newName = renamePath(config.DEBUG_DIR, source, target, validateFilename);

    // Send response
    res.json({ filename: newName });
}