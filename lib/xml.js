var xmldom = require('xmldom');

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

exports.nodeToString = function nodeToString(node) {
	return (new xmldom.XMLSerializer()).serializeToString(node);
};

exports.parseFromString = function parseFromString(str) {
	return new xmldom.DOMParser().parseFromString(str);
};

exports.setTextNode = function setTextNode(name, val, node, doc) {
	var nodes = node.getElementsByTagName(name);

	// get rid of existing node(s)
	for (var i = nodes.length; i >= 0; i--) {
		if (nodes[i]) {
			node.removeChild(nodes[i]);
		}
	}

	// create new element and text
	var textElem = doc.createElement(name);
	textElem.appendChild(doc.createTextNode(val));
	node.appendChild(textElem);

	return textElem;
};