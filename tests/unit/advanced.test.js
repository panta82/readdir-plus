var libPath = require("path");

var readdir = require("../../lib/readdir-plus");

var rootSimple = libPath.resolve(__dirname + "/../root/simple"),
	rootAdvanced = libPath.resolve(__dirname + "/../root/advanced");

module.exports = {
	canWorkWithoutStatForSimplestRequests: function (test) {
		test.expect(2);
		var options = {
			filter: true,
			recursive: false,
			stat: {
				enabled: false,
				errorStrategy: readdir.ERROR_STRATEGIES.fatal,
				fn: function (_, cb) {
					cb(new Error("This shouldn't be called"));
				}
			}
		};
		readdir(rootAdvanced, options, function (err, results) {
			test.equal(err, null);
			test.equal(results.length, 5);
			test.done();
		});
	},
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