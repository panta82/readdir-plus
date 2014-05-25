var libPath = require("path");

var libTools = require("./tools"),
	libVars = require("./vars");

function doReadDir(path, options, callback, shared) {
	shared = shared || {
		basePath: path,
		cancelSignal: false
	};

	var waitCount = 0,
		results = [],
		calledBack = false;

	options.readdir.fn(path, function (err, files) {
		if (shared.cancelSignal) {
			return onWaitDone();
		}

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
					relativePath: libPath.relative(shared.basePath, filePath),
					extension: libPath.extname(file)
				};
			} else {
				res = filePath;
			}

			// Allow for a special case when we can just push results, without inspection
			var needStat = options.stat.enabled || options.recursive
				|| options.filters.file !== true
				|| options.filters.directory !== true
				|| options.filters.blockDevice !== true
				|| options.filters.characterDevice !== true
				|| options.filters.FIFO !== true
				|| options.filters.socket !== true;

			if (needStat) {
				doStat(filePath, res);
			} else {
				results.push(res);
			}
		});

		if (waitCount === 0) {
			onWaitDone(null);
		}
	});

	return options.sync ? results : undefined;

	function onWaitDone(err) {
		waitCount--;
		if (!err && waitCount > 0) {
			return;
		}

		if (calledBack) {
			return;
		}
		calledBack = true;
		if (err) {
			shared.cancelSignal = true;
			return callback && callback(err);
		}
		if (shared.cancelSignal) {
			return callback && callback(null);
		}
		return callback && callback(null, results);
	}

	function doHandleError(err, name, res) {
		switch (options[name].errorStrategy) {
			case libVars.ERROR_STRATEGIES.fatal:
				return onWaitDone(err);
			case libVars.ERROR_STRATEGIES.property:
				if (options.details) {
					res[name + "Error"] = err;
					res[name] = options[name].errorValue;
				}
				break;
			case libVars.ERROR_STRATEGIES.replace:
				if (options.details) {
					res[name] = err;
				}
				break;
			case libVars.ERROR_STRATEGIES.swallow:
				break;
			default:
				return onWaitDone(new Error("Unknown error strategy: " + options[name].errorStrategy));
		}
		return true;
	}

	function doFilter(res, filter) {
		if (!filter) {
			return false;
		}
		if (filter === true) {
			return true;
		}
		if (filter.test && filter.test(res.path || res)) {
			return true;
		}
		return filter(res);
	}

	function doStat(filePath, res) {
		waitCount++;

		options.stat.fn(filePath, function (err, stat) {
			if (err) {
				return doHandleError(err, "stat", res);
			}

			if (shared.cancelSignal) {
				return onWaitDone();
			}

			var isDirectory = stat.isDirectory();
			if (options.details) {
				res.stat = stat;
				res.type = isDirectory ? libVars.FILE_TYPES.directory
					: stat.isFile() ? libVars.FILE_TYPES.file
					: stat.isSymbolicLink() ? libVars.FILE_TYPES.symbolicLink
					: stat.isBlockDevice() ? libVars.FILE_TYPES.blockDevice
					: stat.isCharacterDevice() ? libVars.FILE_TYPES.characterDevice
					: stat.isFIFO() ? libVars.FILE_TYPES.FIFO
					: stat.isSocket() ? libVars.FILE_TYPES.socket
					: null;
			}
			if (doFilter(res, options.filters.any) && doFilter(res, options.filters[res.type])) {
				results.push(res);
			}

			if (options.recursive && isDirectory) {
				doRecurse(filePath, res);
			}
			if (options.content.enabled && !isDirectory) {
				doReadContent(filePath, res);
			}

			return onWaitDone();
		});
	}

	function doReadContent(filePath, res) {
		waitCount++;

		options.content.fn(filePath, function (err, content) {
			if (err) {
				return doHandleError(err, "content", res);
			}

			res.content = content;
			return onWaitDone();
		});
	}

	function doRecurse(filePath, res) {
		waitCount++;

		return doReadDir(filePath, options, doRecurseCallback, shared);

		function doRecurseCallback(err, innerResults) {
			if (err) {
				return onWaitDone(err);
			}

			if (shared.cancelSignal) {
				return onWaitDone();
			}

			if (options.tree) {
				res.content = innerResults;
			} else {
				innerResults.forEach(function (innerResult) {
					results.push(innerResult);
				});
			}
			return onWaitDone();
		}
	}
}

function readdirPlus(path, userOptions, callback) {
	if (libTools.isFunction(userOptions)) {
		callback = userOptions;
		userOptions = null;
	}

	var options = libTools.shallowCopy(libVars.DEFAULT_OPTIONS);

	if (userOptions) {
		if (libTools.isBoolean(userOptions.stat)) {
			userOptions.stat = {
				enabled: userOptions.stat
			};
		}
		if (libTools.isBoolean(userOptions.content)) {
			userOptions.content = {
				enabled: userOptions.content
			};
		}
		libTools.shallowCopy(userOptions, options);
	}

	if (path[path.length - 1] !== libPath.sep) {
		path += libPath.sep;
	}

	options.readdir.fn = options.readdir.fn
		|| options.sync
			? libTools.syncWrapper(options.readdir.fnSync)
			: options.readdir.fnAsync;
	options.stat.fn = options.stat.fn
		|| options.sync
			? libTools.syncWrapper(options.stat.fnSync)
			: options.stat.fnAsync;
	options.content.fn = options.content.fn
		|| options.sync
		? libTools.syncWrapper(options.content.fnSync)
		: options.content.fnAsync;

	doReadDir(path, options, function (err, results) {
		if (err) {
			return callback && callback(err);
		}
		return callback && callback(null, results);
	});

	function setupFn(namespace) {
		
	}
}

readdirPlus.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;

module.exports = readdirPlus;