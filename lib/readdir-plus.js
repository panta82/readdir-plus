var libPath = require("path");

var libTools = require("./tools"),
	libVars = require("./vars");

function doReadDir(path, options, callback, shared) {
	shared = shared || {
		basePath: path,
		cancelSignal: false,
		details: options.return === libVars.RETURN_TYPES.details
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

		// Allow for a special case when we can just push results, without inspection
		var needStat = options.stat.enabled
			|| options.recursive
			|| (options.filter !== true
				&& (options.filter.file !== true
					|| options.filter.directory !== true
					|| options.filter.symbolicLink !== true
					|| options.filter.blockDevice !== true
					|| options.filter.characterDevice !== true
					|| options.filter.FIFO !== true
					|| options.filter.socket !== true));

		files.forEach(function (file) {
			var fullPath = libPath.resolve(path,  file),
				relativePath = libPath.relative(shared.basePath, fullPath),
				res;
			if (shared.details) {
				res = {
					name: file,
					path: fullPath,
					relativePath: relativePath,
					extension: libPath.extname(file)
				};
			} else {
				switch (options.return) {
					case libVars.RETURN_TYPES.names: res = file; break;
					case libVars.RETURN_TYPES.relativePaths: res = relativePath; break;
					default: res = fullPath; break;
				}
			}

			if (needStat) {
				doStat(fullPath, res);
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
				onWaitDone(err);
				return true;
			case libVars.ERROR_STRATEGIES.property:
				if (shared.details) {
					res[name + "Error"] = err;
					res[name] = options[name].errorValue;
				}
				break;
			case libVars.ERROR_STRATEGIES.replace:
				if (shared.details) {
					res[name] = err;
				}
				break;
			case libVars.ERROR_STRATEGIES.swallow:
				break;
			default:
				onWaitDone(new Error("Unknown error strategy: " + options[name].errorStrategy));
				return true;
		}
		return false;
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

	function doStat(fullPath, res) {
		waitCount++;

		options.stat.fn(fullPath, function (err, stat) {
			if (err) {
				return doHandleError(err, "stat", res);
			}

			if (shared.cancelSignal) {
				return onWaitDone();
			}

			var isDirectory = stat.isDirectory(),
				fileType = isDirectory ? libVars.FILE_TYPES.directory
					: stat.isFile() ? libVars.FILE_TYPES.file
					: stat.isSymbolicLink() ? libVars.FILE_TYPES.symbolicLink
					: stat.isBlockDevice() ? libVars.FILE_TYPES.blockDevice
					: stat.isCharacterDevice() ? libVars.FILE_TYPES.characterDevice
					: stat.isFIFO() ? libVars.FILE_TYPES.FIFO
					: stat.isSocket() ? libVars.FILE_TYPES.socket
					: null;
			if (shared.details) {
				if (options.stat.enabled) {
					res.stat = stat;
				}
				res.type = fileType;
			}
			if ((!libTools.isAnonObject(options.filter) && doFilter(res, options.filter))
				|| (doFilter(res, options.filter.any) && doFilter(res, options.filter[fileType]))) {
				results.push(res);
			}

			if (options.recursive && isDirectory) {
				doRecurse(fullPath, res);
			}
			if (options.content.enabled && !isDirectory) {
				doReadContent(fullPath, res);
			}

			return onWaitDone();
		});
	}

	function doReadContent(fullPath, res) {
		waitCount++;

		options.content.fn(fullPath, function (err, content) {
			if (err) {
				return doHandleError(err, "content", res);
			}

			res.content = content;
			return onWaitDone();
		});
	}

	function doRecurse(fullPath, res) {
		waitCount++;

		return doReadDir(fullPath, options, doRecurseCallback, shared);

		function doRecurseCallback(err, innerResults) {
			if (err) {
				if (doHandleError(err, "readdir", res)) {
					return;
				} else {
					return onWaitDone();
				}
			}

			if (shared.cancelSignal) {
				return onWaitDone();
			}

			if (options.tree) {
				if (shared.details) {
					res.content = innerResults;
					results.push(res);
				} else {
					results.push(innerResults);
				}
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

	var options = libTools.merge(libVars.DEFAULT_OPTIONS);

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
		libTools.merge(userOptions, options);
	}

	if (path[path.length - 1] !== libPath.sep) {
		path += libPath.sep;
	}

	setupFn(options.readdir);
	setupFn(options.stat);
	setupFn(options.content);

	return doReadDir(path, options, function (err, results) {
		if (err) {
			return callback && callback(err);
		}
		return callback && callback(null, results);
	});

	function setupFn(opts) {
		if (!opts.fn) {
			opts.fn = options.sync ? opts.fnSync : opts.fnAsync;
		}
		if (options.sync) {
			opts.fn = libTools.syncWrapper(opts.fn);
		}
	}
}

readdirPlus.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;
readdirPlus.ERROR_STRATEGIES = libVars.ERROR_STRATEGIES;
readdirPlus.RETURN_TYPES = libVars.RETURN_TYPES;

module.exports = readdirPlus;