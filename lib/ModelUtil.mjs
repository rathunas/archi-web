/**
 * @module ModelUtil
 * Server side design model utilities.
 */

import { randomUUID } from 'crypto'; // Cryptographic utilities
import { xml2js } from 'xml-js'; // XML utilities
import { list } from '../lib/FileUtil.mjs'; // File utilities
import { validatePackageName, validateVersionMs } from '../static/util/ModelUtil.mjs'; // Client side model utilities

export {
    validateArchimateFilename,
    validatePackageName,
    validateVersionMs
} from '../static/util/ModelUtil.mjs'; // Re-export client side design model utilities

/**
 * Determine if a filesystem entry is a model design package folder.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - the filesystem entry metadata
 * @returns {boolean} true if the entry name matches the model design package name format, otherwise false
 */
export function isPackageNameFolder(entry) {

    // Return false if package name is invalid
    try { validatePackageName(entry.name); }
    catch (err) { return false; }

    // Else return true
    return true;
}

/**
 * Determine if a filesystem entry is a model design package version folder.
 * 
 * @param {import('../../lib/FileUtil.mjs').FileSystemEntry} entry - the filesystem entry metadata
 * @returns {boolean} true if the entry name matches the model design package version format, otherwise false
 */
export function isVersionMsFolder(entry) {

    // Return false if version is invalid
    try { validateVersionMs(entry.name); }
    catch (err) { return false; }

    // Else return true
    return true;
}

/**
 * Validate version timestamp in milliseconds and return string.
 * 
 * @param {string|number} value - version timestamp in milliseconds
 * @returns {string} version timestamp in milliseconds as string
 */
export function validateVersionMsReturnString(value) {

    // Validate version timestamp in milliseconds and return string
    return validateVersionMs(value).toString(10);
}

/**
 * Get latest version timestamp in milliseconds for a model package directory.
 * 
 * @param {string} dir - model package directory containing version folders
 * @returns {number|undefined}
 */
export function getLatestVersionMs(dir) {

    /** Array of version timestamps. @type {number[]} */
    const versions = list({
        dir,
        filter: isVersionMsFolder,
        transform: (entry) => Number(entry.name)
    });

    // Return latest version or undefined
    return versions.sort().pop();
}

/**
 * A string representing a mode identifier in canonical form. All
 * model key values begin with the literal prefix "id-" followed by a
 * lowercase hexadecimal sequence with no hyphens. The sequence is typically
 * derived from a UUID with hyphens removed. Model id values are opaque
 * tokens used only for identity and reference within model.xml.
 * 
 * @typedef {`id-${string}`} ModelKey
 */

/**
 * Generate a new model element identifier.
 * 
 * @returns {ModelKey} the new model element identifier
 */
export function generateId() {

    // Return new model element identifier
    return 'id-' + randomUUID().replace(/-/g, '').toLowerCase();
}

/**
 * A mapping object whose keys are existing model element identifiers and
 * whose values are newly generated model element identifiers. This map is
 * used to ensure that every template-marked element and all of its
 * descendants receive a unique replacement identifier during download.
 * 
 * @typedef {Record<ModelKey, ModelKey>} ModelMapId
 */

/**
 * Replace IDs for all template-marked elements and their descendants.
 *
 * @param {string} xml - the original model.xml content
 * @returns {string} the transformed XML with regenerated IDs
 */
export function replaceTemplateIds(xml) {

    // Parse XML into JSON structure
    const json = xml2js(xml, { compact: false });

    /** Map of old IDs to new IDs @type {ModelMapId} */
    const idMap = Object.create(null);

    /**
     * Determine if any child of a parent node has a template property.
     * 
     * @param {import('xml-js').Element} node - the parent node
     * @returns {boolean} true if a child has a template property
     */
    function hasTemplateProperty(node) {

        // Return false if node has no children
        if (!node.elements) return false;

        // Loop through node children
        for (const child of node.elements) {

            // Check if child is a property element
            if (child.type === 'element' && child.name === 'property') {

                // Check if property element contains a template attribute
                if (child.attributes && child.attributes.key === '@Template') {

                    // Return true as child has a template property
                    return true;
                }
            }
        }

        // Return false as no children have a template property
        return false;
    }

    /**
     * Recursively walk the element tree and collect IDs to replace.
     * Mutates the `idMap` variable.
     * 
     * @param {import('xml-js').Element} node - the current element being inspected
     * @param {boolean} inheritedTemplate - true if any ancestor of this node was marked as template
     * @returns {void}
     */
    function collectTemplateIds(node, inheritedTemplate) {

        /** True if this element is template by inheritance or direct marking. */
        const isTemplate = inheritedTemplate || hasTemplateProperty(node);

        // Check if node has an ID and is template
        if (isTemplate && node.attributes && node.attributes.id) {

            // Extract the existing node ID
            const oldId = node.attributes.id;

            // Map existing node ID if not already mapped to new ID 
            if (!idMap[oldId]) idMap[oldId] = generateId();
        }

        // Check if node has children
        if (node.elements) {

            // Loop through node children
            for (const child of node.elements) {

                // Check if child is an element
                if (child.type === 'element') {

                    // Recursively process child, passing down template inheritance
                    collectTemplateIds(child, isTemplate);
                }
            }
        }
    }

    // Check if the parsed XML contains top-level elements
    if (json.elements) {

        // Loop through each top-level element in the model
        for (const root of json.elements) {

            // Check if the node is an element (not text or comment)
            if (root.type === 'element') {

                // Begin recursive template ID collection from this root
                collectTemplateIds(root, false);
            }
        }
    }

    // Loop through each old ID collected in the map
    for (const oldId of Object.keys(idMap)) {

        /** The new ID generated for this old ID. */
        const newId = idMap[oldId];

        // Replace all occurrences of the old ID with the new ID in the XML string
        xml = xml.replaceAll(oldId, newId);
    }

    // Return modified XML
    return xml;
}