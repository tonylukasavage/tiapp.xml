> **NOT YET FUNCTIONAL**

# tiapp.xml [![Build Status](https://travis-ci.org/tonylukasavage/tiapp.xml.svg?branch=master)](https://travis-ci.org/tonylukasavage/tiapp.xml) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A node.js parsing and manipulation API module for Appcelerator's [Titanium](http://www.appcelerator.com/titanium/) tiapp.xml configuration file.

## Example

```js
var tiappXml = require('tiapp.xml');

var tiapp = tiappXml.load('/path/to/tiapp.xml');

// add a new module
tiapp.modules.add({
	id: 'foo',
	version: '2.2'
});

tiapp.write();
```

## API

Generate it yourself, then open `doc/index.html` in a web browser.

```bash
$ npm install -g grunt-cli
$ grunt jsdoc
```
