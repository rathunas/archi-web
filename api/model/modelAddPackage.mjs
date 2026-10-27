/**
 * @file modelAddPackage
 * API request handler for adding a model design package folder.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { validatePackageName } from '../../lib/ModelUtil.mjs';
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for adding a model design package folder.
 * @typedef ModelAddPackageRequestBody
 *
 * @property {string} packageName - the design package folder to add
 */

/**
 * API response for adding a model design package folder.
 * @typedef ModelAddPackageResponse
 * 
 * @property {string} packageName - the design package folder added
 */

/**
 * API request handler for adding a model design package folder.
 *
 * @param {import('express').Request<{}, ModelAddPackageRequestBody, ModelAddPackageResponse>} req - the express request object
 * @param {import('express').Response<ModelAddPackageResponse>} res - the express response object
 */
export function modelAddPackageApi(req, res) {

    // Extract body parameters
    let { packageName } = req.body;

    // Log request body parameters
    log({ packageName });

    // Reject invalid design package name
    packageName = validatePackageName(packageName);

    // Construct design package folder
    const packageFolder = path.join(config.MODEL_DIR, packageName);

    // Create the design package name folder
    fs.mkdirSync(packageFolder, { recursive: true });

    // Send response
    res.json({ packageName });
}