> **NOT YET FUNCTIONAL. API STILL IN DESIGN.**

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

### load(file)

Load a tiapp.xml file and return a Tiapp object. If `file` is undefined, [find()]() will attempt to locate a tiapp.xml file.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
```

### parse(xmlString, filename)

Parse an xml string as a tiapp.xml document. This is used by `load()` and generally isn't used directly. `filename` is optional, and is used only as a default value if you attempt to [Tiapp.write()]() later.

```js
var tiapp = require('tiapp.xml').parse('<ti:app><!-- the rest of the tiapp.xml --></ti:app>');
```

### find()

Find a tiapp.xml file and return its file path. It will start by searching the current working directory for a tiapp.xml file. If it doesn't find it, it will continue to move up the folder hierarchy attempting to find tiapp.xml files. If it never finds a tiapp.xml, it returns `null`.

```js
var pathToTiappXml = require('tiapp.xml').find();
```

### top-level elements

Get and set [top-level tiapp.xml elements](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-TopLevelElements) directly as properties. These properties can be referenced in dash form or camel case. For example, to work with the `sdk-version` you can use either `tiapp['sdk-version']` or `tiapp.sdkVersion`.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// prints the name and guid of the app
console.log(tiapp.name + ': ' + tiapp.guid);

// disable analytics
tiapp.analytics = false;

// change the sdk version
tiapp['sdk-version'] = '3.2.2.GA';

// write the changes to the tiapp.xml
tiapp.write();
```

### deployment-targets

Get and set [deployment targets](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-deployment-target) directly as properties. You can access them via `tiapp['deployment-targets']` or `tiapp.deploymentTargets`.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

tiapp.deploymentTargets.android = true;
tiapp.deploymentTargets.blackberry = false;
tiapp.deploymentTargets.mobileweb = false;

// set ios devices individually
tiapp.deploymentTargets.iphone = true;
tiapp.deploymentTargets.ipad = true;

// or set both iphone and ipad at once
tiapp.deploymentTargets.ios = true;

// write out the changes
tiapp.write();
```

### properties

You can get, set, and delete [application properties](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties).

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// set with a type and value
tiapp.property('name', 'type', 'value');

// set with just a value
tiapp.property('name', 'value');

// get the property's value
tiapp.property('name');

// delete a property
tiapp.removeProperty('name');
```

### modules

### plugins

### cloud/acs

### platform-specific sections



then open `doc/index.html` in a web browser
