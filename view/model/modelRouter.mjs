/**
 * @file modelRouter
 * HTML request handler for models.
 */

import express from 'express'; // Express router
import { modelListData } from '../../api/model/modelList.mjs'; // Model list API
import { modelShowPackageData } from '../../api/model/modelShowPackage.mjs'; // Model show package API
import { modelShowVersionData } from '../../api/model/modelShowVersion.mjs'; // Model show version API
import { root } from '../../lib/FileUtil.mjs'; // File utilities
import { NotFoundError, render } from '../../lib/HtmlUtil.mjs'; // HTML utilities

/**
 * Create the HTML request handler for models.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function modelRouter() {

    // Create router
    const router = express.Router();

    /**
     * Handle HTML request to show model design package version.
     *
     * @route GET /show/:packageName/:versionMs
     * @param {string} packageName - design package name
     * @param {number} versionMs - version in milliseconds
     */
    router.get('/show/:packageName/:versionMs', (req, res) => {

        // Extract package name and version timestamp parameter
        const { packageName, versionMs } = req.params;

        // Get model design package version data
        const data = modelShowVersionData(packageName, versionMs);

        // Reject package name or version not found
        if (!data) throw new NotFoundError(
            `Package name: ${JSON.stringify(packageName)} ` +
            `version: ${JSON.stringify(packageName)} not found`);

        // Render HTML
        const html = render('./view/model/modelShowVersion.html', { data });

        // Send response
        res.send(html);
    });

    /**
     * Handle HTML request to show model design package.
     *
     * @route GET /show/:packageName
     * @param {string} packageName - design package name
     */
    router.get('/show/:packageName', (req, res) => {

        // Extract package name parameter
        const packageName = req.params.packageName;

        // Get model design package data
        const data = modelShowPackageData(packageName);

        // Reject package name not found
        if (!data) throw new NotFoundError(`Package name: ${JSON.stringify(packageName)} not found`);

        // Render HTML
        const html = render('./view/model/modelShowPackage.html', { data });

        // Send response
        res.send(html);
    });

    /**
     * Handle HTML request to add model design package.
     *
     * @route GET /add
     */
    router.get('/add', (req, res) => {

        // Send response
        res.sendFile('./view/model/modelAddPackage.html', { root });
    });

    /**
     * Handle API request to list models.
     *
     * @route GET /
     */
    router.get('/', (req, res) => {

        // Get model list rows 
        const rows = modelListData();

        // Render HTML
        const html = render('./view/model/modelList.html', { rows });

        // Send response
        res.send(html);
    });

    // Return router
    return router;
}