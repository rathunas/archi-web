/**
 * @file home
 * Client side behaviour for home view.
 */

/**
 * Home page data.
 * 
 * @typedef HomeData
 * 
 * @property {number} logCount - number of log files
 * @property {number} debugCount - number of debug files
 * @property {number} queueCount - number of job queue requests
 * @property {number} modelCount - number of design packages
 */

// Update anchor text for a link
function updateLink(id, label, count) {

    // Get anchor element
    const el = document.getElementById(id);

    // Update text content
    el.textContent = `${label} (${count})`;
}

/** Initial data payload. @type {HomeData} */
let data = JSON.parse(document.getElementById('data').textContent);

// Update queue link
updateLink('queue', 'Queue', data.queueCount);

// Update model link
updateLink('model', 'Models', data.modelCount);

// Update debug link
updateLink('debug', 'Debug', data.debugCount);

// Update log link
updateLink('log', 'Logs', data.logCount);