var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	should = require('should'),
	tiappXml = require('..'),
	U = require('../lib/util');

var ROOT = process.cwd(),
	TMP = path.resolve('tmp'),
	INVALID_TIAPP_ARGS = [123, function(){}, [1,2,3], true, false, NaN, Infinity, null],
	TIAPP_XML = path.resolve('test', 'fixtures', 'tiapp.xml'),
	TIAPP_BAD_XML = path.resolve('test', 'fixtures', 'tiapp.bad.xml'),
	TESTFIND_END = path.resolve('test', 'fixtures', 'testfind', '1', '2', '3'),
	TESTFIND_TIAPP_XML = path.resolve('test', 'fixtures', 'testfind', 'tiapp.xml'),
	INVALID_XML = ['<WTF></WTFF>', '</elem>', 'badelem></badelem>'],
	VALID_XML = [];

// custom assertions for Tiapp
should.Assertion.add('Tiapp', function() {
	this.params = { operator: 'to be a Tiapp object' };
	this.assert(this.obj && U.isFunction(this.obj.parse));
}, true);

should.Assertion.add('loadedTiapp', function() {
	this.params = { operator: 'to be a loaded Tiapp object' };
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
			tiapp.should.be.loadedTiapp;
		});

		it('should load without a file via find()', function() {
			process.chdir(TESTFIND_END);
			var tiapp = tiappXml.load();
			tiapp.file.should.equal(TESTFIND_TIAPP_XML);
			tiapp.should.be.loadedTiapp;
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
			tiapp.should.be.loadedTiapp;
			tiapp.file.should.equal(TIAPP_XML);

			tiapp = tiappXml.parse(fs.readFileSync(TESTFIND_TIAPP_XML, 'utf8'), TESTFIND_TIAPP_XML);
			tiapp.should.be.loadedTiapp;
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

		it('should be created from load()', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			tiapp.file.should.equal(TIAPP_XML);
			should.exist(tiapp.modules);
			tiapp.modules.should.be.instanceOf.ItemGroup;
			should.exist(tiapp.plugins);
			tiapp.plugins.should.be.instanceOf.ItemGroup;
		});

		it('should get full list of modules', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get();
			should.exist(modules);
			modules.should.be.an.Array;
			modules.length.should.equal(5);
			_.find(modules, function(o) {
				return o.id === 'com.appc.foo' && o.platform === 'ios' && o.version === '0.1';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.appc.foobar' && o.platform === 'android';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.appc.foobar' && o.platform === 'ios';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.appc.bar' && o.version === '2.1';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.appc.quux';
			}).should.be.ok;
		});

		it('should get module by id', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.appc.bar');
			modules.length.should.equal(1);
			modules[0].id.should.equal('com.appc.bar');
			modules[0].version.should.equal('2.1');

			tiapp.modules.get('fakemoduleid').length.should.equal(0);
		});

		it('should get module by filtering object', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get({
				id: 'com.appc.bar',
				version: '2.1'
			});
			modules.length.should.equal(1);
			modules[0].id.should.equal('com.appc.bar');
			modules[0].version.should.equal('2.1');

			modules = tiapp.modules.get({
				id: 'com.appc.bar',
				version: '2.2'
			});
			modules.length.should.equal(0);
		});

		it('should add a module to existing modules', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.tonylukasavage.foo');
			should.exist(modules);
			modules.length.should.equal(0);

			tiapp.modules.add({
				id: 'com.tonylukasavage.foo',
				version: '2.2',
				platform: 'android'
			});
			modules = tiapp.modules.get('com.tonylukasavage.foo');
			should.exist(modules);
			modules.length.should.equal(1);
		});

		it('should add a module when none already exist', function() {
			var tiapp = tiappXml.parse('<ti:app></ti:app>');
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(0);

			tiapp.modules.add({
				id: 'com.appc.bar'
			});
			modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);
		});

		it('should add an array of modules', function() {
			var tiapp = tiappXml.parse('<ti:app></ti:app>');
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(0);

			tiapp.modules.add([
				{ id: 'com.appc.bar' },
				{ id: 'com.appc.foo' },
				{ id: 'com.tonylukasavage.blahblah' }
			]);
			modules = tiapp.modules.get();
			should.exist(modules);
			modules.length.should.equal(3);

			_.find(modules, function(o) {
				return o.id === 'com.appc.bar';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.appc.foo';
			}).should.be.ok;
			_.find(modules, function(o) {
				return o.id === 'com.tonylukasavage.blahblah';
			}).should.be.ok;
		});

		it('should fail quietly on a duplicate add', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);

			tiapp.modules.add({
				id: 'com.appc.bar',
				version: '2.1'
			});
			modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);
		});

		it('should throw when fail=true on add', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);

			(function() {
				tiapp.modules.add({
					id: 'com.appc.bar',
					version: '2.1'
				}, { fail: true });
			}).should.throw();
		});

		it('should add duplicate entry when duplicates=true', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);

			tiapp.modules.add({
				id: 'com.appc.bar',
				version: '2.1'
			}, { duplicates: true });
			modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(2);
		});

		it('should add duplicate entry when duplicates=true, even if fail=true', function() {
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(1);

			tiapp.modules.add({
				id: 'com.appc.bar',
				version: '2.1'
			}, { duplicates: true, fail: true });
			modules = tiapp.modules.get('com.appc.bar');
			should.exist(modules);
			modules.length.should.equal(2);
		});

		it('should write to a tiapp.xml using explicit file', function() {
			var file = path.resolve('tmp', 'tiapp.xml');
			var tiapp = tiappXml.load(TIAPP_XML);
			var modules = tiapp.modules.get('testmodule');
			should.exist(modules);
			modules.length.should.equal(0);

			tiapp.modules.add('testmodule');
			tiapp.write(file);

			tiapp = tiappXml.load(file);
			modules = tiapp.modules.get('testmodule');
			should.exist(modules);
			modules.length.should.equal(1);
			modules[0].id.should.equal('testmodule');
		});

		it('should write to a tiapp.xml using this.file', function() {
			var file = path.resolve('tmp', 'tiapp.xml');
			var tiapp = tiappXml.load(file);
			var modules = tiapp.plugins.get('someplugin');
			should.exist(modules);
			modules.length.should.equal(0);

			tiapp.plugins.add('someplugin');
			tiapp.write();

			tiapp = tiappXml.load(file);
			modules = tiapp.plugins.get('someplugin');
			should.exist(modules);
			modules.length.should.equal(1);
			modules[0].id.should.equal('someplugin');
		});

		it('should get/set top level tiapp.xml elements', function() {
			var file = path.resolve('tmp', 'tiapp.xml');
			var tiapp = tiappXml.load(file);

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
		});

	});

});
