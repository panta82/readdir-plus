var libPath = require("path");

var libTools = require("../../lib/tools"),
	readdir = require("../../lib/readdir-plus");

var rootSimple = libPath.resolve(__dirname + "/../root/simple"),
	rootAdvanced = libPath.resolve(__dirname + "/../root/advanced");

module.exports = {
	setUp: libTools.execOrDie.bind(null, libPath.resolve(__dirname, "../root/setup.sh")),
	tearDown: libTools.execOrDie.bind(null, libPath.resolve(__dirname, "../root/teardown.sh")),

	canLoadContentWithDefaultSettings: function (test) {
		test.expect(3);
		readdir(rootSimple, {stat: false, content: true}, function (err, results) {
			test.equal(err, null);
			test.equal(results[0].content, "simple1");
			test.strictEqual(results[1].content, "");
			test.done();
		});
	}
};