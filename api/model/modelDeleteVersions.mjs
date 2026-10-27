/**
 * @file modelDeleteVersions
 * API request handler for deleting model package versions.
 */

import path from 'path'; // Path utilities
import { deletePaths } from '../../lib/FileUtil.mjs'; // File utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validatePackageName, validateVersionMsReturnString } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * API request parameters for deleting model package versions.
 * @typedef ModelDeleteVersionsRequestParams
 *
 * @property {string} packageName - the model package name
 */

/**
 * Request body for deleting model package versions.
 * @typedef ModelDeleteVersionsRequestBody
 *
 * @property {number[]} versions - array of model package version timestamps in milliseconds to delete
 */

/**
 * API response for deleting model package versions.
 * @typedef ModelDeleteVersionsResponse
 * 
 * @property {number} deleted - number of deleted model package versions
 */

/**
 * API request handler for deleting model package versions.
 *
 * @param {import('express').Request<ModelDeleteVersionsRequestParams, ModelDeleteVersionsResponse, ModelDeleteVersionsRequestBody>} req - the express request object
 * @param {import('express').Response<ModelDeleteVersionsResponse>} res - the express response object
 */
export function modelDeleteVersionsApi(req, res) {

    // Extract package name from request parameters
    let packageName = req.params.packageName;

    // Extract versions
    const { versions } = req.body;

    // Log request body parameters
    log({ versions });

    // Reject invalid design package name
    packageName = validatePackageName(packageName);

    // Resolve full design package path
    const packagePath = path.join(config.MODEL_DIR, packageName);

    // Delete directory paths using version validator
    const deletedCount = deletePaths(packagePath, versions, validateVersionMsReturnString, { recursive: true, force: true });

    // Send response
    res.json({ deleted: deletedCount });
}