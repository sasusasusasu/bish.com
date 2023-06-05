import * as path from "https://deno.land/std@0.189.0/path/mod.ts";

export function splitPath(p: string) {
	return p.split(path.SEP, ...Array.from(arguments).slice(1))
		.filter(s => s.length > 0);
}

export function posixPath(p: string) {
	return p.split(path.posix.sep, ...Array.from(arguments).slice(1))
		.join(path.SEP);
}
