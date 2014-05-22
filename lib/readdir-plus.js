var libFs = require("fs");

var libTools = require("./tools"),
	libVars = require("./vars");

function readdirPlus(path, userOptions, callback) {
	if (libTools.isFunction(userOptions)) {
		callback = userOptions;
		userOptions = null;
	}
	var options = libTools.shallowCopy(libVars.DEFAULT_OPTIONS);
	if (userOptions) {
		libTools.shallowCopy(userOptions, options);
	}

	return callback && callback(null);
}