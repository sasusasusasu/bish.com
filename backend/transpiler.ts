/* transpiler.ts - babel-standalone-based caching JSX transpiler
 * Copyright (C) 2023 Marisa
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as babel from "npm:@babel/standalone@7.22.2";
import * as path from "https://deno.land/std@0.189.0/path/mod.ts";

import * as Safe from "./safe.ts";
import * as CryptoUtil from "../common/crypto_util.js";
import Logger from "../common/logger.js";

export default class CachedTranspiler {
	#logger: Logger;
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
		this.#logger = new Logger(this.constructor.name);
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
		this.#logger.log("Loaded",
			Object.keys(this.literallyHashMap).length, "entries from index");
		this.#logger.log("  cacheDir:", this.cacheDir);
		this.#logger.log("  rootDir:", this.rootDir);
	}

	async transpile(input: string): Promise<string> {
		const output = this.#cachifyPath(input);
		const code = Deno.readTextFileSync(input);
		const hash = await CryptoUtil.sha256str(code);
		if (this.literallyHashMap[input] === hash) {
			this.#logger.log("Cache hit:", input, "->", output);
			return output;
		}
		this.#logger.log("Transpiling", input, "->", output);
		const out = babel.transform(code, { presets: [ "react" ] }).code;
		if (!Safe.stat(path.dirname(output)).isDirectory)
			Safe.mkdir(path.dirname(output), { recursive: true });
		Deno.writeTextFileSync(output, out);
		this.literallyHashMap[input] = hash;
		return output;
	}

	write() {
		this.#logger.log("Writing",
			Object.keys(this.literallyHashMap).length, "entries to index");
		Deno.writeTextFileSync(this.indexFile, Object.entries(this.literallyHashMap)
			.map(e => `${e[1]} ${e[0]}`).join("\n"));
	}
}
