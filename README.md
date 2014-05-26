readdir-plus
============

fs.readdir with additional options. Features:

- Multiple return types: names, paths, relative paths, details (with parts parsed + file type)
- Optional recursive search
- Loads stat for each found file / directory. Optionally disable for better performance.
- Detailed filtering by file type, regex and/or callback
- Produce tree structure or flat list
- Synchronous option *(TODO)*
- Load content of found files (binary or text determined by extension) *(TODO)* 
- Zero dependencies
- Tests

**************

### Basic usage

```javascript

var readdir = require("readdir-plus");

readdir("/path/to/directory", function (err, files) {
	files.forEach(console.log);
});

```

### Detailed results

```javascript
readdir("/path/to/directory", {return: "details", stat: "true", content: "true"}, function (err, results) {
	require("util").inspect(results);
});
```

Output:

```
	[
		{
			name: "file.txt",
			path: "/home/myname/path/to/directory/subdir/file.txt",
			relativePath: "subdir/file.txt", 
			extension: ".txt",
			type: "file",
			stat: { /* see node documentation for properties found here */ },
			content: "Content of the file here"
		},
		{ /*... */ }
	]
```

##### TODO: more examples coming

**************

## Options

All options with defaults and helpful comments can be seen [here](lib/vars.js).


**************

## Licence

Apache v2. Read it [here](LICENCE).