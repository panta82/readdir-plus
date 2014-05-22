var libFs = require("fs"),
	libPath = require("path");

var libTools = require("./tools"),
	libVars = require("./vars");

function doReadDir(path, options, callback) {
	var waitCount = 0,
		results = [],
		error = null;

	libFs.readdir(path, function (err, files) {
		if (err) {
			return callback && callback(err);
		}

		files.forEach(function (file) {
			var filePath = libPath.resolve(path,  file),
				res;
			if (options.details) {
				res = {
					name: file,
					path: filePath,
					extension: libPath.extname(file)
				};
			} else {
				res = path;
			}
			results.push(res);

			if (options.stat.enabled) {
				waitCount++;
				//TODO
			}
		});

		if (waitCount === 0) {
			onWaitDone(null);
		}
	});

	function onWaitDone(err) {
		if (err && !error) {
			error = err;
		}

		waitCount--;
		if (waitCount > 0) {
			return;
		}

		if (error) {
			return callback && callback(error);
		}
		return callback && callback(null, results);
	}
}

function doStat(fileRecord, callback) {

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

	options.statPrefix = options.statPrefix || "";

	doReadDir(path, options, function (err, results) {
		if (err) {
			return callback && callback(err);
		}
		return callback && callback(null, results);
	});
}

readdirPlus.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;

module.exports = readdirPlus;