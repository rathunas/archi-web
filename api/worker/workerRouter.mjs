/**
 * @file workerRouter
 * Request handler for worker start/stop operations.
 */

import express from 'express'; // Express router
import { workerStart } from './workerStart.mjs'; // Start a worker
import { workerStop } from './workerStop.mjs'; // Stop a worker

/**
 * Create the worker router.
 *
 * @returns {import('express').RequestHandler} the express route request handler
 */
export default function workerRouter() {

    // Create router
    const router = express.Router();

    // Handle API request to start job queue worker
    router.post('/start/:requestId', workerStart);

    // Handle API request to stop job queue worker
    router.post('/stop/:requestId', workerStop);

    // Return router
    return router;
}