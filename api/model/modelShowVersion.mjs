/**
 * @file modelShowVersion
 * API request handler for fetching the details of a model package version.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities
import { HTML_NOT_FOUND } from '../../lib/HtmlUtil.mjs'; // HTML utilities
import { load as loadInfo } from '../../lib/InfoUtil.mjs'; // Info file utilities
import { validatePackageName, validateVersionMs } from '../../lib/ModelUtil.mjs';
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities
import { load as loadStatus } from '../../lib/StatusUtil.mjs'; // Status file utilities

/**
 * API request parameters for fetching the details of a model package version.
 * @typedef ModelShowVersionParams
 *
 * @property {string} packageName - the model design package name
 * @property {number} versionMs - the package version timestamp in milliseconds to fetch
 */

/**
 * Return details of a model package version.
 *
 * @param {string} packageName - the model design package name
 * @param {number} versionMs - the package version timestamp in milliseconds to fetch
 * @returns {import('../../static/util/ModelUtil.mjs').ModelVersionDetail|null} details of a model package version or null if package name does not exist
 */
export function modelShowVersionData(packageName, versionMs) {

    // Reject invalid package name format
    packageName = validatePackageName(packageName);

    // Reject invalid version timestamp format
    versionMs = validateVersionMs(versionMs);

    // Construct package version path
    const versionPath = path.join(config.MODEL_DIR, packageName, versionMs.toString(10));

    // Return null if package name version path does not exist
    if (!fs.existsSync(versionPath)) return null;

    // Load info and status
    const info = loadInfo(versionPath);
    const status = loadStatus(versionPath);

    // Return package version detail
    return {
        ...info,
        ...status,
        wiki: config.WIKI
    };
}

/**
 * API request handler for fetching the details of a model package version.
 *
 * @param {import('express').Request<ModelShowVersionParams, import('../../lib/ModelUtil.mjs').ModelVersionDetail>} req - the express package version object
 * @param {import('express').Response<import('../../lib/ModelUtil.mjs').ModelVersionDetail>} res - the express response object
 */
export function modelShowVersionApi(req, res) {

    // Extract package name and version timestamp parameters
    let { packageName, versionMs } = req.params;

    // Get model design package version data
    const data = modelShowVersionData(packageName, versionMs);

    // Send response
    if (data) res.json(data);

    // Else package name version path not found
    return res.status(HTML_NOT_FOUND).send();
}