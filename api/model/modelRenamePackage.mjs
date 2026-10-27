/**
 * @file modelRenamePackage
 * API request handler for renaming a model design package name.
 */

import path from 'path'; // Path utilities
import { list, renamePath } from '../../lib/FileUtil.mjs'; // File utilities
import { load, save } from '../../lib/InfoUtil.mjs'; // Info.json file utilities
import { log } from '../../lib/LogUtil.mjs'; // Logging utilities
import { isVersionMsFolder, validatePackageName } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * Request body for renaming a model design package name.
 * @typedef ModelRenamePackageRequestBody
 *
 * @property {string} source - the old design package name
 * @property {string} target - the new design package name
 */

/**
 * API response for renaming a model design package name.
 * @typedef ModelRenamePackageResponse
 * 
 * @property {string} packageName - the renamed design package name
 */

/**
 * API request handler for renaming a model design package name.
 *
 * @param {import('express').Request<{}, ModelRenamePackageRequestBody, ModelRenamePackageResponse>} req - the express request object
 * @param {import('express').Response<ModelRenamePackageResponse>} res - the express response object
 */
export function modelRenamePackageApi(req, res) {

    // Extract source and target filenames
    const { source, target } = req.body;

    // Log request body parameters
    log({ source, target });

    // Rename path using package name validator
    const newPackageName = renamePath(config.MODEL_DIR, source, target, validatePackageName);

    // Construct package path
    const packagePath = path.join(config.MODEL_DIR, newPackageName);

    // Fetch model package version entries
    const versionFolders = list({
        dir: packagePath,
        filter: isVersionMsFolder
    });

    // Loop through all version folders
    for (const folder of versionFolders) {

        // Load info.json
        const info = load(folder.fullPath);

        // Update package name property
        info.packageName = newPackageName;

        // Save info.json
        save(folder.fullPath, info);
    }

    // Send response
    res.json({ packageName: newPackageName });
}