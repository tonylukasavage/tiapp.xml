var constants = require('./constants'),
	fs = require('fs'),
	ItemGroup = require('./ItemGroup'),
	path = require('path'),
	TiappError = require('./TiappError'),
	U = require('./util'),
	xml = require('./xml');

exports.find = function find() {
	var cwd = process.cwd(),
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
		throw new TiappError('Bad argument. xml must be a string.', str);
	}

	// parse the xml
	var doc = xml.parseFromString(str);

	// make sure it's actually a tiapp.xml
	if (!doc || !doc.documentElement) {
		throw new TiappError('No XML document created', str);
	} else if (doc.documentElement.nodeName !== 'ti:app') {
		throw new TiappError('Parsed XML is not a tiapp.xml', str);
	}

	// create an instance of Tiapp
	return new Tiapp(file, doc);
};

exports.load = function load(file) {

	// make sure we have a file
	if (typeof file !== 'undefined' && !U.isString(file)) {
		throw new TiappError('Bad argument. If defined, file must be a string.', file);
	}
	file = file || exports.find();
	if (!file || (file && !fs.existsSync(file))) {
		throw new TiappError('tiapp.xml not found', file);
	}

	// parse the file
	return exports.parse(fs.readFileSync(file, 'utf8'), file);
};

function Tiapp(file, doc) {
	var self = this;

	this.file = file;
	this.doc = doc;

	// set default doc for xml.js
	xml.doc = this.doc;

	// create top-level element getters/setters
	constants.topLevelElements.forEach(function(prop) {
		var topLevelObject = {
			get: function() {
				return xml.getTagText(self.doc.documentElement, prop);
			},
			set: function(val) {
				xml.setNodeText(self.doc.documentElement, prop, val);
			}
		};

		// create property based on property name
		Object.defineProperty(self, prop, topLevelObject);

		// see if we need a camel case version as well
		if (prop.indexOf('-') !== -1) {
			Object.defineProperty(self, U.dashToCamelCase(prop), topLevelObject);
		}
	});

	this.modules = new ItemGroup(this.doc, 'modules');
	this.plugins = new ItemGroup(this.doc, 'plugins');

	this.property = {

	};




	// deployment-target

	// property
}

Tiapp.prototype.write = function write(file) {
	file = file || this.file;
	fs.writeFileSync(file, xml.nodeToString(this.doc));
};

Tiapp.prototype.getDeploymentTarget = function getDeploymentTarget(platform) {
	if (!platform) {
		return null;
	}
}
