var androidManifestElements = [{
    'attribute' : 'package',
    'element' : 'manifest',
    'parent' : 'android'
}, {
    'attribute' : 'versionName',
    'element' : 'manifest',
    'parent' : 'android'
}, {
    'attribute' : 'versionCode',
    'element' : 'manifest',
    'parent' : 'android'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'minSdkVersion',
    'parent' : 'manifest'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'targetSdkVersion',
    'parent' : 'manifest'
}];
var androidApplicationAttributes = ['allowTaskReparenting', 'allowBackup', 'backupAgent', 'configChanges','banner', 'debuggable', 'description', 'enabled', 'hasCode', 'hardwareAccelerated', 'icon', 'isGame', 'killAfterRestore', 'largeHeap', 'label', 'logo', 'manageSpaceActivity', 'name', 'permission', 'persistent', 'process', 'restoreAnyVersion', 'requiredAccountType', 'restrictedAccountType', 'supportsRtl', 'taskAffinity', 'testOnly', 'theme', 'uiOptions', 'vmSafeMode'];
androidApplicationAttributes.forEach(function(attribute) {
    var obj = {
        'element' : 'application',
        'attribute' : attribute,
        'parent' : 'manifest'
    };
    androidManifestElements.push(obj);
});
exports.androidManifestElements = androidManifestElements;
exports.topLevelElements = ['guid', 'id', 'name', 'analytics', 'copyright', 'description', 'fullscreen', 'icon', 'navbar-hidden', 'publisher', 'sdk-version', 'url', 'version'];
exports.activityAttributes = ['allowEmbedded', 'allowTaskReparenting', 'alwaysRetainTaskState', 'autoRemoveFromRecents', 'banner', 'clearTaskOnLaunch', 'configChanges', 'documentLaunchMode', 'enabled', 'excludeFromRecents', 'exported', 'finishOnTaskLaunch', 'hardwareAccelerated', 'icon', 'label', 'launchMode', 'maxRecents', 'multiprocess', 'name', 'noHistory', 'parentActivityName', 'permission', 'process', 'relinquishTaskIdentity', 'screenOrientation', 'stateNotNeeded', 'taskAffinity', 'theme', 'uiOptions', 'windowSoftInputMode'];
