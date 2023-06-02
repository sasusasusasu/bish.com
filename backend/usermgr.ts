import mongodb from "npm:mongodb";

import Logger from "../common/logger.js";
import * as Types from "./types.ts";
import * as CryptoUtil from "../common/crypto_util.js";

export default class UserManager {
	#collection: mongodb.Collection<Types.UserEncrypted>;
	static #logger = new Logger("UserManager");

	static #uuid(): Types.UUID {
		return <Types.UUID>crypto.randomUUID();
	}

	static async #encrypt(key: CryptoKey, user: Types.User):
		Promise<Types.UserEncrypted | null> {
		const encoded = CryptoUtil.encodeObject({
			hash: user.hash,
			joined: user.joined,
			picture: user.picture,
			cart: user.cart
		});
		const msg = (await CryptoUtil.AES_GCM.encrypt(key, encoded)).export();
		if (msg.error) {
			UserManager.#logger.error("User encryption failed:", msg.errorMsg);
			return null;
		}
		return <Types.UserEncrypted> {
			id: user.id,
			name: user.name,
			admin: user.admin,
			iv: <Types.HexString>msg.iv,
			enc: <Types.Base64String>msg.message
		};
	}

	constructor(coll: mongodb.Collection<Types.UserEncrypted>) {
		this.#collection = coll;
	}

	async createUser(key: CryptoKey, name: string,
		hash: Types.HexString, picture: Types.WebImage) {
		const u = <Types.User> {
			id: UserManager.#uuid(),
			name: name,
			admin: false,
			hash: hash,
			joined: BigInt(Math.floor(Date.now() / 1000)),
			picture: picture,
			cart: []
		};
		if (await this.getUserByName(u.name) !== null) {
			UserManager.#logger.error("User already exists:", u.name);
			return;
		}
		for (let times = 0;
			times < 10 && await this.getUserById(u.id) !== null;
			times++)
			u.id = UserManager.#uuid();
		if (await this.getUserById(u.id) !== null) {
			UserManager.#logger.error(
				"Cannot find a free UUID after 10 attempts (somehow)");
			return;
		}
		const enc = await UserManager.#encrypt(key, u);
		if (!enc)
			return;
		this.#collection.insertOne(enc);
		UserManager.#logger.log(`New user '${enc.name}', id`, enc.id);
	}

	async setUserAdmin(id: Types.UUID, admin: boolean): Promise<boolean> {
		const u = await this.getUserById(id);
		if (u === null) {
			UserManager.#logger.component("setUserAdmin")
				.error("no such user:", id);
			return false;
		}
		const res = await this.#collection.updateOne({id: id}, {$set: {admin: admin}});
		if (!res.acknowledged || res.modifiedCount < 1) {
			UserManager.#logger.component("setUserAdmin")
				.error("Failed updating admin status");
			return false;
		}
		return true;
	}

	async getUserByName(name: string): Promise<Types.UserEncrypted | null> {
		return await this.#collection.findOne({name: name});
	}

	async getUserById(id: Types.UUID): Promise<Types.UserEncrypted | null> {
		return await this.#collection.findOne({id: id});
	}
}
