/**
 * @file debugShow
 * API request handler for fetching the contents of a debug file.
 */

import { isFile, load } from '../../lib/FileUtil.mjs'; // File utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request parameters for API fetching the contents of a debug file.
 * @typedef DebugShowRequestParams
 *
 * @property {string} filename - debug filename to show
 */

/**
 * Return contents of a debug file.
 *
 * @param {string} filename - debug filename
 * @returns {string} contents of the debug file
 */
export function debugShowData(filename) {

    // Return debug file contents
    return load(config.DEBUG_DIR, filename, isFile);
}

/**
 * API request handler for fetching the contents of a debug file.
 *
 * @param {import('express').Request<DebugShowRequestParams>} req - the express request object
 * @param {import('express').Response<string>} res - the express response object
 */
export function debugShowApi(req, res) {

    // Extract filename parameter
    const filename = req.params.filename;

    // Fetch debug file contents
    const contents = debugShowData(filename);

    // Send response
    res.send(contents);
}