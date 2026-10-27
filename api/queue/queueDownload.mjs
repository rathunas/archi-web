/**
 * @file queueDownload
 * API request handler for downloading a job queue request file.
 */

import path from 'path'; // Path utilities
import { load as loadInfo } from '../../lib/InfoUtil.mjs'; // Info file utilities
import { validateRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request parameters for API downloading a job queue request file.
 * @typedef QueueDownloadRequestParams
 *
 * @property {string} requestId - the request ID to fetch
 */

/**
 * API request handler for downloading a job queue request file.
 *
 * @param {import('express').Request<QueueDownloadRequestParams>} req - the express request object
 * @param {import('express').Response} res - the express response object
 */
export function queueDownloadApi(req, res) {

    // Extract request ID parameter
    let requestId = req.params.requestId;

    // Reject invalid request ID format
    requestId = validateRequestId(requestId);

    // Construct request path
    const requestPath = path.join(config.QUEUE_DIR, requestId);

    // Load info
    const info = loadInfo(requestPath);

    // Construct version filename
    const versionFilename = `${info.versionMs}.archimate`;

    // Construct version file path
    const versionPath = path.join(requestPath, versionFilename);

    // Send response
    res.download(versionPath, info.filename);
}