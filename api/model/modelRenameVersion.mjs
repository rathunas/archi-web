/**
 * @file modelRenameVersion
 * API request handler for renaming a model design package name.
 */

import path from 'path'; // Path utilities
import { renamePath } from '../../lib/FileUtil.mjs'; // File utilities
import { load, save } from '../../lib/InfoUtil.mjs'; // Info.json file utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validatePackageName, validateVersionMsReturnString } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * API request parameters for renaming model package version.
 * @typedef ModelRenameVersionRequestParams
 *
 * @property {string} packageName - the model package name
 */

/**
 * Request body for renaming a model design package version.
 * @typedef ModelRenameVersionRequestBody
 *
 * @property {number} source - the old design package version timestamp in milliseconds
 * @property {number} target - the new design package version timestamp in milliseconds
 */

/**
 * API response for renaming a model design package version.
 * @typedef ModelRenameVersionResponse
 * 
 * @property {number} versionMs - the renamed design package version timestamp in milliseconds
 */

/**
 * API request handler for renaming a model design package version.
 *
 * @param {import('express').Request<{}, ModelRenameVersionRequestBody, ModelRenameVersionResponse>} req - the express request object
 * @param {import('express').Response<ModelRenameVersionResponse>} res - the express response object
 */
export function modelRenameVersionApi(req, res) {

    // Extract package name from request parameters
    let packageName = req.params.packageName;

    // Extract source and target filenames
    const { source, target } = req.body;

    // Log request body parameters
    log({ source, target });

    // Reject invalid design package name
    packageName = validatePackageName(packageName);

    // Resolve full design package path
    const packagePath = path.join(config.MODEL_DIR, packageName);

    // Rename path using version validator
    const newVersionMs = Number(renamePath(packagePath, source, target, validateVersionMsReturnString));

    // Resolve full design package version path
    const versionPath = path.join(packagePath, newVersionMs.toString(10));

    // Load info.json
    const info = load(versionPath);

    // Update versionMs property
    info.versionMs = newVersionMs;

    // Save info.json
    save(versionPath, info);

    // Send response
    res.json({ versionMs: newVersionMs });
}