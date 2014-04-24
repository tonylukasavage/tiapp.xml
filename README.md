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

tiapp.guid = 'somefakeguid';

tiapp.property.set();

// write the tiapp.xml back to the original file
tiapp.write();
```

## API

### top-level elements

Get and set [top-level tiapp.xml elements](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-TopLevelElements) directly as properties.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

console.log(tiapp.name + ': ' + tiapp.guid); // prints the name and guid of the app
tiapp.analytics = false;                     // disable analytics
tiapp['sdk-version'] = '3.2.2.GA';           // change the sdk version
tiapp.write();                               // write the changes to the tiapp.xml
```

### properties

You can get, set, and delete [application properties](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties).

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

tiapp.property('name', 'type', 'value'); //set
tiapp.property('name', 'value'); //set
tiapp.property('name'); //get
tiapp.removeProperty('name'); //delete
```

### deployment-targets

Get and set [deployment targets](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-deployment-target) directly as properties.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

tiapp['deployment-targets'].blackberry = false;
```

### modules

### plugins

### cloud/acs

### [http://tonylukasavage.github.io/tiapp.xml](http://tonylukasavage.github.io/tiapp.xml)

## Generating Docs

```bash
$ npm install -g grunt-cli
$ cd /path/to/tiapp.xml
$ npm install
$ grunt jsdoc
```

then open `doc/index.html` in a web browser
