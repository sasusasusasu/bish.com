/* session.ts - A simple HTTP session implementation
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

import { Context } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import * as Types from "./types.ts";
import * as CryptoUtil from "../common/crypto_util.js";

type ExpireFunc = (() => void) | null;
type CryptoData = Uint8Array | string;

function id128() {
	return CryptoUtil.hex(crypto.getRandomValues(new Uint8Array(16)));
}

export class Session {
	#timeout?: number; // timer ID
	#state: Types.SessionState;
	sessionKey?: CryptoKey; // RSA
	id: string;
	token?: Uint8Array; // computed randomly
	expireTime: number;
	expireDate: Date;
	onExpiry: ExpireFunc;
	
	/* typescript is dumb as hell and complains if I set expireTime
	 * here instead of the constructor. typescript stop making me
	 * write awful code challenge (impossible)
	 */
	#kindaSortaAtomicSetTimeout() {
		const e = new Date(Date.now() + this.expireTime * 1000);
		if (!this.onExpiry)
			return e;
		this.#timeout = setTimeout(this.onExpiry, this.expireTime);
		return e;
	}

	constructor(id: string, expires: number, onExpiry: ExpireFunc = null) {
		this.#state = Types.SessionState.INIT;
		this.id = id;
		this.expireTime = expires;
		this.onExpiry = onExpiry;
		this.expireDate = this.#kindaSortaAtomicSetTimeout();
	}

	active() {
		if (this.#timeout !== undefined)
			clearTimeout(this.#timeout);
		this.expireDate = this.#kindaSortaAtomicSetTimeout();
	}

	async cookie(ctx: Context) {
		await ctx.cookies.set("SESSION_ID", this.id, {
			domain: ctx.request.url.hostname,
			expires: this.expireDate
		});
	}

	// 256-bit token
	addToken() {
		this.token = crypto.getRandomValues(new Uint8Array(32));
		this.#state = Types.SessionState.INIT_TOKEN;
	}

	authorize(): boolean {
		if (this.#state !== Types.SessionState.INIT_TOKEN ||
			this.token  === undefined) return false;
		this.#state = Types.SessionState.AUTHORIZED;
		return true;
	}

	state() {
		return this.#state;
	}

	/*
	async decrypt(data: CryptoData, iv: CryptoData) {
		if (this.#state !== Types.SessionState.AUTHORIZED)
			return new CryptoUtil.AESMessage(true, "Unauthorized session");
		return await CryptoUtil.AES_GCM.decrypt(this.sessionKey,
			CryptoUtil.unbase64(data), CryptoUtil.unhex(iv), this.token);
	}

	async encrypt(data: CryptoData) {
		if (this.#state !== Types.SessionState.AUTHORIZED)
			return new CryptoUtil.AESMessage(true, "Unauthorized session");
		return await CryptoUtil.AES_GCM.encrypt(this.sessionKey,
			CryptoUtil.unbase64(data), this.token);
	}
	*/
}

export default class SessionPool {
	pool: Record<string, Session>;
	globalExpire?: number;

	#generateId() {
		let id;
		do { id = id128(); } while (this.pool[id] !== undefined);
		return id;
	}

	constructor(expire?: number) {
		this.pool = {};
		if (expire !== undefined)
			this.globalExpire = expire;
	}

	new(expires?: number): Session {
		const exp = (expires === undefined) ? this.globalExpire : expires;
		if (exp === undefined)
			throw new TypeError("No expiry time provided");
		const id = this.#generateId();
		this.pool[id] = new Session(id, exp, () => this.remove(id));
		return this.pool[id];
	}

	find(id: string): Session {
		return this.pool[id];
	}

	remove(id: string): boolean {
		if (this.pool[id] === undefined)
			return false;
		return delete this.pool[id];
	}
}
