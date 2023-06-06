import * as Types from "./types.ts";

export default class Session {
	#timeout;
	state: Types.SessionState;
	token: Types.HexString;
	sessionKey: CryptoKey;
	expires: number;
	onExpiry: (() => void) | null;
	constructor(state: Types.SessionState, token: Types.HexString,
		key: CryptoKey, onExpiry: (() => void) | null = null,
		expires: number = 3600) {
		this.state = state;
		this.token = token;
		this.sessionKey = key;
		this.expires = expires;
		this.onExpiry = onExpiry;
		this.#timeout = this.onExpiry ?
			setTimeout(this.onExpiry, this.expires) : null;
	}

	active() {
		if (!this.#timeout || !this.onExpiry)
			return;
		clearTimeout(this.#timeout);
		this.#timeout = setTimeout(this.onExpiry, this.expires);
	}
}
