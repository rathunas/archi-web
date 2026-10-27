/**
 * @file queueRouter
 * API request handler for job queue requests.
 */

import express from 'express'; // Express router
import multer from 'multer'; // File upload handler
import { queueDeleteApi } from './queueDelete.mjs'; // Delete job queue requests
import { queueDownloadApi } from './queueDownload.mjs'; // Download job queue request file
import { queueListApi } from './queueList.mjs'; // Fetch list of job queue requests
import { queueShowApi } from './queueShow.mjs'; // Fetch job queue request
import { queueSubmitApi } from './queueSubmit.mjs'; // Submit a job queue request

/**
 * API request handler for job queue requests.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function queueRouter() {

    // Create router
    const router = express.Router();

    // Configure multer to store file in memory
    const upload = multer({ storage: multer.memoryStorage() });

    // Handle API request to download the job queue request file
    router.get('/:requestId/download', queueDownloadApi);

    // Handle API request to get a job queue request
    router.get('/:requestId', queueShowApi);

    // Handle API request to list job queue requests
    router.get('/', queueListApi);

    // Handle API request to submit a job queue request
    router.put('/', upload.single('file'), queueSubmitApi);

    // Handle API request to delete job queue requests
    router.delete('/', queueDeleteApi);

    // Return router
    return router;
}