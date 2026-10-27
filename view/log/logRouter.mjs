/**
 * @file logRouter
 * HTML request handler for server log files.
 */

import express from 'express'; // Express router
import { logListData } from '../../api/log/logList.mjs'; // Logger list API
import { logShowData } from '../../api/log/logShow.mjs'; // Logger show API
import { render } from '../../lib/HtmlUtil.mjs'; // HTML utilities

/**
 * Create the HTML request handler for server log files.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function logRouter() {

    // Create router
    const router = express.Router();

    /**
     * Handle HTML request to get contents of a server log file.
     *
     * @route GET /:filename
     * @param {string} filename - server log filename
     */
    router.get('/:filename', (req, res) => {

        /** Server log filename. */
        const filename = req.params.filename;

        /** Contents of log file. */
        const contents = logShowData(filename);

        // Render HTML
        const html = render('./view/log/logShow.html', { filename, contents });

        // Send response
        res.send(html);
    });

    /**
     * Handle HTML request to list server log files.
     *
     * @route GET /
     */
    router.get('/', (req, res) => {

        // Get list of log files 
        const rows = logListData();

        // Render HTML
        const html = render('./view/log/logList.html', { rows });

        // Send response
        res.send(html);
    });

    // Return router
    return router;
}