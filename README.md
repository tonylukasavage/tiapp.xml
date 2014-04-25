> **NOT YET FUNCTIONAL. API STILL IN DESIGN.**

# tiapp.xml [![Build Status](https://travis-ci.org/tonylukasavage/tiapp.xml.svg?branch=master)](https://travis-ci.org/tonylukasavage/tiapp.xml) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A node.js parsing and manipulation API module for Appcelerator's [Titanium](http://www.appcelerator.com/titanium/) tiapp.xml configuration file.

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

### Tiapp.write(file)

Write the current Tiapp object out as a tiapp.xml file to `file`. If `file` is undefined, it will use the file supplied in the inital [load()]() or [parse()]() call. If it still can't find a file, an exception with be thrown.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// disable analytics
tiapp.analytics = false;

// write out the changes to "./tiapp.xml"
tiapp.write();

// or write out to an explicit location
tiapp.write('/path/to/tiapp.xml');
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
```

### deployment-targets

Get and set [deployment targets](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-deployment-target) directly as properties. You can access them via `tiapp['deployment-targets']` or `tiapp.deploymentTargets`.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// get
tiapp.deploymentTargets.get('android');

// set
tiapp.deploymentTargets.set('android', true);
tiapp.deploymentTargets.set('blackberry', false);
tiapp.deploymentTargets.set('mobileweb', false);

// set ios devices individually
tiapp.deploymentTargets.set('iphone', true);
tiapp.deploymentTargets.set('ipad', true);

// or set both iphone and ipad at once
tiapp.deploymentTargets.set('ios', true);
```

### properties

You can get, set, and remove [application properties](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties).

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// get the property's value
tiapp.property.get('ti.ui.defaultunit');

// set with a type and value
tiapp.property.set('ti.ui.defaultunit', 'string', 'dip');

// set with just a value
tiapp.property.set('ti.ui.defaultunit', 'dip');

// delete a property
tiapp.property.remove('ti.ui.defaultunit');
```

### modules

Get, set, add, and remove modules listed in your tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
var modules = tiapp.modules.get();

// iterate through a list of modules from the tiapp.xml
modules.forEach(function(mod) {

	// access properties on module object
	console.log('name=%s,version=%s,platform=%s',
		mod.name, mod.version || '<no version>', mod.platform || '<no platform>');

	// set properties on a module
	mod.version = '2.1';
	mod.platform = 'iphone';

});

// remove a module
modules[0].remove();

// add a new module, overwrite if it already exists
tiapp.modules.add({
	name: 'ti.someModule',
	version: '1.0',
	platform: 'android'
});
```

### plugins

Get, set, add, and remove plugins listed in your tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
var plugins = tiapp.plugins.get();

// iterate through a list of modules from the tiapp.xml
plugins.forEach(function(plugin) {

	// access properties on plugin object
	console.log('name=%s,version=%s', plugin.name, plugin.version || '<no version>');

	// set properties on a plugin
	plugin.version = '1.1';

});

// remove a plugin
plugin[0].remove();

// add a new plugin, overwrite if it already exists
tiapp.plugins.add({
	name: 'ti.somePlugin',
	version: '1.0'
});
```

### platform-specific sections

> **NOT YET IMPLEMENTED**
