var util = require('util');

function TiappError(message, data) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.message = message || '';
	this.name = 'TiappError';
	this.data = data;
}
util.inherits(TiappError, Error);

module.exports = TiappError;