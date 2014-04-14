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