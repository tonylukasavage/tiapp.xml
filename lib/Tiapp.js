var constants = require('./constants'),
    fs = require('fs'),
    pretty = require('pretty-data2').pd,
    U = require('./util'),
    xml = require('./xml'),
    _ = require("underscore");

function Tiapp(file, doc) {
    var self = this,
        android,
        application,
        manifest;

    this.file = file;
    this.doc = doc;
    this.android = {
        application : {
            activity : []
        }
    };

    // set default doc for xml.js
    xml.doc = this.doc;
    //default items
    android = getItem(self.doc.documentElement, "android");
    if (!android) {
        android = self.doc.createElement("android");
    }
    manifest = getItem(self.doc.documentElement, "manifest");
    if (!manifest) {
        manifest = self.doc.createElement("manifest");
    }
    xml.ensureElement(android, "manifest");
    application = getItem(self.doc.documentElement, "application");
    if (!application) {
        application = self.doc.createElement("application");
    }
    xml.ensureElement(manifest, "application");

    // create top-level element getters/setters
    constants.topLevelElements.forEach(function(prop) {
        var topLevelObject = {
            get : function() {
                return xml.getTagText(self.doc.documentElement, prop);
            },
            set : function(val) {
                xml.setNodeText(xml.ensureElement(self.doc.documentElement, prop), val);
            }
        };

        // create property based on property name
        Object.defineProperty(self, prop, topLevelObject);

        // see if we need a camel case version as well
        if (prop.indexOf('-') !== -1) {
            Object.defineProperty(self, U.dashToCamelCase(prop), topLevelObject);
        }
    });

    // create android manifest attribute getters / setters in the form tiapp.android.versionCode etc.
    constants.androidManifestElements.forEach(function(prop) {
        var topLevelObject,
            attributeString,
            element,
            parent;
        if (prop.attribute !== "package") {
            attributeString = "android:" + prop.attribute;
        } else {
            attributeString = prop.attribute;
        }
        topLevelObject = {
            get : function() {
                var attr;
                element = getItem(self.doc.documentElement, prop.element);
                if (element) {
                    attr = element.getAttribute(attributeString);
                    if (attr) {
                        return attr;
                    }
                }
            },
            set : function(val) {
                parent = getItem(self.doc.documentElement, prop.parent);
                element = getItem(self.doc.documentElement, prop.element);
                if (!parent) {
                    parent = self.doc.createElement(prop.parent);
                }
                if (!element) {
                    //create the element and then add the attribute
                    element = self.doc.createElement(prop.element);
                    element.setAttribute(attributeString, val);
                    parent.appendChild(element);
                } else {
                    element.setAttribute(attributeString, val);
                }
            }
        };
        Object.defineProperty(self.android, prop.attribute, topLevelObject);
        // see if we need a camel case version as well
        if (prop.attribute.indexOf('-') !== -1) {
            Object.defineProperty(self.android, U.dashToCamelCase(prop.attribute), topLevelObject);
        }
    });
}

Tiapp.prototype.toString = function toString() {
    return pretty.xml(xml.nodeToString(this.doc));
};

Tiapp.prototype.write = function write(file) {
    file = file || this.file;
    fs.writeFileSync(file, this.toString());
};

Tiapp.prototype.getDeploymentTarget = function getDeploymentTarget(platform) {
    if (!platform) {
        return this.getDeploymentTargets();
    }

    // make sure we have <deployment-targets>
    var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
    if (!targetsContainer) {
        return null;
    }

    // get the <target>
    var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
    if (target) {
        return xml.getNodeText(target) === 'true' ? true : false;
    }
    return null;
};

Tiapp.prototype.getAndroidUsesPermissions = function getAndroidUserPermissions() {
    var permissions = getPermissions(this.doc.documentElement);
    if (permissions) {
        return permissions;
    }
};

Tiapp.prototype.createAndroidActivity = function createAndroidActivity(item) {
    var android = xml.ensureElement(this.doc.documentElement, "android"),
        manifest = xml.ensureElement(android, "manifest"),
        application = xml.ensureElement(manifest, "application"),
        activity = this.doc.createElement("activity"),
        newObj = {};
    application.appendChild(activity);
    _.each(item, function(obj, key) {
        //just allow valid attributes
        if (constants.activityAttributes.indexOf(key) !== -1) {
            activity.setAttribute("android:" + key, obj);
            newObj[key] = obj;
        }
    });
    this.android.application.activity.push(newObj);
};
Tiapp.prototype.setAndroidPermissions = function setAndroidPermissions(permission) {
    var permissions,
        element,
        manifest;
    permissions = getPermissions(this.doc.documentElement);
    manifest = getItem(this.doc.documentElement, "manifest");
    if (permission.name && permissions) {
        //add a new element if it does not exist
        if (permissions.indexOf(permission.name) === -1) {
            element = this.doc.createElement("uses-permission");
            element.setAttribute('android:name', permission.name);
            if (permission.maxSdkVersion) {
                element.setAttribute('android:maxSdkVersion', permission.maxSdkVersion);
            }
            manifest.appendChild(element);
        }
    } else {
        console.log('not adding new permissions');
    }

};

Tiapp.prototype.getDeploymentTargets = function getDeploymentTargets() {
    // make sure we have <deployment-targets>
    var targetsContainer = xml.getLastElement(this.doc.documentElement, 'deployment-targets');
    if (!targetsContainer) {
        return null;
    }

    // create results object from <target> elements
    var results = {},
        targets = targetsContainer.getElementsByTagName('target');
    for (var i = 0,
        len = targets.length; i < len; i++) {
        var target = targets.item(i);
        results[target.getAttribute('device')] = xml.getNodeText(target) === 'true';
    }

    return results;
};

Tiapp.prototype.setDeploymentTarget = function setDeploymentTarget(platform, value) {
    if (!platform) {
        return;
    }
    if (U.isObject(platform)) {
        return setDeploymentTargets(platform);
    }

    var targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets'),
        targets = targetsContainer.getElementsByTagName('target');

    var target = xml.getElementWithAttribute(targetsContainer, 'target', 'device', platform);
    if (target) {
        xml.setNodeText(target, value.toString());
    } else {
        addTarget(this.doc, targetsContainer, platform, !!value);
    }
};

Tiapp.prototype.setDeploymentTargets = function setDeploymentTargets(obj) {
    if (!obj) {
        return;
    }

    var self = this,
        targetsContainer = xml.ensureElement(this.doc.documentElement, 'deployment-targets');

    // remove all existing <target> elements
    xml.removeAllChildren(targetsContainer);

    // create new <target> elements from object keys
    Object.keys(obj).forEach(function(key) {
        addTarget(self.doc, targetsContainer, key, !!obj[key]);
    });
};

Tiapp.prototype.getProperty = function getProperty(name) {
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        var value = xml.getNodeText(property),
            type = property.hasAttribute('type') ? property.getAttribute('type') : 'string';

        // convert value based on type
        if (type === 'bool') {
            value = value === 'true';
        } else if (type === 'int') {
            value = parseInt(value, 10);
        } else if (type === 'double') {
            value = parseFloat(value);
        }

        return value;
    }
    return null;
};

Tiapp.prototype.setProperty = function(name, value, type) {
    var len = arguments.length,
        i;
    if (!name) {
        throw new Error('name must be defined');
    }
    if (value === null) {
        value = '';
    }

    // try to update existing property element
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        if (type) {
            property.setAttribute('type', type);
        }
        xml.setNodeText(property, value.toString());
        return;
    }

    // create a new property
    var elem = this.doc.createElement('property');
    elem.setAttribute('name', name);
    if (type) {
        elem.setAttribute('type', type);
    }
    elem.appendChild(this.doc.createTextNode(value.toString()));
    this.doc.documentElement.appendChild(elem);
};

Tiapp.prototype.removeProperty = function removeProperty(name) {
    var property = xml.getElementWithAttribute(this.doc.documentElement, 'property', 'name', name);
    if (property) {
        this.doc.documentElement.removeChild(property);
    }
};

Tiapp.prototype.getModules = function getModules() {
    return getItems(this.doc.documentElement, 'module');
};

Tiapp.prototype.setModule = function setModule(id, version, platform) {
    if (U.isObject(version)) {
        var opts = version;
        platform = opts.platform;
        version = opts.version;
    }

    setItem(this.doc.documentElement, 'module', id, version, platform);
};

Tiapp.prototype.removeModule = function removeModule(id, platform) {
    removeItem(this.doc.documentElement, 'module', id, platform);
};

Tiapp.prototype.getPlugins = function getPlugins() {
    return getItems(this.doc.documentElement, 'plugin');
};

Tiapp.prototype.setPlugin = function setPlugin(id, version) {
    setItem(this.doc.documentElement, 'plugin', id, version);
};

Tiapp.prototype.removePlugin = function removePlugin(id) {
    removeItem(this.doc.documentElement, 'plugin', id);
};

module.exports = Tiapp;

// helpers

function getPermissions(doc) {
    var permissions,
        usesPermissions,
        manifest = getItem(doc, "manifest"),
        tags = ["uses-permission"],
        result = [];
    tags.forEach(function(tag) {
        var attr = "android:name",
            elems = xml.getAllElementsByTagName(manifest, tag);
        if (elems) {
            for (var i = 0,
                len = elems.length; i < len; i++) {
                var elem = elems.item(i);
                result.push(elem.getAttribute(attr));
            }
        }
    });
    return result;
}

function addTarget(doc, container, platform, value) {
    var elem = doc.createElement('target');
    elem.setAttribute('device', platform);
    elem.appendChild(doc.createTextNode(value.toString()));
    container.appendChild(elem);
}

function getItem(node, itemName) {
    return xml.getLastElement(node, itemName);
}

function getItems(node, itemName) {
    //this pluralisation does not work for non plural entries such as found in android manifest
    var groupName = itemName + 's',
        results = [];
    var group = xml.getLastElement(node, groupName);
    if (!group) {
        return results;
    }

    var items = group.getElementsByTagName(itemName);
    for (var i = 0,
        len = items.length; i < len; i++) {
        var item = items.item(i),
            result = {
            id : xml.getNodeText(item)
        };

        if (item.hasAttribute('version')) {
            result.version = item.getAttribute('version');
        }
        if (item.hasAttribute('platform')) {
            result.platform = item.getAttribute('platform');
        }
        results.push(result);
    }

    return results;
}

function setItem(node, itemName, id, version, platform) {
    if (!id) {
        return;
    }

    var groupName = itemName + 's',
        group = xml.ensureElement(node, groupName),
        items = group.getElementsByTagName(itemName),
        found = false;

    // try to update an existing module entry
    for (var i = 0,
        len = items.length; i < len; i++) {
        var item = items.item(i);
        if (xml.getNodeText(item) === id && ((!item.hasAttribute('platform') && !platform) || (item.getAttribute('platform') === platform))) {
            if (version) {
                item.setAttribute('version', version.toString());
            } else {
                item.removeAttribute('version');
            }
            found = true;
        }
    }

    // if it's not an update, create a new module entry
    if (!found) {
        var elem = node.ownerDocument.createElement(itemName);
        if (platform) {
            elem.setAttribute('platform', platform);
        }
        if (version) {
            elem.setAttribute('version', version.toString());
        }
        elem.appendChild(node.ownerDocument.createTextNode(id));
        group.appendChild(elem);
    }
}

function removeItem(node, itemName, id, platform) {
    if (!id) {
        return;
    }

    var groupName = itemName + 's',
        group = xml.ensureElement(node, groupName),
        items = group.getElementsByTagName(itemName);

    for (var i = items.length - 1; i >= 0; i--) {
        var item = items.item(i);
        if (xml.getNodeText(item) === id && ((!item.hasAttribute('platform') && !platform) || (item.getAttribute('platform') === platform))) {
            group.removeChild(item);
        }
    }
}
