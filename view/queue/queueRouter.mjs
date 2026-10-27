/**
 * @file queueRouter
 * HTML request handler for job queue requests.
 */

import express from 'express'; // Express router
import { queueListData } from '../../api/queue/queueList.mjs'; // Queue list API
import { queueShowData } from '../../api/queue/queueShow.mjs'; // Queue show API
import { root } from '../../lib/FileUtil.mjs'; // File utilities
import { NotFoundError, render } from '../../lib/HtmlUtil.mjs'; // HTML utilities

/**
 * Create the HTML request handler for job queue requests.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function queueRouter() {

    // Create router
    const router = express.Router();

    /**
     * Handle HTML request to view the add a job queue request page.
     *
     * @route GET /add
     */
    router.get('/add', (req, res) => {

        // Send response
        res.sendFile('./view/queue/queueAdd.html', { root });
    });

    /**
     * Handle HTML request to show contents of a job queue request.
     *
     * @route GET /:requestId
     * @param {string} requestId - job queue request ID
     */
    router.get('/:requestId', (req, res) => {

        /** Job queue request ID. */
        const requestId = req.params.requestId;

        /** Contents of job queue request. */
        const data = queueShowData(requestId);

        // Reject request ID not found
        if (!data) throw new NotFoundError(`Request ID: ${JSON.stringify(requestId)} not found`);

        // Render HTML
        const html = render('./view/queue/queueShow.html', { data });

        // Send response
        res.send(html);
    });

    /**
     * Handle API request to list job queue requests.
     *
     * @route GET /
     */
    router.get('/', (req, res) => {

        // Get queue list data 
        const data = queueListData();

        // Render HTML
        const html = render('./view/queue/queueList.html', { data });

        // Send response
        res.send(html);
    });

    // Return router
    return router;
}