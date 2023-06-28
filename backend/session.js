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


import mongo from "npm:mongodb";

import * as Types from "./types.ts";
import * as CryptoUtil from "../common/crypto_util.js";

function id128() {
	return CryptoUtil.hex(crypto.getRandomValues(new Uint8Array(16)));
}

export class Session {
	#timeout; // timer ID
	#state;
	#collection;

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

	constructor(coll, id, expires, onExpiry = null) {
		this.#state = Types.SessionState.INIT;
		this.#collection = coll;
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

	async cookie(ctx) {
		await ctx.cookies.set("SESSION_ID", this.id, {
			domain: ctx.request.url.hostname,
			expires: this.expireDate
		});
	}

	// 256-bit token
	challenge(ctx) {
		const chl = crypto.getRandomValues(new Uint8Array(64));
		ctx.response.body = { challenge: chl };
		this.#state = Types.SessionState.INIT_CHL;
	}

	async userName(u) {
		const res = await this.#collection.findOne({ name: u });
		if (!res) {
			this.user = null;
			return false;
		}
		this.user = res;
		return true;
	}

	authorize() {
		if (this.#state !== Types.SessionState.INIT_CHL) return false;
		this.#state = Types.SessionState.AUTHORIZED;
		return true;
	}

	state() {
		return this.#state;
	}

	async encrypt(data) {
		if (!this.publicKey)
			return new CryptoUtil.AESMessage(true, "Public key not ready");
		if (this.#state !== Types.SessionState.AUTHORIZED)
			return new CryptoUtil.AESMessage(true, "Unauthorized session");
		return await CryptoUtil.AES_GCM.encrypt(this.publicKey,
			CryptoUtil.unbase64(data), this.token);
	}
}

export default class UserSessionPool {
	#generateId() {
		let id;
		do { id = id128(); } while (this.pool[id] !== undefined);
		return id;
	}

	constructor(users, expire) {
		this.users = users;
		this.pool = {};
		if (expire !== undefined)
			this.globalExpire = expire;
	}

	addNew(expires) {
		const exp = (expires === undefined) ? this.globalExpire : expires;
		if (exp === undefined)
			throw new TypeError("No expiry time provided");
		const id = this.#generateId();
		this.pool[id] = new Session(this.users, id, exp, () => this.remove(id));
		return this.pool[id];
	}

	find(id) {
		return this.pool[id];
	}

	remove(id) {
		if (this.pool[id] === undefined)
			return false;
		return delete this.pool[id];
	}
}
