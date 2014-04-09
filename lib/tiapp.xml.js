var fs = require('fs'),
	path = require('path'),
	xmldom = require('xmldom');

module.exports = Tiapp;

/**
 * Creates a new Tiapp object
 * @constructor
 *
 * @param {String} [file=./tiapp.xml] Path to the tiapp.xml file
 *
 * @property {String} file Path to the tiapp.xml file
 */
function Tiapp(file) {
	var self = this;

	Object.defineProperty(this, 'file', {
		get: function() {
			return file;
		},
		set: function(val) {
			file = val;
			self.parse();
		}
	});

	/** The file location of the tiapp.xml */
	this.file = file || this.find();
}

Tiapp.prototype.parse = function parse(file) {
	// let the setter do its job
	if (file) {
		this.file = file;
		return;
	}

	/** The XML document object used by Tiapp */
	this.doc = new xmldom.DOMParser().parseFromString(fs.readFileSync(file, 'utf8'));
};

Tiapp.prototype.find = function find() {
	var cwd = process.cwd(),
		parts = cwd.split(path.sep);

	for (var i = 1, len = parts.len; i <= len; i++) {
		var p = path.join.apply(null, parts.slice(0, len-i).concat('tiapp.xml'));
		console.log(p);
	}
};
