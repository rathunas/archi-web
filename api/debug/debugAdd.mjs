/**
 * @file debugAdd
 * API request handler for adding a debug file.
 */

import { save } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for adding a debug file.
 * @typedef DebugAddRequestBody
 *
 * @property {string} filename - the filename to add
 * @property {string} contents - the contents of the file
 */

/**
 * API response for adding a debug file.
 * @typedef DebugAddResponse
 * 
 * @property {string} filename - the filename added
 */

/**
 * API request handler for adding a debug file.
 *
 * @param {import('express').Request<{}, DebugAddRequestBody, DebugAddResponse>} req - the express request object
 * @param {import('express').Response<DebugAddResponse>} res - the express response object
 */
export function debugAddApi(req, res) {

    // Extract body parameters
    const { filename, contents } = req.body;

    // Log request body parameters
    log({ filename });

    // Add debug file contents
    save(config.DEBUG_DIR, filename, contents, true);

    // Send response
    res.json({ filename });
}