import * as babel from "npm:@babel/standalone@7.22.2";
import * as path from "https://deno.land/std@0.189.0/path/mod.ts";
import * as hex from "https://deno.land/std@0.189.0/encoding/hex.ts";

export default class TranspilerCache {
	cacheDir: string;
	pathCache: Record<string, string>;
	static async #sha256(data: string): Promise<string> {
		return Array.from(hex.encode(new Uint8Array(await
			crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)))))
			.map(c => String.fromCharCode(c)).join("");
	}

	constructor(cacheDir: string) {
		this.cacheDir = cacheDir;
		const indexPath = path.join(this.cacheDir, "index.txt");
		const index = Deno.statSync(indexPath).isFile ?
				Deno.readTextFileSync(indexPath) : "";
		this.pathCache = {};
		index.split("\n").filter(s => s.length > 0)
			.map(s => s.split(/\s+/, 2)).forEach(e => {
				this.pathCache[e[0]] = e[1];
			});
	}

	async transpile(input: string, output: string) {
		const code = Deno.readTextFileSync(input);
		const hash = await TranspilerCache.#sha256(code);
		if (this.pathCache[input] === hash)
			return;
		const out = babel.transform(code, { presets: [ "react" ] });
		Deno.writeTextFileSync(output, out);
		this.pathCache[input] = hash;
	}
}
