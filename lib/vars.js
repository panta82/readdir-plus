exports.DEFAULT_OPTIONS = {
	details: true,
	content: {
		enabled: false,
		maxSize: 1024 * 100, // 100 kb
		asText: [/\.txt$/],
		asBinary: [],
		fatalErrors: false
	},
	stats: {
		enabled: false,
		fatalErrors: false
	},
	recursive: true,
	tree: false,
	sync: false
};