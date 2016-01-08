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

// custom assertions for Tiapp
should.Assertion.add('Tiapp', function() {
    this.params = {
        operator : 'to be a Tiapp object'
    };
    this.assert(this.obj && U.isFunction(this.obj.parse));
}, true);

should.Assertion.add('loadedTiapp', function() {
    this.params = {
        operator : 'to be a loaded Tiapp object'
    };
    this.assert(this.obj !== null && typeof this.obj !== 'undefined');
    this.assert(this.obj.doc !== null && typeof this.obj.doc !== 'undefined');
    this.assert(this.obj.doc.documentElement !== null && typeof this.obj.doc.documentElement !== 'undefined');
    this.assert(this.obj.doc.documentElement.nodeName === 'ti:app');
}, true);

// create temp folder
if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
}

// test suite
describe('Tiapp', function() {

    beforeEach(function() {
        process.chdir(ROOT);
    });

    describe('#find', function() {

        it('should return null when no tiapp.xml is found', function() {
            should.equal(tiappXml.find(), null);
        });

        it('should find tiapp.xml in current directory', function() {
            process.chdir(path.dirname(TESTFIND_TIAPP_XML));
            tiappXml.find().should.equal(TESTFIND_TIAPP_XML);

            process.chdir(path.dirname(TIAPP_XML));
            tiappXml.find().should.equal(TIAPP_XML);
        });

        it('should find tiapp.xml in target directory', function() {
            tiappXml.find(TESTFIND_END).should.equal(TESTFIND_TIAPP_XML);
            tiappXml.find(path.resolve('test', 'fixtures')).should.equal(TIAPP_XML);
        });

        it('should find tiapp.xml in directory hierarchy', function() {
            process.chdir(path.dirname(TESTFIND_END));
            tiappXml.find().should.equal(TESTFIND_TIAPP_XML);

            process.chdir(path.join(path.dirname(TESTFIND_END), '..'));
            tiappXml.find().should.equal(TESTFIND_TIAPP_XML);
        });

    });

    describe('#load', function() {

        it('should throw if file does not exist', function() {
            (function() {
                tiappXml.load('./some/totally/fake/path/tiapp.xml');
            }).should.throw(/not found/);
        });

        it('should throw if file is not valid XML', function() {
            (function() {
                tiappXml.load(TIAPP_BAD_XML);
            }).should.throw();
        });

        it('should load given a file', function() {
            var tiapp = tiappXml.load(TIAPP_XML);
            tiapp.file.should.equal(TIAPP_XML);
            tiapp.should.be.loadedTiapp
        });

        it('should load without a file via find()', function() {
            process.chdir(TESTFIND_END);
            var tiapp = tiappXml.load();
            tiapp.file.should.equal(TESTFIND_TIAPP_XML);
            tiapp.should.be.loadedTiapp
        });

        INVALID_TIAPP_ARGS.forEach(function(arg) {
            it('should throw when executed with "' + U.toString(arg) + '"', function() {
                (function() {
                    tiappXml.load(arg);
                }).should.throw(/Bad argument/);
            });
        });

    });

    describe('#parse', function() {

        it('should parse given xml', function() {
            var tiapp = tiappXml.parse(fs.readFileSync(TIAPP_XML, 'utf8'), TIAPP_XML);
            tiapp.should.be.loadedTiapp
            tiapp.file.should.equal(TIAPP_XML);

            tiapp = tiappXml.parse(fs.readFileSync(TESTFIND_TIAPP_XML, 'utf8'), TESTFIND_TIAPP_XML);
            tiapp.should.be.loadedTiapp
            tiapp.file.should.equal(TESTFIND_TIAPP_XML);
        });

        it('should throw if parsed document is not a tiapp.xml', function() {
            (function() {
                tiappXml.parse('<done></done>');
            }).should.throw(/tiapp\.xml/);
        });

        INVALID_XML.forEach(function(xml) {
            it('should throw on invalid xml "' + xml + '"', function() {
                (function() {
                    tiappXml.parse(xml);
                }).should.throw();
            });
        });

        INVALID_TIAPP_ARGS.concat(undefined).forEach(function(arg) {
            it('should throw if xml is "' + U.toString(arg) + '"', function() {
                (function() {
                    tiappXml.parse(arg);
                }).should.throw(/Bad argument/);
            });
        });

    });

    describe('#Tiapp', function() {

        it('should get/set top level tiapp.xml elements', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.sdkVersion.should.equal('3.2.2.GA');
            tiapp['sdk-version'].should.equal('3.2.2.GA');

            tiapp.id.should.equal('com.tonylukasavage.tiapp');
            tiapp.id = 'fakeid';
            tiapp.id.should.equal('fakeid');

            tiapp.guid.should.equal('d3064db6-6d84-43c1-a65d-aa720541db99');
            tiapp.guid = 'fakeguid';
            tiapp.guid.should.equal('fakeguid');

            tiapp['navbar-hidden'].should.equal('false');
            tiapp['navbar-hidden'] = true;
            tiapp['navbar-hidden'].should.equal('true');
            tiapp['navbar-hidden'] = 'true';
            tiapp['navbar-hidden'].should.equal('true');
            tiapp['navbar-hidden'] = false;
            tiapp['navbar-hidden'].should.equal('false');

            tiapp.analytics.should.equal('true');
            tiapp.analytics = true;
            tiapp.analytics.should.equal('true');
            tiapp.analytics = 'true';
            tiapp.analytics.should.equal('true');
            tiapp.analytics = false;
            tiapp.analytics.should.equal('false');
        });

        it('should get single deployment-target', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.getDeploymentTarget('android').should.be.true
            tiapp.getDeploymentTarget('blackberry').should.be.true
            tiapp.getDeploymentTarget('iphone').should.be.true
            tiapp.getDeploymentTarget('ipad').should.be.true
            tiapp.getDeploymentTarget('mobileweb').should.be.true
            tiapp.getDeploymentTarget('tizen').should.be.true
            should.equal(tiapp.getDeploymentTarget('what?'), null);
            should.equal(tiapp.getDeploymentTarget(123), null);
            should.equal(tiapp.getDeploymentTarget(function() {
            }), null);
        });

        it('should get all deployment-targets', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            // with an "s"
            var targets = tiapp.getDeploymentTargets();
            should.exist(targets);
            targets.should.be.an.Object
            targets.android.should.equal(true);
            targets.blackberry.should.equal(true);
            targets.ipad.should.equal(true);
            targets.iphone.should.equal(true);
            targets.mobileweb.should.equal(true);
            targets.tizen.should.equal(true);

            // without an "s"
            targets = tiapp.getDeploymentTarget();
            should.exist(targets);
            targets.should.be.an.Object
            targets.android.should.equal(true);
            targets.blackberry.should.equal(true);
            targets.ipad.should.equal(true);
            targets.iphone.should.equal(true);
            targets.mobileweb.should.equal(true);
            targets.tizen.should.equal(true);
        });

        it('should set single deployment-target', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.setDeploymentTarget('android', false);
            tiapp.setDeploymentTarget('blackberry', false);
            tiapp.setDeploymentTarget('mobileweb', false);
            tiapp.setDeploymentTarget('tizen', false);
            tiapp.getDeploymentTarget('android').should.be.false
            tiapp.getDeploymentTarget('blackberry').should.be.false
            tiapp.getDeploymentTarget('iphone').should.be.true
            tiapp.getDeploymentTarget('ipad').should.be.true
            tiapp.getDeploymentTarget('mobileweb').should.be.false
            tiapp.getDeploymentTarget('tizen').should.be.false

            // TODO: test bad data for setDeploymentTarget
            // TODO: return null id <deployment-targets> doesn't exist
        });

        it('should set all deployment-targets', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            // get existing targets
            var targets = tiapp.getDeploymentTargets();
            should.exist(targets);
            targets.should.be.an.Object
            targets.android.should.equal(true);
            targets.blackberry.should.equal(true);
            targets.ipad.should.equal(true);
            targets.iphone.should.equal(true);
            targets.mobileweb.should.equal(true);
            targets.tizen.should.equal(true);

            // make some mods and set them
            targets.tizen = false;
            targets.blackberry = false;
            tiapp.setDeploymentTargets(targets);

            // get them again and make sure the set worked
            targets = tiapp.getDeploymentTargets();
            should.exist(targets);
            targets.should.be.an.Object
            targets.android.should.equal(true);
            targets.blackberry.should.equal(false);
            targets.ipad.should.equal(true);
            targets.iphone.should.equal(true);
            targets.mobileweb.should.equal(true);
            targets.tizen.should.equal(false);
        });

        it('should get application properties', function() {
            var tiapp = tiappXml.load(TIAPP_XML);
            tiapp.getProperty('ti.ui.defaultunit').should.equal('dp');
        });

        it('should set application properties', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.setProperty('com.tonylukasavage.property', 'somevalue');
            tiapp.setProperty('com.tonylukasavage.bool', false, 'bool');
            tiapp.setProperty('com.tonylukasavage.number', 123, 'int');
            tiapp.setProperty('com.tonylukasavage.float', 123.123, 'double');
            tiapp.setProperty('ti.ui.defaultunit', 'system', 'string');

            tiapp.getProperty('com.tonylukasavage.property').should.equal('somevalue');
            tiapp.getProperty('com.tonylukasavage.bool').should.equal(false);
            tiapp.getProperty('com.tonylukasavage.number').should.equal(123);
            tiapp.getProperty('com.tonylukasavage.float').should.equal(123.123);
            tiapp.getProperty('ti.ui.defaultunit').should.equal('system');

            tiapp.setProperty('com.tonylukasavage.property', 'different');
            tiapp.getProperty('com.tonylukasavage.property').should.equal('different');
        });

        it('should remove properties', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.getProperty('ti.ui.defaultunit').should.equal('dp');
            tiapp.removeProperty('ti.ui.defaultunit');
            should.equal(tiapp.getProperty('ti.ui.defaultunit'), null);
        });

        it('should get all modules', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            var modules = tiapp.getModules();
            should.exist(modules);
            modules.should.be.an.Array
            modules.length.should.equal(5);

            var tests = [{
                id : 'com.appc.foo',
                version : '0.1',
                platform : 'ios'
            }, {
                id : 'com.appc.foobar',
                platform : 'android'
            }, {
                id : 'com.appc.foobar',
                platform : 'ios'
            }, {
                id : 'com.appc.bar',
                version : '2.1'
            }, {
                id : 'com.appc.quux'
            }];
            for (var i = 0; i < tests.length; i++) {
                var test = tests[i],
                    mod = modules[i];

                should.equal(mod.id, test.id);
                should.equal(mod.version, test.version);
                should.equal(mod.platform, test.platform);
            }
        });

        it('should set a module', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            // write some new entries
            tiapp.setModule('tony.lukasavage', '1.0');
            tiapp.setModule('charlie.lukasavage', {
                platform : 'ios'
            });
            tiapp.setModule('june.lukasavage', '2.0', 'android');
            tiapp.setModule('whitney.lukasavage');

            var modules = _.filter(tiapp.getModules(), function(m) {
                return m.id.indexOf('lukasavage') !== -1;
            });
            should.exist(modules);
            modules.should.be.an.Array
            modules.length.should.equal(4);

            modules[0].id.should.equal('tony.lukasavage');
            modules[0].version.should.equal('1.0');
            should.not.exist(modules[0].platform);

            modules[1].id.should.equal('charlie.lukasavage');
            modules[1].platform.should.equal('ios');
            should.not.exist(modules[1].version);

            modules[2].id.should.equal('june.lukasavage');
            modules[2].version.should.equal('2.0');
            modules[2].platform.should.equal('android');

            modules[3].id.should.equal('whitney.lukasavage');
            should.not.exist(modules[3].version);
            should.not.exist(modules[3].platform);

            // trying overwriting
            tiapp.setModule('whitney.lukasavage', {
                version : '3.4'
            });
            modules = _.filter(tiapp.getModules(), function(m) {
                return m.id === 'whitney.lukasavage';
            });
            should.exist(modules);
            modules.should.be.an.Array
            modules.length.should.equal(1);

            modules[0].id.should.equal('whitney.lukasavage');
            modules[0].version.should.equal('3.4');
            should.not.exist(modules[0].platform);

            // quietly overwrite duplicate
            (function() {
                tiapp.setModule('whitney.lukasavage');
                tiapp.setModule('whitney.lukasavage');
            }).should.not.throw();
        });

        it('should add a module when none already exist', function() {
            var tiapp = tiappXml.parse('<ti:app></ti:app>');

            var modules = tiapp.getModules();
            should.exist(modules);
            modules.length.should.equal(0);

            tiapp.setModule('com.appc.bar');
            modules = tiapp.getModules();
            should.exist(modules);
            modules.length.should.equal(1);
        });

        it('should remove a module', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.removeModule('com.appc.foobar', 'ios');
            tiapp.removeModule('com.appc.foobar', 'android');
            tiapp.removeModule('com.appc.quux');

            var modules = tiapp.getModules();
            should.exist(modules);
            modules.should.be.an.Array
            modules.length.should.equal(2);

            (function() {
                tiapp.removeModule('i.do.not.exist');
                tiapp.removeModule();
            }).should.not.throw();
        });

        it('should get all plugins', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            var plugins = tiapp.getPlugins();
            should.exist(plugins);
            plugins.should.be.an.Array
            plugins.length.should.equal(1);

            plugins[0].should.be.an.Object
            plugins[0].id.should.equal('ti.alloy');
            plugins[0].version.should.equal('1.0');
        });

        it('should set a plugin', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            // create new
            tiapp.setPlugin('some.plugin');
            tiapp.setPlugin('another.plugin', '3.3');

            var plugins = tiapp.getPlugins();
            should.exist(plugins);
            plugins.should.be.an.Array
            plugins.length.should.equal(3);

            plugins[0].should.be.an.Object
            plugins[0].id.should.equal('ti.alloy');
            plugins[0].version.should.equal('1.0');

            plugins[1].should.be.an.Object
            plugins[1].id.should.equal('some.plugin');
            should.not.exist(plugins[1].version);

            plugins[2].should.be.an.Object
            plugins[2].id.should.equal('another.plugin');
            plugins[2].version.should.equal('3.3');

            // update existing
            tiapp.setPlugin('ti.alloy', '2.0');

            plugins = tiapp.getPlugins();
            should.exist(plugins);
            plugins.should.be.an.Array
            plugins.length.should.equal(3);

            plugins[0].should.be.an.Object
            plugins[0].id.should.equal('ti.alloy');
            plugins[0].version.should.equal('2.0');
        });

        it('should remove a plugin', function() {
            var tiapp = tiappXml.load(TIAPP_XML);

            tiapp.removePlugin('ti.alloy');

            var plugins = tiapp.getPlugins();
            should.exist(plugins);
            plugins.should.be.an.Array
            plugins.length.should.equal(0);

            (function() {
                tiapp.removePlugin('i.do.not.exist');
                tiapp.removePlugin();
            }).should.not.throw();
        });

        it('should allow access to XML document object via `doc`', function() {
            var tiapp = tiappXml.load(TIAPP_XML);
            tiapp.doc.documentElement.nodeName.should.equal('ti:app');
        });

        it('should write to a tiapp.xml', function() {
            var tiapp = tiappXml.load(TIAPP_XML);
            tiapp.id.should.equal('com.tonylukasavage.tiapp');

            // write to tmp file
            var file = path.join(TMP, 'tiapp.xml');
            tiapp.write(file);

            // read from tmp file and write again
            tiapp = tiappXml.load(file);
            tiapp.id.should.equal('com.tonylukasavage.tiapp');
            tiapp.id = 'a.different.id';
            tiapp.write();

            // make sure it wrote again
            tiappXml.load(file);
            tiapp.id.should.equal('a.different.id');
        });

        it('should create pretty xml with write() and toString()', function() {
            var tiapp = tiappXml.parse('<ti:app xmlns:ti="http://ti.appcelerator.org"/>');

            // fill in initial values
            tiapp.name = 'appname';
            tiapp.id = 'com.tonylukasavage.appname';
            tiapp.version = '1.0';
            tiapp.setProperty('ti.ui.defaultunit', 'dp', 'string');
            tiapp.setModule('com.appc.foo', '0.1', 'ios');
            tiapp.setModule('com.appc.foobar', {
                platform : 'android'
            });
            tiapp.setModule('com.appc.foobar', {
                platform : 'ios'
            });
            tiapp.setDeploymentTargets({
                android : true,
                ipad : true,
                iphone : true,
                mobileweb : false,
                tizen : false
            });
            tiapp.setPlugin('ti.alloy', '1.0');

            // insert/update values
            tiapp.setModule('com.appc.quux');
            tiapp.setModule('com.appc.foo', '1.0', 'ios');
            tiapp.setDeploymentTarget('blackberry', false);
            tiapp.setPlugin('no.version');
            tiapp.setPlugin('another.plugin', '3.3');
            tiapp.setPlugin('ti.alloy', '2.0');
            tiapp.setProperty('some.property', '123', 'int');
            tiapp.sdkVersion = '3.2.2.GA';
            tiapp.version = '1.1';

            // get the fixture for comparison
            var fixData = fs.readFileSync(path.resolve('test', 'fixtures', 'format.tiapp.xml'), 'utf8');

            // make sure toString() formats correctly
            tiapp.toString().replace('<ti:app ', '<ti:app').should.equal(fixData);

            // write the tiapp.xml for comparison
            var tmpFile = path.resolve('tmp', 'format.tiapp.xml');
            tiapp.write(tmpFile);
            fs.readFileSync(tmpFile, 'utf8').replace('<ti:app ', '<ti:app').should.equal(fixData);
        });

    });
});
