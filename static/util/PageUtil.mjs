/**
 * @file PageUtil
 * Client side behaviour for page utilities.
 */

/** Current URL. */
const url = new URL(window.location.href);

/**
 * Page utilities.
 */
export default {

    /** Current URL. */
    url,

    /** URL segments. @type {string} */
    urlSegments: url.pathname.split('/'),

    /** Title element. @type {HTMLTitleElement} */
    titleElement: document.getElementById('title'),

    /** Navigation bar element. @type {import('../components/AppNavbar.mjs').default} */
    navbarElement: document.getElementById('navbar')
};