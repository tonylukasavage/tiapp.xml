> **NOT YET FUNCTIONAL**

# tiapp.xml

A node.js parsing and manipulation API module for Appcelerator's [Titanium](http://www.appcelerator.com/titanium/) tiapp.xml configuration file.

## Example

```js
var Tiapp = require('tiapp.xml');

// read the current tiapp.xml
var tiapp = new Tiapp({
	file: '/path/to/tiapp.xml' // optional, will search up folder hierarchy from cwd
});

// add a plugin
var plugin = tiapp.plugin.add({
	name: 'somePlugin',
	version: '1.0',
	platform: ['android','ios']
});
plugin.set('version', '1.1');

// add a module
tiapp.module.add({
	name: 'com.tonylukasavage.foo',
	version: '1.0',
	platform: 'ios'
});

// remove, add, modify properties
tiapp.property.remove('ti.android.compilejs');


tiapp.write();
```

## API

coming soon.
