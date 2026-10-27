/**
 * Creates a breadcrumb-style navigation bar element.
 *
 * @param {string} [current] - current breadcrumb text (default 'Loading...')
 *
 * @returns HTMLElement
 *
 * @throws TypeError if children cannot be processed
 */
export default class AppNavbar extends HTMLElement {

    /** Current breadcrumb text. @type {string|null} */
    #current;

    /**
     * Constructs the element and initialises the current value.
     *
     * @returns {AppNavbar}
     *
     * @throws TypeError if attribute parsing fails
     */
    constructor() {

        // Call super constructor
        super();

        // Initialize private current value from attribute or null
        this.#current = this.getAttribute('current') || null;
    }

    /**
     * Called when the element is attached to the DOM.
     *
     * @returns {void}
     */
    connectedCallback() {

        // Render initial breadcrumb structure
        this.render();
    }

    /**
     * Observed attributes for this element.
     *
     * @returns {string[]} list of observed attribute names
     */
    static get observedAttributes() {

        // Observe the current attribute for updates
        return ['current'];
    }

    /**
     * Handle attribute changes.
     *
     * @param {string} name - changed attribute name
     * @param {string|null} oldValue - previous value
     * @param {string|null} newValue - new value
     *
     * @returns {void}
     */
    attributeChangedCallback(name, oldValue, newValue) {

        // Update private current value when attribute changes
        if (name === 'current') {

            // Store new value
            this.#current = newValue;

            // Re-render breadcrumb
            this.render();
        }
    }

    /**
     * Gets the current breadcrumb text.
     *
     * @returns {string|null} current breadcrumb text
     */
    get current() {

        // Return private current value
        return this.#current;
    }

    /**
     * Sets the current breadcrumb text.
     *
     * @param {string|null} value - new breadcrumb text
     *
     * @returns {void}
     */
    set current(value) {

        // Store new value in private field
        this.#current = value;

        // Sync attribute with property
        this.setAttribute('current', value);
    }

    /**
     * Renders the breadcrumb structure.
     *
     * @returns {void}
     *
     * @throws TypeError if children cannot be serialised
     */
    render() {

        // Collect only anchor children
        const anchors = Array.from(this.children).filter(n => n.tagName === 'A');

        // Prepare output parts
        const parts = [];

        // Serialise each anchor
        for (const anchor of anchors) {

            // Push anchor HTML
            parts.push(anchor.outerHTML);
        }

        // Append current breadcrumb text
        parts.push(`<span>${this.#current}</span>`);

        // Join with non-breaking-space separators and update DOM
        this.innerHTML = parts.join('&nbsp;/&nbsp;');
    }
}

// Register the custom element
customElements.define('app-navbar', AppNavbar);