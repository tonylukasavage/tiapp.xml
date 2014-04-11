var U = require('./util'),
	xmldom = require('xmldom');

/**
 * Creates an instance of ItemGroup, generally to represent modules or plugins
 * @constructor
 *
 * @param {Object} doc The XML document object to be used with this item group
 * @param {String} groupName The node name of the XML element containing the items
 * @param {String} [itemName] The node name of the item XML element. Defaults to the groupName
 *                            without a trailing "s" character.
 *
 * @property {Object} doc The XML document object to be used with this item group
 * @property {String} groupName The node name of the XML element containing the items
 * @property {String} itemName The node name of the item XML element
 *
 * @returns {Tiapp} An instance of {@link ItemGroup}
 */
function ItemGroup(doc, groupName, itemName) {
	this.doc = doc;
	this.groupName = groupName;
	this.itemName = itemName || groupName.replace(/s$/, '');
}

/**
 * Get an array of items from the ItemGroup
 *
 * @param {String|Object} [obj] A filter to be used for determining which items to return. If
 *                              undefined, it returns all items. If a string, it will return all
 *                              items with an id matching that string. If an object, it will
 *                              return the modules that match all properties listed in the object.
 *
 * @returns {Array} An array of items
 */
ItemGroup.prototype.get = function(obj) {
	var items = [],
		group = this.doc.documentElement.getElementsByTagName(this.groupName);

	// get the last instance of the group, or return if there is none
	if (!group || group.length === 0) {
		return items;
	}
	group = group.item(group.length-1);

	// iterate through all child nodes of the group
	for (var i = 0, len = group.childNodes.length; i < len; i++) {
		var node = group.childNodes.item(i);

		// make sure it's an actual element
		if (node.nodeType !== 1) {
			continue;
		}

		// get all
		if (!obj) {
			items.push(nodeToItem(node));

		// get by id
		} else if (U.isString(obj)) {
			if (getNodeText(node) === obj) {
				items.push(nodeToItem(node));
			}

		// filter by given properties
		} else if (U.isObject(obj)) {
			if ((obj.id && (obj.id !== getNodeText(node))) ||
				(obj.version && (obj.version !== node.getAttribute('version'))) ||
				(obj.platform && (obj.platform !== node.getAttribute('platform')))) {
				continue;
			}
			items.push(nodeToItem(node));

		// bad arugment
		} else {
			throw new Error('Bad argument');
		}

	}

	return items;
};

/**
 * Get add an items or items to the ItemGroup
 *
 * @param {String|Object|Array} obj The item or items to be added to the ItemGroup. If a string, it will add
 *                                  an item using the string as its id. If it is an object, it uses the
 *                                  properties of that object to compose the item. If it is an array, it
 *                                  performs a series of add() calls on its elements.
 * @param {Object} [opts={}] Options for configuring the behavior of the add() call
 * @param {Boolean} [opts.duplicates=false] If true, allow duplicate items in the ItemGroup
 * @param {Boolean} [opts.fail=false] If true, throws an error if a duplicate is encountered
 *
 * @returns {Array} An array of items
 */
ItemGroup.prototype.add = function(items, opts) {
	opts = opts || {};
	var existing = [];

	// skip empty object
	if (!items) {
		throw new Error('Bad argument');
	} else if (!U.isArray(items)) {
		items = [items];
	} else if (items.length === 0) {
		return;
	}

	// find the item group
	var self = this,
		doc = this.doc,
		root = doc.documentElement;

	// see if group exists
	var group = root.getElementsByTagName(this.groupName);
	if (group.length > 0) {
		group = group.item(group.length-1);

		// get list of existing items
		for (var i = 0, len = group.childNodes.length; i < len; i++) {
			var child = group.childNodes.item(i);
			if (child.nodeType !== 1) {
				continue;
			}
			existing.push(nodeToItem(child));
		}
	} else {
		group = doc.createElement(this.groupName);
		root.appendChild(group);
	}

	// add a new item to the group
	items.forEach(function(item) {

		// validate item
		if (!item) {
			throw new Error('Bad argument');
		} else if (U.isString(item)) {
			item = { id: item };
		} else if (!U.isObject(item) || !item.id) {
			throw new Error('Bad argument');
		}

		// check for duplicates, if necessary
		if (!opts.duplicates) {
			for (i = 0; i < existing.length; i++) {
				var ex = existing[i];
				if ((item.id === ex.id) &&
						((!ex.platform && !item.platform) || (item.platform === ex.platform))
				) {
					if (opts.fail) {
						throw new Error('Attempted to add duplicate module: ' + JSON.stringify(item));
					} else {
						return;
					}
				}
			}
		}

		// create item node
		var node = doc.createElement(self.itemName),
			text = doc.createTextNode(item.id),
			value;
		if (item.platform) {
			node.setAttribute('platform', item.platform.toString());
		}
		if (item.version) {
			node.setAttribute('version', item.version.toString());
		}
		node.appendChild(text);

		// add to group
		group.appendChild(node);

	});

};

function nodeToItem(node) {
	var item = {
		id: getNodeText(node)
	};
	if (node.hasAttribute('platform')) {
		item.platform = node.getAttribute('platform');
	}
	if (node.hasAttribute('version')) {
		item.version = node.getAttribute('version');
	}
	return item;
}

function getNodeText(node) {
	if (!node) { return ''; }
	var serializer = new xmldom.XMLSerializer(),
		str = '';
	for (var c = 0; c < node.childNodes.length; c++) {
		if (node.childNodes[c].nodeType === 3) {
			str += serializer.serializeToString(node.childNodes[c]);
		}
	}
	return str.replace(/\&amp;/g,'&');
}

module.exports = ItemGroup;