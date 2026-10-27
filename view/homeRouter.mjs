/**
 * @file homeRouter
 * HTML request handler to show the home page.
 */

import { debugListData } from '../api/debug/debugList.mjs'; // Debug list API
import { logListData } from '../api/log/logList.mjs'; // Logger list API
import { modelListData } from '../api/model/modelList.mjs'; // Model list API
import { queueListData } from '../api/queue/queueList.mjs'; // Queue list API
import { render } from '../lib/HtmlUtil.mjs'; // HTML utilities

/**
 * Create the HTML request handler to show the home page.
 *
 * @param {import('express').Request} req - the express route request object
 * @param {import('express').Response} res - the express route response object
 * @returns {import('express').RequestHandler} the express route request handler
 */
export default function homeRouter(req, res) {

    // Get list of server log files
    const logList = logListData();

    // Get list of debug files 
    const debugList = debugListData();

    // Get list of job queue requests
    const queueList = queueListData();

    // Get list of model design packages
    const modelList = modelListData();

    // Create data object for template
    const data = {
        logCount: logList.length,
        debugCount: debugList.length,
        queueCount: queueList.requests.length,
        modelCount: modelList.length
    };

    // Render HTML
    const html = render('./view/home.html', { data });

    // Send response
    res.send(html);
}