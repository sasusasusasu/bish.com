export function stat(p: string): Deno.FileInfo {
	try {
		return Deno.statSync(p);
	} catch(_) {
		return <Deno.FileInfo> {
			isFile: false, isDirectory: false, isSymlink: false,
			size: 0, mtime: null, atime: null, birthtime: null,
			dev: 0, ino: null, mode: null, nlink: null,
			uid: null, gid: null, rdev: null, blksize: null,
			blocks: null, isBlockDevice: false, isCharDevice: false,
			isFifo: false, isSocket: false
		};
	}
}

export function mkdir(p: string, opt: Deno.MkdirOptions | null = null) {
	try {
		if (opt !== null)
			Deno.mkdirSync(p, opt);
		else
			Deno.mkdirSync(p);
	} catch (_) { /* dir exists */ }
}
