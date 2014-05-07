# tiapp.xml [![Build Status](https://travis-ci.org/tonylukasavage/tiapp.xml.svg?branch=master)](https://travis-ci.org/tonylukasavage/tiapp.xml) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A node.js parsing and manipulation API module for Appcelerator's [Titanium](http://www.appcelerator.com/titanium/) tiapp.xml configuration file. It makes it exceedingly easy now to read and modify entries in the tiapp.xml file programmatically. No need to manually parse XML anymore, but [you can](#doc) if you so choose.

For complete details regarding tiapp.xml files, please consult Appcelerator's [full documentation](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference).



## Install [![NPM version](https://badge.fury.io/js/tiapp.xml.svg)](http://badge.fury.io/js/tiapp.xml)

```bash
$ npm install tiapp.xml
```

## Examples

### Change the Titanium SDK version

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.sdkVersion = '3.2.2.GA';
tiapp.write();
```

### Disable analytics

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.analytics = false;
tiapp.write();
```

### Add a new native module for android

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.setModule('com.tonylukasavage.someCoolModule', '1.0', 'android');
tiapp.write();
```

### Print the tiapp.xml from the tiapp object

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.doc.toString());
```

## API

* module APIs
	* [load](#loadfile)
	* [parse](#parsexmlstring-filename)
	* [find](#find)
* tiapp APIs
	* [toString](#tostring)
	* [write](#writefile)
	* [top-level elements](#top-level-elements)
	* [getDeploymentTarget](#getdeploymenttargetplatform)
	* [getDeploymentTargets](#getdeploymenttargets)
	* [setDeploymentTarget](#setdeploymenttargetplatform-value)
	* [setDeploymentTargets](#setdeploymenttargetsobj)
	* [getProperty](#getpropertyname)
	* [setProperty](#setpropertyname-value-type)
	* [removeProperty](#removepropertyname)
	* [getModules](#getmodules)
	* [setModule](#setmoduleid-version-platform)
	* [removeModule](#removemoduleid-platform)
	* [getPlugins](#getplugins)
	* [setPlugin](#setpluginid-version)
	* [removePlugin](#removepluginid)
	* [doc](#doc)

### load(file)

Load a tiapp.xml file and return a Tiapp object. If `file` is undefined, [find()](#find) will attempt to locate a tiapp.xml file.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
```

### parse(xmlString, filename)

Parse an xml string as a tiapp.xml document and return a Tiapp object. This is used by `load()` and generally isn't used directly. `filename` is optional, and is used only as a default value if you attempt to [write()](#writefile) later.

```js
var tiapp = require('tiapp.xml').parse('<ti:app><!-- the rest of the tiapp.xml --></ti:app>');
```

### find()

Find a tiapp.xml file and return its file path. It will start by searching the current working directory for a tiapp.xml file. If it doesn't find it, it will continue to move up the folder hierarchy attempting to find tiapp.xml files. If it never finds a tiapp.xml, it returns `null`.

```js
var pathToTiappXml = require('tiapp.xml').find();
```

### toString()

Return the string representation of the tiapp.xml file.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.toString());
```

### write([file])

Write the current Tiapp object out as a tiapp.xml file to `file`. If `file` is undefined, it will use the file supplied in the inital [load()](#loadfile) or [parse()](#parsexmlstring-filename) call. If it still can't find a file, an exception with be thrown.

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

### getDeploymentTarget(platform)

Return a boolean indicating whether or not the given `platform` is enabled. If no `platform` is given, [getDeploymentTargets](#getdeploymenttargets) is called instead.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.getDeploymentTarget('android'));
```

The previous code would print `true` if the `deployment-targets` section of your tiapp.xml looked something like this:

```xml
<deployment-targets>
	<target device="android">true</target>
</deployment-targets>
```

### getDeploymentTargets()

Return an object representation of all the deployment target elements.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.getDeploymentTargets());
```

The previous code executed against a tiapp.xml that had everything but Tizen enabled would print this:

```js
{
	android: true,
	blackberry: true,
	ipad: true,
	iphone: true,
	mobileweb: true,
	tizen: false
}
```

### setDeploymentTarget(platform, value)

Enable or disable a platform. If `platform` is an object, [setDeploymentTargets](#setdeploymenttargetsobj) is called instead.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.setDeploymentTarget('android', false);
tiapp.write();
```

The previous code would write a `deployment-targets` entry something like this:

```xml
<deployment-targets>
	<target device="android">false</target>
</deployment-targets>
```

### setDeploymentTargets(obj)

Enabled or disable all platforms at once. `obj` is an object representation of all deployment targets.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// get existing list of deployment targets
var targets = tiapp.getDeploymentTarget();

// disable tizen and blackberry
targets.blackberry = false;
targets.tizen = false;
tiapp.setDeploymentTargets(targets);

// or use an object literal to do the same without the getDeploymentTargets() call
tiapp.setDeploymentTargets({
	android: true,
	blackberry: false,
	ipad: true,
	iphone: true,
	mobileweb: true,
	tizen: false
});

tiapp.write();
```

### getProperty(name)

Get a tiapp.xml [application property](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties) value.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.getProperty('ti.ui.defaultunit')); // prints "system"
```

### setProperty(name, [value], [type])

Set a tiapp.xml [application property](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties).

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// with just a value
tiapp.setProperty('ti.ui.defaultunit', 'dp');

// or with a value and type
tiapp.setProperty('ti.ui.defaultunit', 'dp', 'string');

tiapp.write();
```

### removeProperty(name)

Remove an [application property](http://docs.appcelerator.com/titanium/latest/#!/guide/tiapp.xml_and_timodule.xml_Reference-section-29004921_tiapp.xmlandtimodule.xmlReference-ApplicationProperties) from the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.removeProperty('ti.ui.defaultunit');
tiapp.write();
```

### getModules()

Get an array of objects representing modules listed in the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
var modules = tiapp.getModules();

// iterate through a list of modules from the tiapp.xml
modules.forEach(function(mod) {
	// read access to properties on module object
	console.log('id=%s,version=%s,platform=%s',
		mod.id, mod.version || '<no version>', mod.platform || '<no platform>');
});
```

### setModule(id, [version], [platform])

Add or update a module in the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// Add the ti.cloud module
tiapp.setModule('ti.cloud');

// Set the version of ti.cloud to 2.0
tiapp.setModule('ti.cloud', '2.0');

// Add a platform-specific module
tiapp.setModule('ti.cloud', '1.0', 'android');

// add with object for attributes
tiapp.setModule('some.module', {
	platform: 'android',
	version: '3.3'
});

// Add one more module, no additional details
tiapp.setModule('com.tonylukasavage.nothing');

tiapp.write();
```

The resulting tiapp.xml `<modules>` section would look like this:

```xml
<modules>
	<module version="2.0">ti.cloud</module>
	<module version="1.0" platform="android">ti.cloud</module>
	<module version="3.3" platform="android">some.module</module>
	<module>com.tonylukasavage.nothing</module>
</modules>
```

### removeModule(id, [platform])

Remove a module from the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// remove ti.cloud module that is _not_ platform-specific
tiapp.removeModule('ti.cloud');

// remove a platform-specific ti.cloud entry
tiapp.removeModule('ti.cloud', 'android');

tiapp.write();
```

### getPlugins()

Get an array of objects representing plugins listed in the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
var plugins = tiapp.getPlugins();

// iterate through a list of plugins from the tiapp.xml
plugins.forEach(function(plugin) {
	// read access to properties on plugin object
	console.log('id=%s,version=%s', plugin.id, plugin.version || '<no version>');
});
```

### setPlugin(id, [version])

Add or update a plugin in the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');

// Add the ti.alloy plugin
tiapp.setPlugin('ti.alloy');

// Set the version of ti.alloy to 2.0
tiapp.setModule('ti.alloy', '2.0');

tiapp.write();
```

The resulting tiapp.xml `<plugins>` section would look like this:

```xml
<plugins>
	<plugin version="2.0">ti.alloy</plugin>
</plugins>
```

### removePlugin(id)

Remove a plugin from the tiapp.xml.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
tiapp.removePlugin('ti.alloy');
tiapp.write();
```

### doc

A direct reference to the underlying XML Document object as supplied by [xmldom](https://github.com/jindw/xmldom). You will not need to use this in most cases and should use the tiapp.xml module APIs instead.

```js
var tiapp = require('tiapp.xml').load('./tiapp.xml');
console.log(tiapp.doc.documentElement.nodeName); // prints "ti:app"
```

## Todo

* Platform-specific tiapp.xml sections
