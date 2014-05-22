var libFs = require("fs"),
	libPath = require("path");

var libTools = require("./tools"),
	libVars = require("./vars");

function doReadDir(path, options, callback) {
	libFs.readdir(path, function (readdirErr, files) {
		if (readdirErr) {
			callback(readdirErr);
			return;
		}

		var results = [];
		files.forEach(function (file) {
			results.push(file);
		});

		callback(null, results);
	});
}

function readdirPlus(path, userOptions, callback) {
	if (libTools.isFunction(userOptions)) {
		callback = userOptions;
		userOptions = null;
	}
	var options = libTools.shallowCopy(libVars.DEFAULT_OPTIONS);
	if (userOptions) {
		libTools.shallowCopy(userOptions, options);
	}

	if (path[path.length - 1] !== libPath.sep) {
		path += libPath.sep;
	}

	doReadDir(path, options, function (err, results) {
		if (err) {
			return callback && callback(err);
		}
		return callback && callback(null, results);
	});
}

readdirPlus.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;

module.exports = readdirPlus;