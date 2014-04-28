exports.toString = function toString(o) {
	if (typeof o === 'undefined') {
		return 'undefined';
	} else if (o !== o) {
		return 'NaN';
	} else if (Array.isArray(o)) {
		return '[' + o.toString() + ']';
	} else if (o === null) {
		return 'null';
	} else {
		return o !== null ? o.toString() : Object.prototype.toString.call(o);
	}
};

exports.dashToCamelCase = function dashToCamelCase(str) {
	var parts = str.split('-'),
		newStr = '';

	parts.forEach(function(part, i) {
		newStr += i === 0 ? part : part.substr(0,1).toUpperCase() + part.substr(1);
	});
	return newStr;
};

// The "is" functions are slight mods on underscore.js's (Jeremy Ashkenas - @jashkenas)
var types = ['Function', 'String', 'Number'];
types.forEach(function(type) {
	exports['is' + type] = function(o) {
		return Object.prototype.toString.call(o) === '[object ' + type + ']';
	};
});
exports.isArray = Array.isArray;
exports.isObject = function(o) { return o === Object(o); };
exports.isBoolean = function(o) {
	return o === true || o === false || Object.prototype.toString.call(o) === '[object Boolean]';
};
