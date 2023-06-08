/* crypto_util.js - cryptography helper and other related utils
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

export function encodeObject(obj) {
	return new TextEncoder().encode(JSON.stringify(obj));
}

export function hex(arr) {
	const a = (arr instanceof Uint8Array) ? arr : new Uint8Array(arr);
	return Array.from(a).map(b =>
		b.toString(16).padStart(2, "0")).join("");
}

export function unhex(str) {
	if (str instanceof Uint8Array)
		return str;
	const s = String(str);
	if (s.length % 2)
		throw new TypeError("String length must be divisible by 2");
	return new Uint8Array([...new Array(Math.floor(s.length / 2)).keys()]
		.map(v => {
			const n = parseInt(s.substring(v * 2, v * 2 + 2), 16);
			if (isNaN(n))
				throw new TypeError(`Invalid characters near ${v * 2}`);
			return n;
		}));
}

export function base64(arr) {
	const a = (arr instanceof Uint8Array) ? arr : new Uint8Array(arr);
	return btoa(new TextDecoder().decode(a));
}

export function unbase64(str) {
	if (str instanceof Uint8Array)
		return str;
	const s = String(str);
	return new TextEncoder().encode(atob(s));
}

export async function sha256(data) {
	return hex(await crypto.subtle.digest("SHA-256", data));
}

export async function sha256str(str) {
	return await sha256(new TextEncoder().encode(str));
}

export async function sha256hex(hex) {
	return await sha256(unhex(hex));
}

export class HMAC {
	static async key(digest) {
		return await crypto.subtle.generateKey({
			name: "HMAC", hash: digest
		}, true, ["sign", "verify"]);
	}

	static async keyRaw(digest) {
		return new Uint8Array(await crypto.subtle.exportKey("raw",
			await genHMAC(digest)));
	}

	static async keyRing(digest, numKeys) {
		return await Promise.all(new Array(numKeys).map(_ =>
			HMAC.key(digest)));
	}

	static async keyRingRaw(digest, numKeys) {
		return await Promise.all(new Array(numKeys).map(_ =>
			HMAC.keyRaw(digest)));
	}
}

export class AESMessage {
	static #sanitize(v, msg = false) {
		if (v instanceof Uint8Array)
			return v;
		if (v instanceof Array || v instanceof ArrayBuffer)
			return new Uint8Array(v);
		if (msg && typeof(v) === "string")
			return new TextEncoder().encode(v);
		throw new TypeError("Argument must be a string or Uint8Array-like");
	}
	/**
	 * Create an AESMessage object from an exported object
	 * @param {Record<string, unknown>} obj The object to import
	 */
	static import(obj) {
		if (!obj.isAesMsgExport)
			return new AESMessage(true, "Invalid message object");
		if (obj.error)
			return new AESMessage(obj.error, obj.errorMsg);
		return new AESMessage(obj.error, unhex(obj.iv), unbase64(obj.message));
	}

	constructor(error) {
		const args = Array.from(arguments).slice(1);
		this.error = error;
		if (this.error === true)
			this.errorMsg = args[0];
		else if (args.length > 1)
			[this.iv, this.message, this.errorMsg] = [
				AESMessage.#sanitize(args[0]),
				AESMessage.#sanitize(args[1], true), "OK" ];
		this.isAesMsg = true;
	}

	/**
	 * Decode the message using a TextDecoder
	 */
	decode() {
		if (this.error)
			return null;
		return new TextDecoder().decode(this.message);
	}

	/**
	 * Decode the message using a TextDecoder and interpret the result
	 * as a JSON object.
	 */
	decodeObject() {
		if (this.error)
			return null;
		try {
			return JSON.parse(this.decode());
		} catch(e) {
			console.warn("AESMessage.decodeObject:", e.message);
			return null;
		}
	}

	/**
	 * Return a hex string representing the initialization vector.
	 */
	ivHex() {
		if (this.error)
			return;
		return hex(this.iv);
	}

	/**
	 * Return a base64 string representing the message content.
	 */
	base64() {
		if (this.error)
			return;
		return base64(this.message);
	}

	/**
	 * Create an export of this AESMessage object
	 */
	export() {
		return {
			isAesMsgExport: true,
			error: this.error,
			errorMsg: this.errorMsg,
			iv: hex(this.iv),
			message: base64(this.message)
		}
	}

	json() {
		const c = this.export();
		if (c.error)
			return JSON.stringify({error: c.error, errorMsg: c.errorMsg});
		return JSON.stringify(c);
	}
}

export class AES_GCM {
	static #gcm(key, op, init, data, additional = null) {
		return crypto.subtle[op]({
			name: "AES-GCM",
			iv: init,
			...((additional === null) ? {} : {additionalData: additional}),
			tagLength: 96
		}, key, data);
	}

	/**
	 * Generate a 96-bit IV and encrypt a message using AES-GCM-256
	 * @param {CryptoKey} key AES key
	 * @param {Uint8Array} msg Message
	 * @param {Uint8Array | null} additional Authentication data
	 */
	static async encrypt(key, msg, additional = null) {
		const init = crypto.getRandomValues(new Uint8Array(12));
		try {
			var enc = await AES_GCM.#gcm(key, "encrypt",
				init, msg, additional);
		} catch(e) { return new AESMessage(true, e.message); }
		return new AESMessage(false, init, new Uint8Array(enc));
	}

	/**
	 * Decrypt an AES-GCM-256 message given the IV and authentication data
	 * @param {CryptoKey} key AES key
	 * @param {Uint8Array} msg Encrypted message
	 * @param {Uint8Array} init Initialization vector
	 * @param {Uint8Array | null} additional Authentication data
	 */
	static async decrypt(key, msg, init, additional = null) {
		try {
			var dec = await AES_GCM.#gcm(key, "decrypt",
				init, msg, additional);
		} catch(e) { return new AESMessage(true, e.message); }
		return new AESMessage(false, init, new Uint8Array(dec));
	}

	/**
	 * Like AES_GCM.decrypt(), but take an AESMessage instead of Uint8Array
	 * @param {CryptoKey} key AES key
	 * @param {AESMessage | Object} msg Message
	 * @param {boolean} msg.isAesMsgExport If true, msg is an exported AESMessage
	 * @param {Uint8Array | null} additional Authentication data
	 */
	static async decryptMsg(key, msg, additional = null) {
		if (!msg.isAesMsg && !msg.isAesMsgExport)
			return new AESMessage(true, "Argument 1 was not an AESMessage");
		const m = msg.isAesMsgExport ? unbase64(msg.message) : msg.message;
		const iv = msg.isAesMsgExport ? unhex(msg.iv) : msg.iv;
		return await AES_GCM.decrypt(key, m, iv, additional);
	}
}

export class ECDH_AES {
	static #import(raw) {
		return crypto.subtle.importKey("raw", raw, {
			name: "ECDH",
			namedCurve: "P-384"
		}, true, []);
	}

	constructor() {
		this.keypairReady = false;
		crypto.subtle.generateKey({
			name: "ECDH",
			namedCurve: "P-384" // Deno doesn't support P-521
		}, false, ["deriveKey"]).then(kp => {
			this.keypair = kp;
			this.keypairReady = true;
			this.#keypairHandler(kp);
		});
	}

	#keypairHandler = _ => false;
	onKeypairReady(cb) {
		this.#keypairHandler = (typeof(cb) === "function") ?
			cb : this.#keypairHandler;
		if (this.keypairReady)
			this.#keypairHandler(this.keypair);
	}

	/**
	 * Export the public key as a hex string.
	 */
	async exportKey() {
		const k = await crypto.subtle.exportKey("raw",
			this.keypair.publicKey);
		return hex(k);
	}

	/**
	 * Derive an AES-GCM-256 key from an ECDH key pair. The private key is
	 * contained in this object.
	 * @param {String} theirs Public key
	 */
	async deriveAES(theirs) {
		if (!this.keypairReady)
			throw new ReferenceError("ECDH keypair not ready");
		return await crypto.subtle.deriveKey({
			name: "ECDH",
			public: await ECDH_AES.#import(unhex(theirs))
		}, this.keypair.privateKey, {
			name: "AES-GCM",
			length: 256
		}, false, ["encrypt", "decrypt"]);
	}
}
