/**
 * @file createApp
 * Express App factory.
 */

import cors from 'cors'; // CORS middleware handler
import express from 'express'; // Express router
import path from 'path'; // Path utilities
import { fileURLToPath } from 'url'; // ES-module dirname support
import { HTML_INTERNAL_ERROR } from '../lib/HtmlUtil.mjs'; // HTML utilities
import { log } from '../lib/LogUtil.mjs'; // Logging utilities

// API Routers
import debugRouterApi from '../api/debug/debugRouter.mjs';
import logRouterApi from '../api/log/logRouter.mjs';
import modelRouterApi from '../api/model/modelRouter.mjs';
import queueRouterApi from '../api/queue/queueRouter.mjs';
import workerRouterApi from '../api/worker/workerRouter.mjs';

// HTML view routers
import debugRouterView from '../view/debug/debugRouter.mjs';
import homeRouterView from '../view/homeRouter.mjs';
import logRouterView from '../view/log/logRouter.mjs';
import modelRouterView from '../view/model/modelRouter.mjs';
import queueRouterView from '../view/queue/queueRouter.mjs';

// ES‑module __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Factory function that creates and configures the Express application.
 *
 * @returns {import('express').Express} express application instance
 */
export default function createApp() {

    // Constuct express application instance
    const app = express();

    // Use middleware to manage Cross Origin Resource Sharing (CORS)
    app.use(cors());

    // Use middleware to parse JSON response contents
    app.use(express.json());

    // Set middleware for cache control
    app.use((req, res, next) => {

        // Set response headers
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Proceed to next middleware
        next();
    });

    // use middleware to serve static files
    app.use('/static', express.static(path.join(__dirname, '..', 'static')));

    // Set middleware to log requests
    app.use((req, res, next) => {

        // Write request to server logfile
        log(req);

        // Proceed to next middleware
        next();
    });

    // Set middleware for handling API requests
    app.use('/api/log', logRouterApi());
    app.use('/api/debug', debugRouterApi());
    app.use('/api/queue', queueRouterApi());
    app.use('/api/worker', workerRouterApi());
    app.use('/api/model', modelRouterApi());

    // Set middleware for handling HTML requests
    app.use('/log', logRouterView());
    app.use('/debug', debugRouterView());
    app.use('/queue', queueRouterView());
    app.use('/model', modelRouterView());
    app.get('/', homeRouterView);

    // Set middleware to handle errors
    app.use((err, req, res, next) => {

        // Log error message
        log(err.message);

        // Check if error triggered by API or HTML request handler
        if (req.path.startsWith('/')) {

            // Respond with HTML internal error and message
            return res
                .status(HTML_INTERNAL_ERROR)
                .json({
                    ok: false,
                    error: err.message
                });
        }

        // Process next middleware
        next(err);
    });

    // Return express application instance
    return app;
}