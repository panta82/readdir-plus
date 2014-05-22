var readdir = require("../lib/readdir-plus");

readdir("../tests/root", function (err, results) {
	console.log(err, results);
});