var should = require('should'),
	Tiapp = require('.../lib/tiapp.xml');

describe('tiapp.xml.js', function() {

	it('should find tiapp.xml files given a path', function() {
		var tiapp = new Tiapp();
		tiapp.find();
	});

});