/**
 * @file modelRouter
 * Request handler for model operations.
 */

import express from 'express'; // Express router
import { modelAddPackageApi } from './modelAddPackage.mjs'; // Router for adding package folder
import { modelDeletePackagesApi } from './modelDeletePackages.mjs'; // Router for deleting packages
import { modelDeleteVersionsApi } from './modelDeleteVersions.mjs'; // Router for deleting versions
import { modelFetchApi } from './modelFetch.mjs'; // Router for fetching model files
import { modelListApi } from './modelList.mjs'; // Router for listing models
import { modelMasterApi } from './modelMaster.mjs'; // Router for downloading master archimate file
import { modelRenamePackageApi } from './modelRenamePackage.mjs'; // Router for renaming package
import { modelRenameVersionApi } from './modelRenameVersion.mjs'; // Router for renaming version
import { modelShowPackageApi } from './modelShowPackage.mjs'; // Router for fetching package detail
import { modelShowVersionApi } from './modelShowVersion.mjs'; // Router for fetching version detail

/**
 * API request handler for model requests.
 *
 * @returns {import('express').Router} the express route request handler
 */
export default function modelRouter() {

    // Create router
    const router = express.Router();

    // Handle API request to fetch master model version (latest or milliseconds timestamp)
    router.get('/master/:packageName/:versionMs', modelMasterApi);

    // Handle API request to fetch a model design package version file or folder
    router.get('/:packageName/:versionMs/*path', modelFetchApi);

    // Handle API request to show model design package version details
    router.get('/:packageName/:versionMs', modelShowVersionApi);

    // Handle API request to show model design package details
    router.get('/:packageName', modelShowPackageApi);

    // Handle API request to list model design packages
    router.get('/', modelListApi);

    // Handle API request to add a model design package folder
    router.put('/', modelAddPackageApi);

    // Handle API request to delete model design package versions
    router.delete('/:packageName', modelDeleteVersionsApi);

    // Handle API request to delete model design packages
    router.delete('/', modelDeletePackagesApi);

    // Handle API request to rename a model design package version
    router.patch('/:packageName', modelRenameVersionApi);

    // Handle API request to rename a model design package
    router.patch('/', modelRenamePackageApi);

    // Return router
    return router;
}