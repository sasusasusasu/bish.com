import mongodb from "npm:mongodb";

import Logger from "../common/logger.js";
import * as Types from "./types.ts";
import * as CryptoUtil from "../common/crypto_util.js";

type UserResult = Promise<Types.UserEncrypted | null>;
type UserUpdate = Partial<Pick<Types.User, "name" | "picture" | "cart" | "listings">>;
type UserUpdateExport = Partial<Pick<Types.UserExport, "name" | "picture" | "cart" | "listings">>;

function exportUserUpdate(u: UserUpdate): UserUpdateExport {
	return <UserUpdateExport> { ...u,
		listings: u.listings?.map(l => Types.exportProduct(l))
	};
}

const logger = new Logger("UserManager");
const loggerUpdate = logger.component("updateUser");

function uuid(): Types.UUID {
	return <Types.UUID> crypto.randomUUID();
}

async function encrypt(key: CryptoKey, user: Types.User):
	Promise<Types.UserEncrypted | null> {
	const ue = Types.exportUser(user);
	const encoded = CryptoUtil.encodeObject({
		joined: ue.joined,
		updated: ue.updated,
		picture: ue.picture,
		cart: ue.cart,
		listings: ue.listings
	});
	const msg = (await CryptoUtil.AES_GCM.encrypt(key, encoded)).export();
	if (msg.error) {
		logger.component("encrypt")
			.error("User encryption failed:", msg.errorMsg);
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

export default class UserManager {
	#collection: mongodb.Collection<Types.UserEncrypted>;

	constructor(coll: mongodb.Collection<Types.UserEncrypted>) {
		this.#collection = coll;
	}

	async #uuidFree(attempts: number): Promise<Types.UUID | null> {
		let id, t = 0;
		do {
			id = uuid();
			t++;
		} while (t < attempts && await this.getUserById(id) !== null);
		if (await this.getUserById(id) !== null)
			return null;
		return id;
	}

	async #checkId(id: Types.UUID, comp: string): UserResult {
		const u = await this.getUserById(id);
		if (await this.getUserById(id) !== null)
			return u;
		logger.component(comp).error("no such user:", id);
		return null;
	}

	async createUser(key: CryptoKey, name: string,
		picture: Types.WebImage | null): UserResult {
		const ts = Math.floor(Date.now() / 1000);
		const u = <Types.User> {
			id: await this.#uuidFree(10),
			name: name,
			admin: false,
			joined: ts,
			updated: ts,
			picture: picture,
			cart: [],
			listings: []
		};
		if (await this.getUserByName(u.name) !== null) {
			logger.error("User already exists:", u.name);
			return null;
		}
		if (u.id === null) {
			logger.error("No free UUID found after 10 attempts (somehow)");
			return null;
		}
		const enc = await encrypt(key, u);
		if (!enc)
			return null;
		this.#collection.insertOne(enc);
		logger.log(`New user '${enc.name}', id`, enc.id);
		return enc;
	}

	async updateUser(key: CryptoKey, id: Types.UUID, data: UserUpdate):
		Promise<boolean> {
		const u = await this.#checkId(id, "updateUser");
		if (!u) return false;

		// decrypt user data
		const msg = await CryptoUtil.AES_GCM.decrypt(key,
			CryptoUtil.unbase64(u.enc), CryptoUtil.unhex(u.iv));
		if (msg.error) {
			loggerUpdate.error("Decryption failed:", msg.errorMsg);
			return false;
		}
		// update user data
		const udata = {...msg.decodeObject(), ...exportUserUpdate(data),
			updated: Math.floor(Date.now() / 1000)};

		// re-encrypt updated data
		const reenc = await CryptoUtil.AES_GCM.encrypt(key,
			CryptoUtil.encodeObject(udata));
		if (reenc.error) {
			loggerUpdate.error("Re-encryption failed:", reenc.errorMsg);
			return false;
		}

		// write re-encrypted data into database
		const wres = await this.#collection.updateOne({id: id}, {$set: {
			iv: reenc.ivHex(), enc: reenc.base64()
		}});
		if (!wres.acknowledged || wres.modifiedCount < 1) {
			logger.component("updateUser").error("Failed updating user");
			return false;
		}
		return true;
	}

	async setUserAdmin(id: Types.UUID, admin: boolean): Promise<boolean> {
		if (!await this.#checkId(id, "setUserAdmin"))
			return false;
		const res = await
			this.#collection.updateOne({id: id}, {$set: {admin: admin}});
		if (!res.acknowledged || res.modifiedCount < 1) {
			logger.component("setUserAdmin")
				.error("Failed updating admin status");
			return false;
		}
		return true;
	}

	async getUserByName(name: string): UserResult {
		return await this.#collection.findOne({name: name});
	}

	async getUserById(id: Types.UUID): UserResult {
		return await this.#collection.findOne({id: id});
	}
}
