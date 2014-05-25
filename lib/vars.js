var libFs = require("fs");

/*
	Strategies to handle errors produced by inner functions (stat, read)
 */
exports.ERROR_STRATEGIES = {

	// Errors are ignored, not saved anywhere
	swallow: "swallow",

	// Errors are saved under xxxError properties, where xxx is something like 'stat' or 'content'
	property: "property",

	// Errors are saved under original property name ('stat', 'content'), replacing would-be value
	replace: "replace",

	// Error is fatal. Callback will return this error and results won't be provided
	fatal: "fatal"
};

/*
	Result file type, determined using stat.isFile / isDirectory...
	Presumes these types don't overlap (I couldn't find anything to say otherwise)
 */
exports.FILE_TYPES = {
	file: "file",
	directory: "directory",
	symbolicLink: "symbolicLink",
	blockDevice: "blockDevice",
	characterDevice: "characterDevice",
	FIFO: "FIFO",
	socket: "socket"
};

exports.DEFAULT_OPTIONS = {
	details: true,
	readdir: {
		fn: undefined,
		fnAsync: libFs.readdir,
		fnSync: libFs.readdirSync
	},
	content: {
		enabled: false,
		maxSize: 1024 * 100, // 100 kb
		asText: [/\.txt$/],
		asBinary: [],
		errorStrategy: exports.ERROR_STRATEGIES.property,
		errorValue: {},
		fn: undefined,
		fnAsync: libFs.readFile,
		fnSync: libFs.readFileSync
	},
	stat: {
		enabled: false,
		errorStrategy: exports.ERROR_STRATEGIES.property,
		errorValue: null,
		fn: undefined,
		fnAsync: libFs.stat,
		fnSync: libFs.statSync
	},
	filters: {
		any: true,
		file: true,
		directory: false,
		symbolicLink: false,
		blockDevice: false,
		characterDevice: false,
		FIFO: false,
		socket: false
	},
	includeDirectories: false,
	recursive: true,
	sync: false,
	tree: false
};