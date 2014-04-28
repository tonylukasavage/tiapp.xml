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

	var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
	if (!targetsContainer) {
		return null;
	}

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

module.exports = Tiapp;
