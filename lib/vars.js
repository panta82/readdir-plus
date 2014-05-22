/*
	Strategies to handle errors produced by inner functions (stat, read)
 */
exports.ERROR_STRATEGIES = {

	// Errors are ignored, not saved anywhere
	SWALLOW: "SWALLOW",

	// Errors are saved under xxxError properties, where xxx is something like 'stat' or 'content'
	PROPERTY: "PROPERTY",

	// Errors are saved under original property name ('stat', 'content'), replacing would-be value
	REPLACE: "REPLACE",

	// Error is fatal. Callback will return this error and results won't be provided
	FATAL: "FATAL"
};

exports.DEFAULT_OPTIONS = {
	details: true,
	content: {
		enabled: false,
		maxSize: 1024 * 100, // 100 kb
		asText: [/\.txt$/],
		asBinary: [],
		errorStrategy: exports.ERROR_STRATEGIES.PROPERTY,
		errorValue: {}
	},
	stat: {
		enabled: false,
		errorStrategy: exports.ERROR_STRATEGIES.PROPERTY,
		errorValue: null
	},
	recursive: true,
	tree: false,
	sync: false
};