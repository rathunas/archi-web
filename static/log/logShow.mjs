/**
 * @file logShow
 * Client side behavior for logShow view.
 */

import page from '../util/PageUtil.mjs'; // Page utilities

/**
 * Data payload for logShow view.
 * 
 * @typedef LogShowData
 * 
 * @property {string} filename - log file name
 * @property {string} contents - log file contents
 */

/** Initial data payload. @type {LogShowData} */
const data = JSON.parse(document.getElementById('data').textContent);

// Set page title
page.titleElement.textContent = `View Log File - ${data.filename}`;

// Set navbar highlight
page.navbarElement.current = data.filename;

/** File contents container. @type {HTMLDivElement} */
const contentsDiv = document.getElementById('contents');

// Inject contents
contentsDiv.textContent = data.contents;