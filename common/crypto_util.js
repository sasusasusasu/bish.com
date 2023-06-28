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
	return btoa(String.fromCharCode.apply(null, a));
}

export function unbase64(str) {
	if (str instanceof Uint8Array)
		return str;
	return Uint8Array.from(atob(String(str)), c => c.charCodeAt(0));
}

export function base64url(arr) {
	return base64(arr).replace(/=/g, "").replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function unbase64url(str) {
	if (str instanceof Uint8Array)
		return str;
	const s = String(str).replace(/\-/g, "+").replace(/_/g, "/");
	return unbase64(s + "=".repeat((4 - s.length % 4) % 4));
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

export class PBKDF2 {
	#kdfMaterial;
	#wrapperKey;

	constructor(passwd) {
		this.#kdfMaterial = null;
		this.#wrapperKey = null;
		this.ready = new Promise((resolve, reject) => {
			crypto.subtle.importKey("raw",
				new TextEncoder().encode(passwd),
				"PBKDF2", false, ["deriveKey", "deriveBits"])
			.then(km => {
				this.#kdfMaterial = km;
				resolve(true); // key material is verboten
			}, e => reject(e));
		});
	}

	async genWrapper() {
		const salt = crypto.getRandomValues(new Uint8Array(64));
		this.#wrapperKey = await crypto.subtle.deriveKey({
			name: "PBKDF2",
			hash: "SHA-256",
			salt: salt,
			iterations: 100000
		}, this.#kdfMaterial, {
			name: "AES-KW",
			length: 256
		}, true, ["wrapKey, unwrapKey"]);
		return salt;
	}

	async wrapPrivateRSA(k) {
		return await crypto.subtle.wrapKey("pkcs8", k, this.#wrapperKey, "AES-KW");
	}

	async unwrapPrivateRSA(k) {
		return await crypto.subtle.unwrapKey("pkcs8", k, this.#wrapperKey, "AES-KW", {
			name: "RSA-OAEP",
			hash: "SHA-256"
		}, true, ["decrypt"]);
	}
}

function messageSanitize(v, msg = false) {
	if (v instanceof Uint8Array)
		return v;
	if (v instanceof Array || v instanceof ArrayBuffer)
		return new Uint8Array(v);
	if (msg && typeof(v) === "string")
		return new TextEncoder().encode(v);
	throw new TypeError("Argument must be a string or Uint8Array-like");
}

export class Message {
	/**
	 * Create a Message object from an exported object
	 * @param {Record<string, unknown>} obj The object to import
	 */
	static import(obj) {
		if (!obj.isCryptoMsgExport)
			return new Message(true, "Invalid message object");
		if (obj.error)
			return new Message(obj.error, obj.errorMsg);
		return new Message(obj.error, unbase64(obj.message));
	}

	constructor(error) {
		const args = Array.from(arguments).slice(1);
		this.error = error;
		if (this.error === true)
			this.errorMsg = args[0];
		else if (args.length)
			[this.message, this.errorMsg] = [messageSanitize(args[0], true), "OK" ];
		this.isCryptoMsg = true;
		this.messageType = "generic";
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
			console.warn("Message.decodeObject:", e.message);
			return null;
		}
	}

	/**
	 * Return a hex string representing the initialization vector.
	 */

	/**
	 * Return a base64 string representing the message content.
	 */
	base64() {
		if (this.error)
			return;
		return base64(this.message);
	}

	/**
	 * Create an export of this Message object
	 */
	export() {
		const base = {
			isCryptoMsgExport: true,
			messageType: "generic",
			error: this.error,
			errorMsg: this.errorMsg
		};
		if (this.error)
			return base;
		return {
			...base,
			message: base64(this.message)
		};
	}

	json() {
		const c = this.export();
		if (c.error)
			return JSON.stringify({error: c.error, errorMsg: c.errorMsg});
		return JSON.stringify(c);
	}
}

export class AESMessage extends Message {
	static import(obj) {
		if (obj.messageType !== "aes")
			return new AESMessage(true, "Invalid message object");
		if (obj.error)
			return new AESMessage(obj.error, obj.errorMsg);
		return new AESMessage(obj.error, unbase64(obj.message), unhex(obj.iv));
	}

	constructor(error) {
		super(...arguments);
		this.messageType = "aes";
		if (error)
			return this;
		if (arguments.length < 3) {
			this.error = true;
			this.errorMsg = "Not enough arguments: IV missing";
			return this;
		}
		this.iv = arguments[2];
	}

	export() {
		const e = super.export();
		e.messageType = "aes";
		if (e.error)
			return e;
		e.iv = hex(this.iv);
		return e;
	}

	hexIv() {
		if (this.error)
			return;
		return hex(this.iv);
	}
}

export class RSA_OAEP {
	static #rsa(op, key, data, label = null) {
		return crypto.subtle[op]({
			name: "RSA-OAEP",
			...((label === null) ? {} : { label: label })
		}, key, data);
	}

	static async encrypt(pubkey, data, label = null) {
		try {
			var enc = await RSA_OAEP.#rsa("encrypt", pubkey, data, label);
		} catch (e) { return new Message(true, e.message); }
		return new Message(false, new Uint8Array(enc));
	}

	static async decrypt(privkey, data, label = null) {
		try {
			var dec = await RSA_OAEP.#rsa("decrypt", privkey, data, label);
		} catch (e) { return new Message(true, e.message); }
		return new Message(false, new Uint8Array(dec));
	}
}

export class AES_GCM {
	static #gcm(key, op, init, data, additional = null) {
		return crypto.subtle[op]({
			name: "AES-GCM",
			iv: init,
			...((additional === null) ? {} : {additionalData: additional}),
			tagLength: 128
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
		return new AESMessage(false, new Uint8Array(enc), init);
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
		return new AESMessage(false, new Uint8Array(dec), init);
	}

	/**
	 * Like AES_GCM.decrypt(), but take an AESMessage instead of Uint8Array
	 * @param {CryptoKey} key AES key
	 * @param {Message | Object} msg Message
	 * @param {boolean} msg.isCryptoMsgExport If true, msg is an exported Message
	 * @param {Uint8Array | null} additional Authentication data
	 */
	static async decryptMsg(key, msg, additional = null) {
		if (!msg.messageType !== "aes")
			return new AESMessage(true, "Argument 1 is not an AESMessage");
		const m = msg.isCryptoMsgExport ? unbase64(msg.message) : msg.message;
		const iv = msg.isCryptoMsgExport ? unhex(msg.iv) : msg.iv;
		return await AES_GCM.decrypt(key, m, iv, additional);
	}
}

export class ECDH {
	static #import(raw) {
		return crypto.subtle.importKey("raw", raw, {
			name: "ECDH",
			namedCurve: "P-384"
		}, true, []);
	}

	constructor(keypair = null) {
		this.ready = new Promise((resolve, reject) => {
			if (keypair !== null) {
				this.keypair = keypair;
				resolve(keypair);
				return;
			}
			crypto.subtle.generateKey({
				name: "ECDH",
				namedCurve: "P-384" // Deno doesn't support P-521
			}, true, ["deriveKey", "deriveBits"]).then(kp => {
				this.keypair = kp;
				resolve(kp);
			}, e => reject(e));
		});
	}

	/**
	 * Export the public key as a hex string.
	 */
	async exportKey() {
		await this.ready;
		const k = await crypto.subtle.exportKey("raw",
			this.keypair.publicKey);
		return hex(k);
	}

	async exportPrivateKey() {
		await this.ready;
		const k = await crypto.subtle.exportKey("pkcs8",
			this.keypair.publicKey);
		return k;
	}

	/**
	 * Derive an AES-GCM-256 key from an ECDH key pair. The private key is
	 * contained in this object.
	 * @param {String} theirs Public key
	 */
	async deriveAES(theirs) {
		await this.ready;
		return await crypto.subtle.deriveKey({
			name: "ECDH",
			public: await ECDH.#import(unhex(theirs))
		}, this.keypair.privateKey, {
			name: "AES-GCM",
			length: 256
		}, false, ["encrypt", "decrypt"]);
	}
}
