/**
 * @file debugRouter
 * HTML request handler for debug files.
 */

import express from 'express'; // Express router
import { debugListData } from '../../api/debug/debugList.mjs'; // Debug list API
import { debugShowData } from '../../api/debug/debugShow.mjs'; // Debug show API
import { root } from '../../lib/FileUtil.mjs'; // File utilities
import { render } from '../../lib/HtmlUtil.mjs'; // HTML utilities

/**
 * Create the HTML request handler for debug files.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function debugRouter() {

    // Create router
    const router = express.Router();

    /**
     * Handle HTML request to show contents of a debug file.
     *
     * @route GET /show/:filename
     * @param {string} filename - debug filename
     */
    router.get('/show/:filename', (req, res) => {

        /** Debug filename. */
        const filename = req.params.filename;

        /** Contents of debug file. */
        const contents = debugShowData(filename);

        // Render HTML
        const html = render('./view/debug/debugShow.html', { filename, contents });

        // Send response
        res.send(html);
    });

    /**
     * Handle HTML request to get debug add file page.
     *
     * @route GET /add
     */
    router.get('/add', (req, res) => {

        // Send response
        res.sendFile('./view/debug/debugAdd.html', { root });
    });

    /**
     * Handle HTML request to list debug log files.
     *
     * @route GET /
     */
    router.get('/', (req, res) => {

        // Get list of debug files 
        const rows = debugListData();

        // Render HTML
        const html = render('./view/debug/debugList.html', { rows });

        // Send response
        res.send(html);
    });

    // Return router
    return router;
}