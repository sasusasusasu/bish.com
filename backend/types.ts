import * as oak from "https://deno.land/x/oak@v12.5.0/mod.ts";
import mongodb from "npm:mongodb";

export type DbClient = mongodb.MongoClient;
export type JsObject = Record<string, unknown>;
export type Base64String = string;
export type UUID = string;
export type Serial = bigint;
export type SerialString = string;
export type Timestamp = bigint;
export type WebBase64<T extends string> = `data:${T};base64,${Base64String}`;
export type WebImage = WebBase64<"image/png" | "image/jpeg">;
export type HexString = string;
export type JsxServeContext = oak.RouterContext<`/${string}/:path`>;

export interface Product {
	id: Serial,
	seller: UUID, // seller user ID
	name: string,
	price: number, // euro cents
	picture: Array<WebImage>
}

export interface UserCommon {
	id: UUID, // assigned on registration
	name: string,
	admin: boolean
}

export interface UserEncrypted extends UserCommon {
	iv: HexString,
	enc: Base64String
}

export interface User extends UserCommon {
	hash: HexString,
	joined: Timestamp,
	picture: WebImage,
	cart: Array<Record<SerialString, number>>
}

export interface BishContext extends oak.Context {
	users?: mongodb.Collection<UserEncrypted>,
	products?: mongodb.Collection<Product>
}

export interface Server extends oak.Application {
	abortController: AbortController
}
