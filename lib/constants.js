exports.topLevelElements = ['guid', 'id', 'name', 'analytics', 'copyright', 'description', 'fullscreen', 'icon', 'navbar-hidden', 'publisher', 'sdk-version', 'url', 'version'];
exports.androidManifestElements = [{
    'attribute' : 'versionName',
    'element' : 'manifest'
}, {
    'attribute' : 'versionCode',
    'element' : 'manifest'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'minSdkVersion'
}, {
    'element' : 'uses-sdk',
    'attribute' : 'targetSdkVersion'
}];