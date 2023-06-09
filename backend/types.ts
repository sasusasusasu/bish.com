import * as oak from "https://deno.land/x/oak@v12.5.0/mod.ts";
import mongodb from "npm:mongodb";

export type DbClient = mongodb.MongoClient;
export type JsObject = Record<string, unknown>;
export type UUID = string;
export type Serial = bigint;
export type SerialString = string;
export type Timestamp = number;
export type WebBase64<T extends string> = `data:${T};base64,${string}`;
export type WebImage = WebBase64<"image/png" | "image/jpeg">;
export type JsxServeContext = oak.RouterContext<`/${string}/:path`>;

export enum SessionState {
	INVALID = 0,
	INIT,
	INIT_CHL,
	AUTHORIZED
}

export interface Product {
	id: Serial,
	seller: UUID, // seller user ID
	name: string,
	price: number, // euro cents
	available: number, // how many items are available; -1 for infinite
	added: Timestamp,
	updated: Timestamp,
	pictures: Array<WebImage>,
}

// public-facing user data
export interface UserCommon {
	id: UUID, // assigned on registration
	name: string,
	admin: boolean,
	picture: WebImage,
	listings: Array<Product>,
	salt: Uint8Array,
	rsaPublic: Uint8Array,
	rsaPrivateWrapped: Uint8Array
}

// secure user data (encrypted). use this to store user data
export interface UserEncrypted extends UserCommon {
	iv: string,
	enc: string
}

// secure user data. DO NOT PUT THIS IN THE DATABASE
export interface User extends UserCommon {
	joined: Timestamp,
	updated: Timestamp,
	cart: Array<Record<SerialString, number>>,
}

export interface ProductExport extends Omit<Product, "id"> {
	id: SerialString
}

export interface UserExport extends Omit<User, "listings"> {
	listings: Array<ProductExport>
}

export interface BishContext extends oak.Context {
	users?: mongodb.Collection<UserEncrypted>,
	products?: mongodb.Collection<Product>
}

export interface Server extends oak.Application {
	abortController: AbortController
}

export function exportProduct(product: Product): ProductExport {
	return <ProductExport> { ...product, id: String(product.id) };
}

export function exportUser(user: User): UserExport {
	return <UserExport> { ...user,
		listings: user.listings.map(l => exportProduct(l))
	};
}
