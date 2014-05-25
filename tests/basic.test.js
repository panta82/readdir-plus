var readdir = require("../lib/readdir-plus");

module.exports = {
	setUp: function (callback) {
		callback();
	},
	canWorkWithDefaults: function (test) {
		test.expect(5);
		readdir(__dirname + "/root/simple", function (err, results) {
			test.ok(!(err instanceof Error));
			test.equal(results.length, 2);
			test.ok(results[0].stat);
			test.equal(results[0].name, "file1.txt");
			test.equal(results[1].name, "file2.txt");
			test.done();
		});
	}
};