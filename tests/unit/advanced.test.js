var libPath = require("path");

var readdir = require("../../lib/readdir-plus");

var rootSimple = libPath.resolve(__dirname + "/../root/simple");

module.exports = {
	canGetBasicStat: function (test) {
		test.expect(5);
		readdir(rootSimple, {stat: true, filters: { directory: true }}, function (err, results) {
			test.equal(err, null);

			test.equal(results.length, 3);
			test.ok(results[0].type, "file");
			test.ok(results[1].type, "directory");
			test.ok(results[2].type, "file");
			test.done();
		});
	}
};