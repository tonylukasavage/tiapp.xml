var constants = require('./constants'),
	fs = require('fs'),
	ItemGroup = require('./ItemGroup'),
	U = require('./util'),
	xml = require('./xml');

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
				xml.setNodeText(xml.ensureElement(self.doc.documentElement, prop), val);
			}
		};

		// create property based on property name
		Object.defineProperty(self, prop, topLevelObject);

		// see if we need a camel case version as well
		if (prop.indexOf('-') !== -1) {
			Object.defineProperty(self, U.dashToCamelCase(prop), topLevelObject);
		}
	});
}

Tiapp.prototype.write = function write(file) {
	file = file || this.file;
	fs.writeFileSync(file, xml.nodeToString(this.doc));
};

Tiapp.prototype.getDeploymentTarget = function getDeploymentTarget(platform) {
	if (!platform) {
		return null;
	}

	// make sure we have <deployment-targets>
	var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
	if (!targetsContainer) {
		return null;
	}

	// find the `platform` deployment target
	var targets = targetsContainer.getElementsByTagName('target');
	for (var i = 0, len = targets.length; i < len; i++) {
		var target = targets.item(i);
		if (target.hasAttribute('device') && target.getAttribute('device') === platform) {
			return xml.getNodeText(target) === 'true' ? true : false;
		}
	}

	return null;
};

Tiapp.prototype.setDeploymentTarget = function setDeploymentTarget(platform, value) {
	var targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets'),
		targets = targetsContainer.getElementsByTagName('target');

	for (var i = 0, len = targets.length; i < len; i++) {
		var target = targets.item(i);
		if (target.hasAttribute('device') && target.getAttribute('device') === platform) {
			xml.setNodeText(target, value.toString());
			return;
		}
	}
};

Tiapp.prototype.getProperty = function getProperty(name) {
	var properties = this.doc.documentElement.getElementsByTagName('property');
	for (var i = 0, len = properties.length; i < len; i++) {
		var property = properties.item(i);
		if (property.hasAttribute('name') && property.getAttribute('name') === name) {
			var value = xml.getNodeText(property),
				type = property.hasAttribute('type') ? property.getAttribute('type') : 'string';

			// convert value based on type
			if (type === 'bool') {
				value = value === 'true';
			} else if (type === 'int') {
				value = parseInt(value, 10);
			} else if (type === 'double') {
				value = parseFloat(value);
			}

			return value;
		}
	}
	return null;
};

Tiapp.prototype.setProperty = function(name, type, value) {
	var len = arguments.length, i;
	if (!name) {
		throw new Error('name must be defined');
	} else if (len === 1) {
		value = '';
	} else if (len === 2) {
		value = type;
	}

	// try to update existing property element
	var properties = this.doc.documentElement.getElementsByTagName('property');
	for (i = 0, len = properties.length; i < len; i++) {
		var property = properties.item(i);
		if (property.hasAttribute('name') && property.getAttribute('name') === name) {
			if (type) {
				property.setAttribute('type', type);
			}
			xml.setNodeText(property, value.toString());
			return;
		}
	}

	// create a new property
	var elem = this.doc.createElement('property');
	elem.setAttribute('name', name);
	if (type) {
		elem.setAttribute('type', type);
	}
	elem.appendChild(this.doc.createTextNode(value.toString()));
	this.doc.documentElement.appendChild(elem);
};

module.exports = Tiapp;
