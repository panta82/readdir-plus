var libPath = require("path");

var readdir = require("../../lib/readdir-plus");

var rootSimple = libPath.resolve(__dirname + "/../root/simple"),
	rootAdvanced = libPath.resolve(__dirname + "/../root/advanced");

module.exports = {
	canDetermineFileType: function (test) {
		test.expect(5);
		readdir(rootAdvanced, {stat: true, filter: true}, function (err, results) {
			test.equal(err, null);
			test.equal(results.length, 7);
			results.forEach(function (result) {
				if (result.name === "file1.txt") {
					test.ok(result.type, "file");
				}
				if (result.name === "sub1") {
					test.ok(result.type, "directory");
				}
				if (result.name === "file1.lnk") {
					test.ok(result.type, "symbolicLink");
				}
			});
			test.done();
		});
	}
};