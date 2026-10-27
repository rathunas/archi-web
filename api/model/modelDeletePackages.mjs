/**
 * @file modelDeletePackages
 * API request handler for deleting model packages.
 */

import { deletePaths } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validatePackageName } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for deleting model packages.
 * @typedef ModelDeletePackagesRequestBody
 *
 * @property {string[]} packageNames - array of model package names to delete
 */

/**
 * API response for deleting model packages.
 * @typedef ModelDeletePackagesResponse
 * 
 * @property {number} deleted - number of deleted model packages
 */

/**
 * API request handler for deleting model packages.
 *
 * @param {import('express').Request<{}, ModelDeletePackagesResponse, ModelDeletePackagesRequestBody>} req - the express request object
 * @param {import('express').Response<ModelDeletePackagesResponse>} res - the express response object
 */
export function modelDeletePackagesApi(req, res) {

    // Extract package names
    const { packageNames } = req.body;

    // Log request body parameters
    log({ packageNames });

    // Delete directory paths using design package name validator
    const deletedCount = deletePaths(config.MODEL_DIR, packageNames, validatePackageName, { recursive: true, force: true });

    // Send response
    res.json({ deleted: deletedCount });
}