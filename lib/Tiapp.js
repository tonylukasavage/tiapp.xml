var constants = require('./constants'),
	fs = require('fs'),
	ItemGroup = require('./ItemGroup'),
	U = require('./util'),
	xml = require('./xml')


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

module.exports = Tiapp;
