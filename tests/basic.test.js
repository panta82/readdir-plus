var readdir = require("../lib/readdir-plus");

var rootSimple = __dirname + "/root/simple";

module.exports = {
	setUp: function (callback) {
		callback();
	},
	canWorkWithDefaults: function (test) {
		test.expect(5);
		readdir(rootSimple, function (err, results) {
			test.ok(!(err instanceof Error));
			test.equal(results.length, 2);
			test.ok(results[0].stat);
			test.equal(results[0].name, "file1.txt");
			test.equal(results[1].name, "file2.txt");
			test.done();
		});
	},
	canReturnJustNames: function (test) {
		test.expect(4);
		readdir(rootSimple, { details: false }, function (err, results) {
			console.log(err);
			test.ok(!(err instanceof Error));
			test.equal(results.length, 2);
			test.equal(results[0], "file1.txt");
			test.equal(results[1], "file2.txt");
			test.done();
		});
	}
};