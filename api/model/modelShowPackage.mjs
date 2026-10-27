/**
 * @file modelShowPackage
 * API request handler for fetching the details of a model package.
 */

import fs from 'fs'; // File system utilities
import path from 'path'; // Path utilities
import { list } from '../../lib/FileUtil.mjs'; // File utilities
import { HTML_NOT_FOUND } from '../../lib/HtmlUtil.mjs'; // HTML utilities
import { isVersionMsFolder, validatePackageName } from '../../lib/ModelUtil.mjs'; // Model utilities
import { config } from '../../lib/ServerUtil.mjs'; // Server utilities

/**
 * API request parameters for fetching the details of a model package.
 * @typedef ModelShowPackageParams
 *
 * @property {string} packageName - the model package name
 */

/**
 * Return details of a model package.
 *
 * @param {string} packageName - the model package name
 * @returns {import('../../static/util/ModelUtil.mjs').ModelPackageNameDetail|null} details of a model package or null if package name does not exist
 */
export function modelShowPackageData(packageName) {

    // Reject invalid package name format
    packageName = validatePackageName(packageName);

    // Construct package path
    const packagePath = path.join(config.MODEL_DIR, packageName);

    // Return null if package name path does not exist
    if (!fs.existsSync(packagePath)) return null;

    // Fetch model package version entries
    const versionEntry = list({
        dir: packagePath,
        filter: isVersionMsFolder
    });

    // Return package name detail
    return {
        packageName,
        versions: versionEntry.map(entry => Number(entry.name)),
        wiki: config.WIKI
    };
}

/**
 * API request handler for fetching the details of a model package.
 *
 * @param {import('express').Request<ModelShowPackageParams, import('../../lib/ModelUtil.mjs').ModelPackageNameDetail>} req - the express package name object
 * @param {import('express').Response<import('../../lib/ModelUtil.mjs').ModelPackageNameDetail>} res - the express response object
 */
export function modelShowPackageApi(req, res) {

    // Extract package name parameter
    const packageName = req.params.packageName;

    // Get model design package data
    const data = modelShowPackageData(packageName);

    // Send response
    if (data) res.json(data);

    // Else package name path not found
    return res.status(HTML_NOT_FOUND).send();
}