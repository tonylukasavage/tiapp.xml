var fs = require('fs'),
	path = require('path'),
	Tiapp = require('./Tiapp'),
	U = require('./util'),
	xml = require('./xml');

exports.find = function find(dir) {
	var cwd = dir || process.cwd(),
		parts = cwd.split(path.sep);

	// remove empty element
	if (parts[0] === '') {
		parts.shift();
	}

	// iterate up through hierarchy to try and find a tiapp.xml
	for (var i = 0, len = parts.length; i < len; i++) {
		var p = (/^win/.test(process.platform) ? '' : path.sep) +
			path.join.apply(path, parts.slice(0, len-i).concat('tiapp.xml'));
		if (fs.existsSync(p) && fs.statSync(p).isFile()) {
			return p;
		}
	}

	return null;
};

exports.parse = function parse(str, file) {

	// make sure xml is a string
	if (!str || !U.isString(str)) {
		throw new Error('Bad argument. xml must be a string.');
	}

	// parse the xml
	var doc = xml.parseFromString(str);

	// make sure it's actually a tiapp.xml
	if (!doc || !doc.documentElement) {
		throw new Error('No XML document created', str);
	} else if (doc.documentElement.nodeName !== 'ti:app') {
		throw new Error('Parsed XML is not a tiapp.xml', str);
	}

	// create an instance of Tiapp
	return new Tiapp(file, doc);
};

exports.load = function load(file) {

	// make sure we have a file
	if (typeof file !== 'undefined' && !U.isString(file)) {
		throw new Error('Bad argument. If defined, file must be a string.');
	}
	file = file || exports.find();
	if (!file || (file && !fs.existsSync(file))) {
		throw new Error('tiapp.xml not found');
	}

	// parse the file
	return exports.parse(fs.readFileSync(file, 'utf8'), file);
};
