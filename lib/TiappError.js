var util = require('util');

/**
 * Creates an instance of TiappError
 * @constructor
 * @augments Error
 *
 * @example
 * try {
 *   throw new TiappError('message', { foo: 123 });
 * } catch (e) {
 *   console.log(e.message === 'message' && e.data.foo === 123); // true
 * }
 *
 * @param {String} [message] The message describing the error
 * @param {*} [data] Additional data associated with the error
 *
 * @property {*} data Additional data associated with the error
 * @property {String} message The message describing the error
 * @property {Object} stack Stack trace for the error
 * @property {String} type The error type
 *
 * @returns {TiappError} An instance of {@link TiappError}
 */
function TiappError(message, data) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.message = message || '';
	this.name = 'TiappError';
	this.data = data;
}
util.inherits(TiappError, Error);

module.exports = TiappError;