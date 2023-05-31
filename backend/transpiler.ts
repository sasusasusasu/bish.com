import * as babel from "npm:@babel/standalone@7.22.2";
import * as path from "https://deno.land/std@0.189.0/path/mod.ts";

import * as Safe from "./safe.ts";
import * as CryptoUtil from "../common/crypto_util.js";

async function sha256(data: string): Promise<string> {
	return CryptoUtil.hex(await crypto.subtle.digest(
		"SHA-256", new TextEncoder().encode(data)));
}

export default class CachedTranspiler {
	#logInitializer: string;
	cacheDir: string;
	rootDir: string;
	indexFile: string;
	literallyHashMap: Record<string, string>;

	#cachifyPath(p: string): string {
		if (!p.length || !/[^\/]/g.test(p))
			throw new TypeError("path must contain meaningful segments");
		if (p.slice(-4) !== ".jsx")
			throw new TypeError("path must point to a JSX file");
		/* get relative cache path for file from root relative path & remove
		 * the X from the end
		 */
		return path.join(path.relative(".", this.cacheDir),
			path.relative(this.rootDir, p)).slice(0, -1);
	}

	constructor(cache: string, root: string) {
		this.#logInitializer = `[${this.constructor.name}]`;
		if (Safe.stat(cache).isFile)
			throw new TypeError("invalid cache directory");
		if (!Safe.stat(root).isDirectory)
			throw new TypeError("invalid root directory");
		this.cacheDir = path.resolve(cache);
		this.rootDir = path.resolve(root);
		if (!Safe.stat(this.cacheDir).isDirectory)
			Safe.mkdir(this.cacheDir);
		this.indexFile = path.join(this.cacheDir, "index.txt");
		const index = Safe.stat(this.indexFile).isFile ?
				Deno.readTextFileSync(this.indexFile) : "";
		this.literallyHashMap = {};
		index.split("\n").filter(s => s.length > 0)
			.map(s => s.split(/\s+/, 2)).forEach(e => {
				this.literallyHashMap[e[1]] = e[0];
			});
		console.log(this.#logInitializer, "Loaded",
			Object.keys(this.literallyHashMap).length, "entries from index");
		console.log(this.#logInitializer, "  cacheDir:", this.cacheDir);
		console.log(this.#logInitializer, "  rootDir:", this.rootDir);
	}

	async transpile(input: string): Promise<string> {
		const output = this.#cachifyPath(input);
		const code = Deno.readTextFileSync(input);
		const hash = await sha256(code);
		if (this.literallyHashMap[input] === hash) {
			console.log(this.#logInitializer,
				"Cache hit:", input, "->", output);
			return output;
		}
		console.log(this.#logInitializer, "Transpiling", input, "->", output);
		const out = babel.transform(code, { presets: [ "react" ] }).code;
		if (!Safe.stat(path.dirname(output)).isDirectory)
			Safe.mkdir(path.dirname(output), { recursive: true });
		Deno.writeTextFileSync(output, out);
		this.literallyHashMap[input] = hash;
		return output;
	}

	write() {
		console.log(this.#logInitializer, "Writing",
			Object.keys(this.literallyHashMap).length, "entries to index");
		Deno.writeTextFileSync(this.indexFile, Object.entries(this.literallyHashMap)
			.map(e => `${e[1]} ${e[0]}`).join("\n"));
	}
}
