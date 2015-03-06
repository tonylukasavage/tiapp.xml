var _ = require('lodash'),
    constants = require('constants'),
    fs = require('fs'),
    path = require('path'),
    should = require('should'),
    tiappXml = require('..'),
    U = require('../lib/util');

var ROOT = process.cwd(),
    TMP = path.resolve('tmp'),
    INVALID_TIAPP_ARGS = [123,
function() {
}, [1, 2, 3], true, false, NaN, Infinity, null],
    TIAPP_XML = path.resolve('test', 'fixtures', 'tiapp.xml'),
    TIAPP_BAD_XML = path.resolve('test', 'fixtures', 'tiapp.bad.xml'),
    TESTFIND_END = path.resolve('test', 'fixtures', 'testfind', '1', '2', '3'),
    TESTFIND_TIAPP_XML = path.resolve('test', 'fixtures', 'testfind', 'tiapp.xml'),
    INVALID_XML = ['<WTF></WTFF>', '</elem>', 'badelem></badelem>'],
    VALID_XML = [];

// create temp folder
if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
}

// test suite
describe('Tiapp', function() {

    beforeEach(function() {
        process.chdir(ROOT);
    });

    describe('#Tiapp android', function() {
        it('should load android', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"><id>com.example.test</id><publisher>appcelerator</publisher><android xmlns:android="http://schemas.android.com/apk/res/android"><manifest android:versionCode="1" android:versionName="1.0.01"><uses-sdk android:minSdkVersion="10" android:targetSdkVersion="17"/><!-- Allows the API to download data from Google Map servers --><uses-permission android:name="android.permission.INTERNET"/><uses-permission android:name="android.permission.GET_ACCOUNTS"/><uses-permission android:name="android.permission.WAKE_LOCK"/><uses-permission android:name="com.google.android.c2dm.permission.RECEIVE"/><uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/><uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/><uses-permission android:name="android.permission.READ_PHONE_STATE"/><uses-permission android:name="android.permission.VIBRATE"/><uses-permission android:name="android.permission.READ_CALENDAR"/><uses-permission android:name="android.permission.WRITE_CALENDAR"/><uses-permission android:maxSdkVersion="18" android:name="android.permission.WRITE_EXTERNAL_STORAGE"/><permission android:name="com.example.test.permission.C2D_MESSAGE" android:protectionLevel="signature"/><uses-permission android:name="com.example.test.permission.C2D_MESSAGE"/><!-- Use GPS for device location --><uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/><!-- Use Wi-Fi or mobile connection for device location --><uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/><!-- Allows the API to access Google web-based services --><uses-permission android:name="com.google.android.providers.gsf.permission.READ_GSERVICES"/><!-- Specify OpenGL ES 2.0 as a requirement --><uses-feature android:glEsVersion="0x00020000" android:required="true"/><!-- Replace com.domain.appid with your application ID --><uses-permission android:name="com.example.test.permission.MAPS_RECEIVE"/><permission android:name="com.example.test.permission.MAPS_RECEIVE" android:protectionLevel="signature"/><application android:theme="@style/Theme.NoActionBar"><!-- Key for Android applications --><meta-data android:name="com.google.android.maps.v2.API_KEY" android:value="AIzaSyChq8dwoXYhzjV-CxGbgD9ZxICeCJb86-o"/></application></manifest></android></ti:app>');
            var tmpFile = path.resolve('tmp', 'android.tiapp.xml');
            tiapp.id.should.equal('com.example.test');
            //as loaded
            tiapp.android.versionCode.should.equal('1');
            tiapp.android.versionName.should.equal('1.0.01');
            tiapp.android.minSdkVersion.should.equal("10");
            tiapp.android.targetSdkVersion.should.equal("17");
            //as modified
            tiapp.android.versionName = "1.0.2";
            tiapp.android.versionCode = "2";
            tiapp.android.versionCode.should.equal('2');
            tiapp.android.versionName.should.equal('1.0.2');
            tiapp.android.minSdkVersion = "14";
            tiapp.android.targetSdkVersion = "19";
            tiapp.android.minSdkVersion.should.equal("14");
            tiapp.android.targetSdkVersion.should.equal("19");
            tiapp.write(tmpFile);
        });

        it('should not load properties if no manifest, but will on addition', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"><id>com.example.test</id><publisher>appcelerator</publisher><android xmlns:android="http://schemas.android.com/apk/res/android"></android></ti:app>');
            var tmpFile = path.resolve('tmp', 'android.tiapp.xml');
            tiapp.id.should.equal('com.example.test');
            //as loaded
            should.not.exist(tiapp.android.versionName);
            should.not.exist(tiapp.android.versionCode);
            should.not.exist(tiapp.android.minSdkVersion);
            should.not.exist(tiapp.android.targetSdkVersion);
            //as modified
            tiapp.android.versionName = "1.0.2";
            tiapp.android.versionCode = "1";
            tiapp.android.minSdkVersion = "15";
            tiapp.android.targetSdkVersion = "19";
            tiapp.android.package = "com.stepupapps.test";
            tiapp.write(tmpFile);
            //test the results
            tiapp.android.targetSdkVersion.should.equal("19");
            tiapp.android.package.should.equal("com.stepupapps.test");
            tiapp.android.versionCode.should.equal('1');
            tiapp.android.versionName.should.equal('1.0.2');
            tiapp.android.minSdkVersion.should.equal("15");
        });

        it('application settings', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"><id>com.example.applicationsettingstest</id><publisher>appcelerator</publisher><android xmlns:android="http://schemas.android.com/apk/res/android"/></ti:app>');
            var tmpFile = path.resolve('tmp', 'android.tiapp.xml');
            var permissions = tiapp.getAndroidUsesPermissions();
            tiapp.id.should.equal('com.example.applicationsettingstest');
            //as modified
            tiapp.android.versionName = "1.0.2";
            tiapp.android.versionCode = "1";
            tiapp.android.minSdkVersion = "15";
            tiapp.android.targetSdkVersion = "21";
            tiapp.android.theme = "@style/Theme.NoActionBar";
            tiapp.android.allowBackup = "false";
            tiapp.android.largeHeap = "true";
            tiapp.android.hardwareAccelerated = "false";
            tiapp.write(tmpFile);
            //tests
            permissions.should.eql([]);
            should.not.exist(tiapp.android.hasCode);
            tiapp.android.theme.should.equal("@style/Theme.NoActionBar");
        });

        it('activity settings', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"><id>com.example.activitiestest</id><publisher>appcelerator</publisher><android xmlns:android="http://schemas.android.com/apk/res/android"/></ti:app>');
            var tmpFile = path.resolve('tmp', 'android_activities.tiapp.xml');
            tiapp.android.versionName = "1.0.2";
            tiapp.android.versionCode = "1";
            tiapp.android.minSdkVersion = "15";
            tiapp.android.targetSdkVersion = "21";
            tiapp.android.theme = "@style/Theme.NoActionBar";
            tiapp.android.largeHeap = "true";
            tiapp.id.should.equal('com.example.activitiestest');
            should.not.exist(tiapp.android.application.activity[0]);
            tiapp.createAndroidActivity({
                'theme' : "@style/Theme.NoActionBar",
                'invalid' : 'some rubbish'
            });
            should.not.exist(tiapp.android.application.activity[1]);
            should.exist(tiapp.android.application.activity[0].theme);
            should.not.exist(tiapp.android.application.activity[0].invalid);
            tiapp.android.application.activity[0].theme.should.equal("@style/Theme.NoActionBar");
            tiapp.createAndroidActivity({
                'label' : "@string/app_name",
                'theme' : "@style/Theme.Titanium",
                'configChanges': "keyboardHidden|orientation|screenSize",
                'launchMode': 'singleTop',
                'screenOrientation': 'nosensor'
            });
            should.exist(tiapp.android.application.activity[1].theme);
            should.not.exist(tiapp.android.application.activity[1].invalid);
            tiapp.android.application.activity[1].theme.should.equal("@style/Theme.Titanium");

            tiapp.write(tmpFile);
            //tests
        });

        it('android permissions and uses-permissions', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"><id>com.example.test</id><publisher>appcelerator</publisher><android xmlns:android="http://schemas.android.com/apk/res/android"><manifest><uses-permission android:name="android.permission.INTERNET"/><uses-permission android:name="android.permission.GET_ACCOUNTS"/><uses-permission android:name="android.permission.WAKE_LOCK"/><uses-permission android:name="com.google.android.c2dm.permission.RECEIVE"/><uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/><uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/><uses-permission android:name="android.permission.READ_PHONE_STATE"/><uses-permission android:name="android.permission.VIBRATE"/><uses-permission android:name="android.permission.READ_CALENDAR"/><uses-permission android:name="android.permission.WRITE_CALENDAR"/><uses-permission android:maxSdkVersion="18" android:name="android.permission.WRITE_EXTERNAL_STORAGE"/></manifest></android></ti:app>');
            var tmpFile = path.resolve('tmp', 'android.tiapp.xml');
            var permissions = tiapp.getAndroidUsesPermissions();
            //valid permissions
            permissions.should.have.length(11);
            permissions.should.containEql('android.permission.INTERNET');
            permissions.should.containEql('android.permission.GET_ACCOUNTS');
            permissions.should.containEql('android.permission.WRITE_EXTERNAL_STORAGE');
            permissions.should.containEql('android.permission.WAKE_LOCK');
            permissions.should.containEql('android.permission.ACCESS_NETWORK_STATE');
            permissions.should.containEql('android.permission.RECEIVE_BOOT_COMPLETED');
            permissions.should.containEql('android.permission.READ_PHONE_STATE');
            permissions.should.containEql('android.permission.VIBRATE');
            permissions.should.containEql('android.permission.READ_CALENDAR');
            permissions.should.containEql('com.google.android.c2dm.permission.RECEIVE');
            permissions.should.containEql('android.permission.WRITE_CALENDAR');
            permissions.should.not.containEql('android.permission.CAMERA');
            permissions.should.not.containEql('com.example.SOMECUSTOMPERMISSION');
            tiapp.setAndroidPermissions({
                'name' : 'android.permission.CAMERA'
            });
            tiapp.setAndroidPermissions({
                'name' : 'com.example.SOMECUSTOMPERMISSION',
                'maxSdkVersion' : '18'
            });
            permissions = tiapp.getAndroidUsesPermissions();
            //updated permissions
            permissions.should.have.length(13);
            permissions.should.containEql('android.permission.CAMERA');
            permissions.should.containEql('com.example.SOMECUSTOMPERMISSION');
            tiapp.write(tmpFile);
        });
    });
});
