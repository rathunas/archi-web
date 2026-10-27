/**
 * @file debugRouter
 * API request handler for debug files.
 */

import express from 'express'; // Express router
import { debugAddApi } from './debugAdd.mjs'; // Add debug file contents
import { debugDeleteApi } from './debugDelete.mjs'; // Delete debug files
import { debugListApi } from './debugList.mjs'; // List debug files
import { debugRenameApi } from './debugRename.mjs'; // Rename a debug file
import { debugShowApi } from './debugShow.mjs'; // Fetch debug file contents

/**
 * API request handler for debug files.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function debugRouter() {

    // Create router
    const router = express.Router();

    // Handle API request to get contents of a debug file
    router.get('/:filename', debugShowApi);

    // Handle API request to list debug files
    router.get('/', debugListApi);

    // Handle API request to add a debug file
    router.put('/', debugAddApi);

    // Handle API request to rename a debug file
    router.patch('/', debugRenameApi);

    // Handle API request to delete debug files
    router.delete('/', debugDeleteApi);

    // Return router
    return router;
}