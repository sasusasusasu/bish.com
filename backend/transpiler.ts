import * as babel from "npm:@babel/standalone@7.22.2";
import * as path from "https://deno.land/std@0.189.0/path/mod.ts";

import * as Safe from "./safe.ts";
import * as CryptoUtil from "../common/crypto_util.js";

function splitPath(p: string) {
	return p.split(path.SEP).filter(s => s.length > 0);
}

async function sha256(data: string): Promise<string> {
	return CryptoUtil.hex(await crypto.subtle.digest(
		"SHA-256", new TextEncoder().encode(data)));
}

export default class CachedTranspiler {
	#logInitializer: string;
	cacheDir: string;
	rootDir: string;
	indexFile: string;
	pathCache: Record<string, string>;

	#cachifyPath(p: string): string {
		if (!p.length || !/[^\/]/g.test(p))
			throw new TypeError("path must contain meaningful segments");
		const r = splitPath(this.rootDir);
		const ps = splitPath(p);
		ps[ps.length - 1] = [ps.at(-1)?.split(".", 1)[0], "js"].join(".");
		return path.join(this.cacheDir, ...ps.slice(r.length));
	}

	constructor(cache: string, root: string) {
		this.#logInitializer = `[${CachedTranspiler.name}]`;
		if (Safe.stat(cache).isFile)
			throw new TypeError("invalid cache directory");
		if (!Safe.stat(root).isDirectory)
			throw new TypeError("invalid root directory");
		this.cacheDir = path.normalize(cache);
		this.rootDir = path.normalize(root);
		if (!Safe.stat(this.cacheDir).isDirectory)
			Safe.mkdir(this.cacheDir);
		this.indexFile = path.join(this.cacheDir, "index.txt");
		const index = Safe.stat(this.indexFile).isFile ?
				Deno.readTextFileSync(this.indexFile) : "";
		this.pathCache = {};
		index.split("\n").filter(s => s.length > 0)
			.map(s => s.split(/\s+/, 2)).forEach(e => {
				this.pathCache[e[0]] = e[1];
			});
		console.log(this.#logInitializer, "Loaded",
			Object.keys(this.pathCache).length, "entries from index");
		console.log(this.#logInitializer, "  cacheDir:", this.cacheDir);
		console.log(this.#logInitializer, "  rootDir:", this.rootDir);
	}

	async transpile(input: string): Promise<string> {
		const output = this.#cachifyPath(input);
		const code = Deno.readTextFileSync(input);
		const hash = await sha256(code);
		if (this.pathCache[input] === hash) {
			console.log(this.#logInitializer,
				"Cache hit:", input, "->", output);
			return output;
		}
		console.log(this.#logInitializer, "Transpiling", input, "->", output);
		const out = babel.transform(code, { presets: [ "react" ] }).code;
		if (!Safe.stat(path.dirname(output)).isDirectory)
			Safe.mkdir(path.dirname(output), { recursive: true });
		Deno.writeTextFileSync(output, out);
		this.pathCache[input] = hash;
		return output;
	}

	write() {
		console.log(this.#logInitializer, "Writing",
			Object.keys(this.pathCache).length, "entries to index");
		Deno.writeTextFileSync(this.indexFile, Object.entries(this.pathCache)
			.map(e => `${e[0]} ${e[1]}`).join("\n"));
	}
}
