/**
 * @file logShow
 * API request handler for fetching the contents of a server log file.
 */

import { load } from '../../lib/FileUtil.mjs'; // File utilities
import { isLogFile } from '../../lib/LogUtil.mjs'; // Logger utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request parameters for API fetching the contents of a server log file.
 * @typedef LogShowRequestParams
 *
 * @property {string} filename - server log filename to show
 */

/**
 * Return contents of a server log file.
 *
 * @param {string} filename - server log filename
 * @returns {string} contents of the server log file
 */
export function logShowData(filename) {

    // Return server log file contents
    return load(config.LOG_DIR, filename, isLogFile);
}

/**
 * API request handler for fetching the contents of a server log file.
 *
 * @param {import('express').Request<LogShowRequestParams>} req - the express request object
 * @param {import('express').Response<string>} res - the express response object
 */
export function logShowApi(req, res) {

    // Extract filename parameter
    const filename = req.params.filename;

    // Fetch log file contents
    const contents = logShowData(filename);

    // Send response
    res.send(contents);
}