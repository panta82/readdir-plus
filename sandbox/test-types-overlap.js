var libFs = require("fs"),
	libPath = require("path");

function handleError(err) {
	console.error(err.message || err);
}

function doTest(path) {
	libFs.readdir(path, function (err, files) {
		if (err) return handleError(err);

		files.forEach(function (file) {
			var fullPath = libPath.resolve(path, file);
			libFs.lstat(fullPath, function (err, stat) {
				if (err) return handleError(err);

				var types = [];
				if (stat.isFile()) {
					types.push("FILE");
				}
				if (stat.isDirectory()) {
					doTest(fullPath);
					types.push("DIR");
				}
				if (stat.isSymbolicLink()) {
					types.push("LINK");
				}
				if (stat.isBlockDevice()) {
					types.push("BD");
				}
				if (stat.isCharacterDevice()) {
					types.push("CD");
				}
				if (stat.isFIFO()) {
					types.push("FIFO");
				}
				if (stat.isSocket()) {
					types.push("SOCK");
				}
				if (types.length !== 1) {
					console.log("Anomaly for " + fullPath + ": " + types);
				}
			});
		});
	});
}

doTest(process.argv[2] || "/");