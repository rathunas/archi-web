/**
 * @file queueDelete
 * API request handler for deleting job queue requests.
 */

import { deletePaths } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validateRequestId } from '../../lib/QueueUtil.mjs'; // Queue utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for deleting job queue requests.
 * @typedef QueueDeleteRequestBody
 *
 * @property {string[]} requestIds - array of request IDs to delete
 */

/**
 * API response for deleting job queue requests.
 * @typedef QueueDeleteResponse
 * 
 * @property {number} deleted - number of deleted job queue requests
 */

/**
 * API request handler for deleting job queue requests.
 *
 * @param {import('express').Request<{}, QueueDeleteResponse, QueueDeleteRequestBody>} req - the express request object
 * @param {import('express').Response<QueueDeleteResponse>} res - the express response object
 */
export function queueDeleteApi(req, res) {

    // Extract request Ids array
    const { requestIds } = req.body;

    // Log request body parameters
    log({ requestIds });

    // Delete directory paths using request ID validator
    const deletedCount = deletePaths(config.QUEUE_DIR, requestIds, validateRequestId, { recursive: true, force: true });

    // Send response
    res.json({ deleted: deletedCount });
}