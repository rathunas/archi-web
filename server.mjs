/**
 * @file server
 * Archi web server.
 */

import createApp from './lib/createApp.mjs'; // Express app factory
import { start } from './lib/ServerUtil.mjs'; // Server utilities

// Create Express app instance
const app = createApp();

// Start server
start(app);