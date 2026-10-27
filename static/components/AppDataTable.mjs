/**
 * Represents a map of field elements keyed by field id.
 *
 * @typedef {Object.<string, HTMLElement>} AppDataTableFieldMap
 */

/**
 * Callback event on row selection change.
 *
 * @callback AppDataTableOnSelectionChange
 *
 * @param {number[]} selected - array of selected rows
 *
 * @returns {void}
 */

/**
 * Populates field elements for a single row.
 *
 * @template T
 *
 * @callback AppDataTableTransform
 *
 * @param {T[]} rows - array of rows
 * @param {AppDataTableFieldMap} fields - map of field elements
 * @param {number} index - row index
 *
 * @returns {void}
 */

/**
 * Row sort callback function
 *
 * @callback AppDataTableSort
 *
 * @param {HTMLElement} element - the heading sort element
 * @param {boolean} ascending - true if ascending sort order
 *
 * @returns {void}
 */

/**
 * Creates a data-table element.
 *
 * @template T
 */
export class AppDataTable extends HTMLElement {

    /** Array of data rows. @type {T[]} */
    rows = [];

    /** Selected row indices. @type {number[]} */
    selectedRows = [];

    /** Selection change callback. @type {AppDataTableOnSelectionChange|null} */
    onSelectionChange = null;

    /** Field transform callaback function. @type {AppDataTableTransform<T>|null} */
    transform = null;

    /** Row sort callback function. @type {AppDataTableSort<T>|null} */
    sort = null;

    /** Cached header element. @type {HTMLDivElement|null} */
    #headerElement = null;

    /** Cached body element. @type {HTMLDivElement|null} */
    #bodyElement = null;

    /** Cached row elements. @type {HTMLElement[]} */
    #rowElements = [];

    /** Cached field template elements. @type {HTMLElement[]} */
    #fieldTemplates = [];

    /** Selector field template element. @type {import('../util/HtmlUtil.mjs').HTMLCheckboxElement|null} */
    #selectorTemplate = null;

    /** Heading selector checkbox. @type {import('../util/HtmlUtil.mjs').HTMLCheckboxElement|null} */
    #headingSelector = null;

    /** Cached sort elements. @type {HTMLDivElement[]} */
    #sortElements = [];

    /** Cached row selector checkboxes per row. @type {HTMLInputElement[][]} */
    #rowSelectors = [];

    /** Last selected row index for shift-click range selection. @type {number|null} */
    #lastSelectedIndex = null;

    /**
     * Constructs the element and prepares the shadow root.
     *
     * @returns AppDataTable
     *
     * @throws TypeError if initialization fails
     */
    constructor() {

        // Call super constructor
        super();
    }

    /**
     * Called when the element is attached to the DOM.
     *
     * @returns void
     */
    connectedCallback() {

        // Collect field template elements from children
        this.#fieldTemplates = Array.from(this.children).filter(element =>
            element.id &&
            !(element instanceof HTMLScriptElement)
        );

        // Render table
        this.render();
    }

    /**
     * Render the component.
     *
     * @returns {void}
     */
    render() {

        // Create table container
        const table = document.createElement('div');
        table.className = 'app-data-table';

        // Render heading into table
        this.#renderHeader(table);

        // Render body into table
        this.#renderBody(table);

        // Clear all children
        this.#removeAllChildren(this);

        // Append table container
        this.appendChild(table);
    }

    /**
     * Remove all children from an element.
     * 
     * @param {HTMLElement} element - the element to clear
     * @returns {void}
     */
    #removeAllChildren(element) {

        // While element first child exists, remove first child and repeat
        while (element.firstChild) element.removeChild(element.firstChild)
    }

    /**
     * Render header elements into parent  element.
     *
     * @param {HTMLDivElement} parent - parent element
     */
    #renderHeader(parent) {

        // Clear cached selector template
        this.#selectorTemplate = null;

        // Clear cached heading selector
        this.#headingSelector = null;

        // Clear cached sort elements
        this.#sortElements = [];

        // Create and cache header element
        this.#headerElement = document.createElement('div');
        this.#headerElement.className = 'app-data-table-header';

        // Loop through field templates
        for (const template of this.#fieldTemplates) {

            // Clone the field template element
            const clone = template.cloneNode(true);

            // Check if field is a selector checkbox
            if (template.hasAttribute('data-selector') &&
                template.type === 'checkbox') {

                // Cache selector checkbox
                this.#selectorTemplate = template;

                // Cache heading selector checkbox
                this.#headingSelector = clone;

                // Handle heading selector checkbox click event
                clone.addEventListener('click', () => this.#handleOnClickSelector(clone));
            }

            // Else check if heading field is sortable column
            else if (typeof template.hasAttribute('data-sortable')) {

                // Creat and cache sort element 
                const sortElement = document.createElement('span');
                this.#sortElements.push(sortElement);

                // Mark elements as sortable
                clone.className = 'app-data-table-heading-sortable';
                sortElement.className = 'app-data-table-heading-sortable';

                // Append sort element to heading and cache
                clone.appendChild(sortElement);

                // Handle heading sort click event
                clone.addEventListener('click', (event) => this.#handleOnClickHeading(event, sortElement));
                sortElement.addEventListener('click', (event) => this.#handleOnClickHeading(event, sortElement));
            }

            // Append cloned element to header
            this.#headerElement.appendChild(clone);
        }

        // Append header to parent
        parent.appendChild(this.#headerElement);
    }

    /**
     * Render body elements into parent element.
     *
     * @param {HTMLDivElement} parent - parent element
     */
    #renderBody(parent) {

        // Create and cache body element for rows
        this.#bodyElement = document.createElement('div');
        this.#bodyElement.className = 'app-data-table-body';

        // Render rows into body
        this.#renderRows(this.#bodyElement);

        // Append body to parent
        parent.appendChild(this.#bodyElement);
    }

    /**
     * Render row elements into parent element.
     *
     * @param {HTMLDivElement} parent - parent element
     */
    #renderRows(parent) {

        // Clear row selector cache
        this.#rowSelectors = [];

        // Clear row element cache
        this.#rowElements = [];

        // Clear selected rows
        this.selectedRows = [];

        // Clear last selected index
        this.#lastSelectedIndex = null;

        // Loop through rows
        if (Array.isArray(this.rows)) for (let i = 0; i < this.rows.length; i++) {

            // Render row into parent
            this.#renderRow(parent, i);
        }
    }

    /**
     * Render a row element into parent element
     * 
     * @param {HTMLDivElement} parent - parent element
     * @param {number} index - the row index
     */
    #renderRow(parent, index) {

        // Initialize selector array for this row
        this.#rowSelectors[index] = [];

        // Convert index to string
        const indexString = index.toString(10);

        // Create row element for fields
        const row = document.createElement('div');
        row.className = 'app-data-table-row';

        // Assign row index data attribute
        row.dataset.row = indexString;

        /** Field map. @type {AppDataTableFieldMap} */
        const fields = {};

        // Loop through field templates
        for (const template of this.#fieldTemplates) {

            // Clone the template element
            const clone = template.cloneNode(true);

            // Append row index suffix to clone id
            clone.id = `${template.id}-${indexString}`;

            // Clear text content
            clone.textContent = null;

            // Check if template is row selector
            if (template === this.#selectorTemplate) {

                // Append cloned row selector to cache
                this.#rowSelectors[index].push(clone);

                // Handle clone row selection toggle
                clone.addEventListener('click', event => {

                    // Detect shift-click for range selection
                    const isShift = event.shiftKey === true;

                    // Check for range selection using shift-clicking
                    if (isShift && this.#lastSelectedIndex !== null) {

                        this.setRowSelectedRange(index, this.#lastSelectedIndex, clone.checked);
                    }

                    // Else apply normal single-row toggle
                    else {

                        // Set selection state for this row
                        this.setRowSelected(index, clone.checked);
                    }

                    // Track last selected index for future shift-click operations
                    this.#lastSelectedIndex = index;
                });
            }

            // Store cloned element in fields map under original key
            fields[template.id] = clone;

            // Append cloned element to row container
            row.appendChild(clone);
        }

        // Apply field population transform
        if (typeof this.transform === 'function') this.transform(this.rows, fields, index);

        // Cache row element
        this.#rowElements.push(row);

        // Append row to parent
        parent.appendChild(row);
    }

    /**
     * Sets selection state for a single row and updates selectors and CSS class.
     *
     * @param {number} index - row index
     * @param {boolean} selected - selection state
     *
     * @returns void
     */
    setRowSelected(index, selected) {

        // Apply the selection state
        this.#setRowSelected(index, selected);

        // Notify external listeners of the updated selection
        if (this.onSelectionChange) this.onSelectionChange([...this.selectedRows]);
    }

    /**
     * Sets selection state for a range of rows and updates selectors and CSS class.
     *
     * @param {number} start - row start index
     * @param {number} end - row end index
     * @param {boolean} selected - selection state
     *
     * @returns void
     */
    setRowSelectedRange(start, end, selected) {

        // Check if start index greater than end
        if (start > end) {

            // Swap start and end indexes
            const swap = start;
            start = end;
            end = swap
        }

        // Select all rows in the range
        for (let i = start; i <= end; i++) {

            // Apply selection to each row in range
            this.#setRowSelected(i, selected);
        }

        // Notify external listeners of the updated selection
        if (this.onSelectionChange) this.onSelectionChange([...this.selectedRows]);
    }

    /**
     * Selects all rows and updates selector checkboxes.
     *
     * @returns void
     */
    selectAll() {

        // Reset selected rows before applying selection
        this.selectedRows = [];

        // Select every row
        for (let i = 0; i < this.#rowSelectors.length; i++) this.#setRowSelected(i, true);

        // Ensure heading selector reflects the new selection state
        if (this.#headingSelector) this.#headingSelector.checked = true;

        // Notify external listeners of the updated selection
        if (this.onSelectionChange) this.onSelectionChange([...this.selectedRows]);
    }

    /**
     * Unselects all rows and updates selector checkboxes.
     *
     * @returns void
     */
    unselectAll() {

        // Reset selected rows before clearing selection
        this.selectedRows = [];

        // Unselect every row
        for (let i = 0; i < this.#rowSelectors.length; i++) this.#setRowSelected(i, false);

        // Ensure heading selector reflects the cleared selection state
        if (this.#headingSelector) this.#headingSelector.checked = false;

        // Notify external listeners of the updated selection
        if (this.onSelectionChange) this.onSelectionChange([...this.selectedRows]);
    }

    /**
     * Toggles selection state of a single row.
     *
     * @param {number} index - row index
     *
     * @returns void
     */
    toggleRow(index) {

        // Determine whether the row is currently selected
        const isSelected = this.selectedRows.includes(index);

        // Apply the opposite selection state
        this.setRowSelected(index, !isSelected);
    }

    /**
     * Sets selection state for a single row and updates selectors and CSS class.
     *
     * @param {number} index - row index
     * @param {boolean} selected - selection state
     *
     * @returns void
     *
     * @private
     */
    #setRowSelected(index, selected) {

        // Ignore out-of-range indices
        if (index < 0 || index >= this.#rowSelectors.length) return;

        // Update all selector checkboxes for this row
        const selectors = this.#rowSelectors[index];
        for (const checkBox of selectors) checkBox.checked = selected;

        // Maintain selectedRows list
        if (selected) {

            // Add row index if not already selected
            if (!this.selectedRows.includes(index)) this.selectedRows.push(index);
        }

        else {

            // Remove row index if present
            const pos = this.selectedRows.indexOf(index);
            if (pos !== -1) this.selectedRows.splice(pos, 1);
        }

        // Update row styling to reflect selection state
        const rowEl = this.#rowElements[index];
        if (rowEl) {

            if (selected) {
                rowEl.classList.add('app-table-selected-row');
            } else {
                rowEl.classList.remove('app-table-selected-row');
            }
        }

        // Sync heading selector with overall selection state
        if (this.#headingSelector) {

            if (this.selectedRows.length === this.rows.length) {
                this.#headingSelector.checked = true;
            } else {
                this.#headingSelector.checked = false;
            }
        }
    }

    /**
     * Render sorted rows.
     * 
     * @param {HTMLDivElement} element - the sort element
     * @param {*} ascending - true if sort ascending
     */
    renderSortedRows(element, ascending) {

        // Unselect all rows
        this.unselectAll();

        // Loop through sort elements
        for (const sortElement of this.#sortElements) {

            // Check if found element being sorted 
            if (sortElement === element) {

                // Check if display sort ascending
                if (ascending) {

                    // Display ascending sort symbol
                    sortElement.textContent = '▲';

                    // Mark sort order ascending
                    sortElement.dataset.order = 'ascending';
                }

                // Else display sort descending
                else {

                    // Display descending sort symbol
                    sortElement.textContent = '▼';

                    // Mark sort order descending
                    sortElement.dataset.order = 'descending';
                }
            }

            // Else element is not being sorted
            else {

                // Clear sort symbol
                sortElement.textContent = '';

                // Mark sort order unknown
                sortElement.dataset.order = 'unknown';
            }
        }

        // Clear the table body
        this.#removeAllChildren(this.#bodyElement);

        // Render the table body sorted rows
        this.#renderRows(this.#bodyElement);
    }

    /**
     * Sort ascending.
     * 
     * @param {HTMLElement} element - heading field sort element
     */
    sortAscending(element) {

        // Call sort callback function if available for element
        if (typeof this.sort === 'function' &&
            this.sort(this.rows, element.parentElement.id, true)) {

            // Render sorted rows
            this.renderSortedRows(element, true);
        }
    }

    /**
     * Sort descending.
     * 
     * @param {HTMLElement} element - heading field sort element
     */
    sortDescending(element) {

        // Call sort callback function if available for element
        if (typeof this.sort === 'function' &&
            this.sort(this.rows, element.parentElement.id, false)) {

            // Render sorted rows
            this.renderSortedRows(element, false);
        }
    }

    /**
     * Handle on click selector event.
     * 
     * @param {import('../util/HtmlUtil.mjs').HTMLCheckboxElement} element - the trigger element
     * @returns {void}
     */
    #handleOnClickSelector(element) {

        // Check if select all checked
        if (element.checked) {

            // Select all rows
            this.selectAll();
        }

        // Else select all was unchecked
        else {

            // Unselect all rows
            this.unselectAll();
        }
    }

    /**
     * Handle on click heading event.
     * 
     * @param {Event} event - the click event
     * @param {HTMLElement} element - the trigger element
     * @returns {void}
     */
    #handleOnClickHeading(event, element) {

        // Stop event bubbling up.
        event.stopPropagation();

        // Check if column is sorted in ascending
        if (element.dataset.order === 'ascending') {

            // Toggle to sort in descending order
            this.sortDescending(element);
        }

        // Else column is sorted descending or unknown order
        else {

            // Sort ascending order
            this.sortAscending(element);
        }
    }

    /**
     * Returns an array of selected row data objects.
     *
     * @returns {T[]} selected row data
     */
    getSelectedData() {

        // Map selected row indices to their corresponding row objects
        return this.selectedRows.map(i => this.rows[i]).filter(row => row !== undefined);
    }

}

customElements.define('app-data-table', AppDataTable);