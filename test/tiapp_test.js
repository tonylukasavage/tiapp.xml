var path = require('path'),
	should = require('should'),
	Tiapp = require('..');

var INVALID_TIAPP_ARGS = [123, function(){}, [1,2,3], true, false, NaN, Infinity, null],
	VALID_TIAPP_ARGS = [undefined, './tiapp.xml'],
	TIAPP_XML = path.join('test', 'fixtures', 'tiapp.xml');

// custom assertion for Tiapp
should.Assertion.add('Tiapp', function() {
	this.params = { operator: 'to be a Tiapp object' };
	this.assert(this.obj && isFunction(this.obj.parse));
}, true);

// test suite
describe('tiapp.xml.js', function() {

	it('should create Tiapp with no tiapp.xml', function() {
		var tiapp = new Tiapp();
		tiapp.should.be.a.Tiapp;
	});

	it('should create Tiapp with explicit tiapp.xml', function() {
		var tiapp = new Tiapp(TIAPP_XML);

	});

	INVALID_TIAPP_ARGS.forEach(function(arg) {
		it('should throw when calling Tiapp(' + toString(arg) + ')', function() {
			(function() {
				var tiapp = new Tiapp(arg);
			}).should.throw(/Bad argument/);
		});
	});

});

// utils
function isFunction(o) {
	return Object.prototype.toString.call(o) === '[object Function]';
}

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