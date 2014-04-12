> **NOT YET FUNCTIONAL**

# tiapp.xml [![Build Status](https://travis-ci.org/tonylukasavage/tiapp.xml.svg?branch=master)](https://travis-ci.org/tonylukasavage/tiapp.xml) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A node.js parsing and manipulation API module for Appcelerator's [Titanium](http://www.appcelerator.com/titanium/) tiapp.xml configuration file.

## Example

```js
var tiappXml = require('tiapp.xml');

// load the Tiapp object from a tiapp.xml file
var tiapp = tiappXml.load('/path/to/tiapp.xml');

// print a list of existing modules
tiapp.modules.get().forEach(function(mod) {
	console.log(JSON.stringify(mod))
});

// add a new module
tiapp.modules.add({
	id: 'foo',
	version: '2.2',
	platform: 'android'
});

// now add a plugin
tiapp.plugins.add({
	id: 'ti.alloy',
	version: '1.0'
});

// write the tiapp.xml back to the original file
tiapp.write();
```

## API

### [http://tonylukasavage.github.io/tiapp.xml](http://tonylukasavage.github.io/tiapp.xml)

## Generating Docs

```bash
$ npm install -g grunt-cli
$ cd /path/to/tiapp.xml
$ npm install
$ grunt jsdoc
```

then open `doc/index.html` in a web browser
