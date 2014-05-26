var libPath = require("path");

var libTools = require("../../lib/tools"),
	readdir = require("../../lib/readdir-plus");

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
			console.log(results);
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
	},
	canProduceTreeWithDetailsReturnType: function (test) {
		test.expect(7);
		readdir(rootAdvanced, {tree: true, stat: false}, function (err, results) {
			test.equal(err, null);
			test.equal(results.length, 4);

			results.forEach(function (result) {
				if (result.name === "sub1") {
					test.equal(result.content.length, 1);
					test.equal(result.content[0].name, "file3.bin");
				} else {
					test.equal(!!result.content, false);
				}
			});
			test.done();
		});
	},
	canProduceTreeWithOtherReturnTypes: function (test) {
		test.expect(7);
		readdir(rootAdvanced, {tree: true, stat: false, return: "names"}, function (err, results) {
			test.equal(err, null);
			test.equal(results.length, 4);

			results.forEach(function (result) {
				if (libTools.isArray(result)) {
					test.equal(result.length, 1);
					test.equal(result[0], "file3.bin");
				} else {
					test.ok(libTools.isString(result));
				}
			});
			test.done();
		});
	}
};