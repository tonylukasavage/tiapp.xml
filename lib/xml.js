var xmldom = require('xmldom');

// TODO: trim
exports.getNodeText = function getNodeText(node) {
	if (!node) { return ''; }
	var serializer = new xmldom.XMLSerializer(),
		str = '';
	for (var c = 0; c < node.childNodes.length; c++) {
		if (node.childNodes[c].nodeType === 3) {
			str += serializer.serializeToString(node.childNodes[c]);
		}
	}
	return str.replace(/\&amp;/g,'&');
};

exports.setNodeText = function setNodeText(node, val) {
	if (!node) {
		return;
	}

	var doc = node.ownerDocument,
		children = node.childNodes;

	// find and replace the text node
	for (var i = 0, len = children.length; i < len; i++) {
		var child = children.item(i);
		if (child.nodeType === 3) {
			node.replaceChild(doc.createTextNode(val), child);
			return;
		}
	}

	// Didn't find it? Create it.
	node.appendChild(doc.createTextNode(val));
};

exports.getTagText = function getTagText(node, name) {
	var nodes = node.getElementsByTagName(name);
	if (nodes && nodes.length) {
		return exports.getNodeText(nodes.item(nodes.length-1));
	} else {
		return null;
	}
};

exports.nodeToString = function nodeToString(node) {
	return (new xmldom.XMLSerializer()).serializeToString(node);
};

exports.parseFromString = function parseFromString(str) {
	return new xmldom.DOMParser().parseFromString(str);
};

exports.getLastElement = function getLastElement(node, name) {
	var nodes = node.getElementsByTagName(name);
	return nodes && nodes.length > 0 ? nodes.item(nodes.length-1) : null;
};

exports.getElementWithAttribute = function getElementWithAttribute(node, name, attr, value) {
	var elems = this.doc.documentElement.getElementsByTagName(name);
	for (var i = 0, len = elems.length; i < len; i++) {
		var elem = elems.item(i);
		if (elem.hasAttribute(attr) && elem.getAttribute(attr) === value) {
			return elem;
		}
	}
	return null;
};

exports.ensureElement = function ensureElement(node, name) {
	var elem = exports.getLastElement(node, name);
	if (!elem) {
		elem = node.ownerDocument.createElement(name);
		node.appendChild(elem);
	}
	return elem;
};

exports.removeAllChildren = function removeAllChildren(node) {
	for (var i = node.childNodes.length-1; i >= 0; i--) {
		node.removeChild(node.childNodes.item(i));
	}
};
