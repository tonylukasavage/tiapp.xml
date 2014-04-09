var path = require('path'),
	should = require('should'),
	Tiapp = require('..');

var INVALID_TIAPP_ARGS = [123, function(){}, [1,2,3], true, false, NaN, Infinity, null],
	VALID_TIAPP_ARGS = [undefined, './tiapp.xml'],
	TIAPP_XML = path.join('fixtures', 'tiapp.xml');

describe('tiapp.xml.js', function() {

	it('should create Tiapp with no tiapp.xml', function() {
		var tiapp = new Tiapp();
		should.exist(tiapp.parse);
		tiapp.parse.should.be.a.function;
	});

	it('should create Tiapp with explicit tiapp.xml', function() {
		var tiapp = new Tiapp();
	});

	INVALID_TIAPP_ARGS.forEach(function(arg) {
		it('should throw when calling Tiapp(' + toString(arg) + ')', function() {
			(function() {
				var tiapp = new Tiapp(arg);
			}).should.throw(/Bad argument/);
		});
	});

});

function toString(o) {
	if (o !== o) {
		return 'NaN';
	} else if (Array.isArray(o)) {
		return '[' + o.toString() + ']';
	} else if (o === null) {
		return 'null';
	} else {
		return o !== null ? o.toString() : Object.prototype.toString.call(o);
	}
}