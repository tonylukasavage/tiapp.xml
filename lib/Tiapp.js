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

	// get the <target>
	var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
	if (target) {
		return xml.getNodeText(target) === 'true' ? true : false;
	}
	return null;
};

Tiapp.prototype.setDeploymentTarget = function setDeploymentTarget(platform, value) {
	var targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets'),
		targets = targetsContainer.getElementsByTagName('target');

	var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
	if (target) {
		xml.setNodeText(target, value.toString());
	}
};

Tiapp.prototype.getProperty = function getProperty(name) {
	var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
	if (property) {
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
	var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
	if (property) {
		if (type) {
			property.setAttribute('type', type);
		}
		xml.setNodeText(property, value.toString());
		return;
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

Tiapp.prototype.removeProperty = function removeProperty(name) {
	var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
	if (property) {
		this.doc.documentElement.removeChild(property);
	}
};

Tiapp.prototype.getModules = function getModules() {
	var results = [];
	var modulesContainer = xml.getLastElement(this.doc.documentElement, 'modules');
	if (!modulesContainer) {
		return results;
	}

	var modules = modulesContainer.getElementsByTagName('module');
	for (var i = 0, len = modules.length; i < len; i++) {
		var mod = modules.item(i),
			result = { id: xml.getNodeText(mod) };

		if (mod.hasAttribute('version')) { result.version = mod.getAttribute('version'); }
		if (mod.hasAttribute('platform')) { result.platform = mod.getAttribute('platform'); }
		results.push(result);
	}

	return results;
};

Tiapp.prototype.setModule = function setModule(id, version, platform) {
	if (U.isObject(version)) {
		var opts = version;
		platform = opts.platform;
		version = opts.version;
	}

	var modulesContainer = xml.ensureElement(this.doc.documentElement, 'modules');
	var modules = modulesContainer.getElementsByTagName('module');
	var found = false;

	// try to update an existing module entry
	for (var i = 0, len = modules.length; i < len; i++) {
		var mod = modules.item(i);
		if (xml.getNodeText(mod) === id &&
			((!mod.hasAttribute('platform') && !platform) || (mod.getAttribute('platform') === platform))) {
			if (version) {
				mod.setAttribute('version', version.toString());
			} else {
				mod.removeAtrribute('version');
			}
			found = true;
		}
	}

	// if it's not an update, create a new module entry
	if (!found) {
		var elem = this.doc.createElement('module');
		if (platform) { elem.setAttribute('platform', platform); }
		if (version) { elem.setAttribute('version', version.toString()); }
		elem.appendChild(this.doc.createTextNode(id));
		modulesContainer.appendChild(elem);
	}
};

module.exports = Tiapp;
