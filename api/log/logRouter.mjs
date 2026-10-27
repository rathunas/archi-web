/**
 * @file logRouter
 * API request handler for server log files.
 */

import express from 'express'; // Express router
import { logListApi } from './logList.mjs'; // Fetch list of log files
import { logShowApi } from './logShow.mjs'; // Fetch log file contents

/**
 * API request handler for server log files.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function logRouter() {

    // Create router
    const router = express.Router();

    // Handle API request to get contents of a server log file
    router.get('/:filename', logShowApi);

    // Handle API request to list server log files
    router.get('/', logListApi);

    // Return router
    return router;
}