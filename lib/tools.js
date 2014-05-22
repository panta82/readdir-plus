exports.isObject = function isObject(x, nullIsObject, arrayIsObject) {
	return typeof(x) === "object" && (nullIsObject || x !== null) && (arrayIsObject || !exports.isArray(x));
};

exports.isAnonObject = function isAnonObject(x, nullIsObject) {
	return exports.isObject(x, nullIsObject) && x.constructor.name === "Object";
};

exports.isFunction = function isFunction(x) {
	return typeof(x) === "function";
};

exports.isString = function isString(x) {
	return typeof(x) === "string";
};

exports.isArray = function isArray(x) {
	return Object.prototype.toString.call(x) === '[object Array]';
};

exports.isNumber = function isNumber(x, nanIsNumber, infinityIsNumber) {
	return typeof(x) === "number" && (nanIsNumber || !isNaN(x)) && (infinityIsNumber || isFinite(x));
};

exports.shallowCopy = function shallowCopy(source, destination, fnFilter) {
	if (exports.isFunction(destination)) {
		fnFilter = destination;
		destination = {};
	}
	fnFilter = fnFilter || function () { return true; };
	destination = destination || {};
	if (!exports.isObject(source)) {
		return destination;
	}
	Object.keys(source).forEach(function (key) {
		var value = source[key];
		if (fnFilter(key, value, destination[key])) {
			destination[key] = value;
		}
	});
	return destination;
};