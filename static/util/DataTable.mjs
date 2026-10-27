/**
 * @class DataTable
 * Data table class.
 */

/**
 * Row definition object passed to onAddRow.
 *
 * @typedef DataTableRowDef
 *
 * @property {HTMLElement} container - the row container element
 * @property {HTMLInputElement|null} selector - the row selector checkbox or null
 * @property {Object.<string, HTMLElement>} cells - map of cell ids to cell elements
 */

/**
 * Callback invoked after a row container and cells have been created.
 * 
 * @template {string|number|boolean|object} [T=FileSystemEntry] list item type
 * @callback DataTableOnAddRow
 *
 * @param {DataTableRowDef} def - row definition
 * @param {T} row - row data
 * @param {number} index - row index
 */

/**
 * Callback invoked whenever selection changes.
 *
 * @callback DataTableOnSelectionChange
 *
 * @param {string[]} selected - array of selected values
 */

/**
 * Data table controller for static pages.
 * Manages header, body and footer sections of a data-table element.
 *
 * @template {string|number|boolean|object} [T=FileSystemEntry] list item type
 *
 * @param {HTMLElement} element - the root data-table element
 */
export class DataTable {

    /**
     * Cache of instances by element id.
     * @type {Map<string, DataTable>}
     */
    static register = new Map();

    /**
     * Creates or returns a cached DataTable instance.
     *
     * @param {HTMLElement} element - the root data-table element
     * @returns {DataTable}
     */
    static get(element) {

        // Get element id
        const id = element.id;

        // Return existing instance if cached
        if (DataTable.register.has(id)) {
            return DataTable.register.get(id);
        }

        // Create new instance
        const instance = new DataTable(element);

        // Cache instance
        DataTable.register.set(id, instance);

        // Return instance
        return instance;
    }

    /**
     * Constructs a new DataTable controller.
     *
     * @constructor
     * @param {HTMLElement} element - the root data-table element
     * @returns {DataTable}
     */
    constructor(element) {

        /** The root container element. @type {HTMLDivElement} */
        this.element = element;

        /** The header element. @type {HTMLDivElement} */
        this.header = element.querySelector('.data-table-header');

        /** The body element. @type {HTMLDivElement} */
        this.body = element.querySelector('.data-table-body');

        /** The footer element. @type {HTMLDivElement} */
        this.footer = element.querySelector('.data-table-footer');

        /** Array of header columns. @type {HTMLElement[]} */
        this.columns = Array.from(this.header.querySelectorAll('.data-table-column'));

        /** Capture select-all checkbox. @type {import('../util/HtmlUtil.mjs').HTMLCheckboxElement | null} */
        this.selector = this.header.querySelector('.data-table-selector') || null;

        /**
         * External callback invoked whenever selection changes.
         * @type {DataTableOnSelectionChange|null}
         */
        this.onSelectionChange = null;

        /**
         * External callback invoked after a row container and cells have been created.
         * @type {DataTableOnAddRow<T>|null}
         */
        this.onAddRow = null;

        // Wire select-all behaviour
        if (this.selector) {
            this.selector.addEventListener('click', () => {
                if (this.selector.checked) this.selectAll();
                else this.unselectAll();
                this.#notifySelectionChange();
            });
        }
    }

    /**
     * Clears the table body.
     * 
     * @returns {void}
     */
    clearBody() {

        // Remove all children from body
        this.body.innerHTML = '';
    }

    /**
     * Adds multiple rows to the table body.
     *
     * @param {T[]} rows - array of row data
     * @returns {void}
     */
    addRows(rows) {

        // Clear existing rows
        this.clearBody();

        // Loop through rows
        for (let i = 0; i < rows.length; i++) {

            // Add row with index
            this.addRow(rows[i], i);
        }

        // Sync header checkbox
        this.#syncHeaderSelector();

        // Notify external listeners
        this.#notifySelectionChange();
    }

    /**
     * Adds a row to the table body.
     *
     * @param {T} row - row data
     * @param {number} index - row index
     * @returns {void}
     */
    addRow(row, index) {

        /** Row definition. @type {DataTableRowDef} */
        let def = {
            container: null,
            selector: null,
            cells: {}
        };

        // Create row container
        const container = document.createElement('div');

        // Set row class
        container.className = 'data-table-row';

        // Append row to body
        this.body.appendChild(container);

        // Capture container in row definition
        def.container = container;

        // Populate selector column if present
        if (this.selector) {

            // Create checkbox
            const selector = document.createElement('input');

            // Set checkbox type
            selector.type = 'checkbox';

            // Set checkbox class
            selector.className = 'data-table-row-selector';

            // Add change handler to sync header checkbox
            selector.addEventListener('click', () => {
                this.#syncHeaderSelector();
                this.#notifySelectionChange();
            });

            // Append checkbox
            container.appendChild(selector);

            // Capture selector in row definition
            def.selector = selector;
        }

        // Populate data columns
        for (const col of this.columns) {

            // Create cell
            const cell = document.createElement('div');

            // Set cell class
            cell.className = 'data-table-row-cell';

            // Build cell id
            cell.id = `${col.id}-${index}`;

            // Append cell
            container.appendChild(cell);

            // Capture cell in row definition
            def.cells[col.id] = cell;
        }

        // Check if onAddRow callback is a function
        if (typeof this.onAddRow === 'function') {

            // Invoke callback function
            this.onAddRow(def, row, index);
        }
    }

    /**
     * Selects all row selector checkboxes.
     * 
     * @returns {void}
     */
    selectAll() {

        // Get all row selector checkboxes
        const boxes = this.body.querySelectorAll('.data-table-row-selector');

        // Loop through boxes
        boxes.forEach(cb => cb.checked = true);

        // Update header checkbox
        if (this.selector) this.selector.checked = true;

        // Notify external listeners
        this.#notifySelectionChange();
    }

    /**
     * Unselects all row selector checkboxes.
     * 
     * @returns {void}
     */
    unselectAll() {

        // Get all row selector checkboxes
        const boxes = this.body.querySelectorAll('.data-table-row-selector');

        // Loop through boxes
        boxes.forEach(cb => cb.checked = false);

        // Update header checkbox
        if (this.selector) this.selector.checked = false;

        // Notify external listeners
        this.#notifySelectionChange();
    }

    /**
     * Toggles selection of all row selector checkboxes.
     * 
     * @returns {void}
     */
    toggleSelect() {

        // Get all row selector checkboxes
        const boxes = this.body.querySelectorAll('.data-table-row-selector');

        // Determine if any are unchecked
        const anyUnchecked = Array.from(boxes).some(cb => !cb.checked);

        // Select or unselect
        if (anyUnchecked) this.selectAll();
        else this.unselectAll();

        // Notify external listeners
        this.#notifySelectionChange();
    }

    /**
     * Returns array of selected checkbox values.
     *
     * @returns {string[]} array of selected values
     */
    getSelectedValues() {

        // Get all row selector checkboxes
        const boxes = this.body.querySelectorAll('.data-table-row-selector');

        // Return array of checked values
        return Array.from(boxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
    }

    /**
     * Syncs header checkbox with row selection state.
     * 
     * @returns {void}
     */
    #syncHeaderSelector() {

        // If no header selector, nothing to sync
        if (!this.selector) return;

        // Get all row selector checkboxes
        const boxes = this.body.querySelectorAll('.data-table-row-selector');

        // If no rows, uncheck header
        if (boxes.length === 0) {
            this.selector.checked = false;
            return;
        }

        // Check if all rows are selected
        const allSelected = Array.from(boxes).every(cb => cb.checked);

        // Update header checkbox
        this.selector.checked = allSelected;
    }

    /**
     * Notifies external listeners of selection changes.
     * 
     * @returns {void}
     */
    #notifySelectionChange() {

        // Check if onSelectionChange callback is a function
        if (typeof this.onSelectionChange === 'function') {

            // Invoke callback function
            this.onSelectionChange(this.getSelectedValues());
        }
    }
}