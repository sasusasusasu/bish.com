/* main.ts - bish.com backend (I'm very sorry)
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

import * as path from "https://deno.land/std@0.189.0/path/mod.ts";
import * as oak from "https://deno.land/x/oak@v12.5.0/mod.ts";
import mongodb from "npm:mongodb";

import * as CryptoUtil from "../common/crypto_util.js";

type DbClient = mongodb.MongoClient;
type JsObject = Record<string, unknown>;
type Base64String = string;
type WebBase64<T extends string> = `data:${T};base64,${Base64String}`
type WebImage = WebBase64<"image/png" | "image/jpeg">;
type HexString = string;

interface Product {
	id: bigint,
	seller: bigint, // seller ID
	name: string,
	price: number, // euro cents
	picture: Array<WebImage>
}

interface UserCommon {
	name: string,
	id: bigint, // assigned on registration
	admin: boolean
}

interface UserEncrypted extends UserCommon {
	enc: Base64String
}

interface User extends UserCommon {
	hash: HexString,
	joined: bigint,
	picture: WebImage
}

interface BishContext extends oak.Context {
	users?: mongodb.Collection<UserEncrypted>,
	products?: mongodb.Collection<Product>
}

interface Server extends oak.Application {
	abortController: AbortController
}

const DENO_DIR = path.dirname(path.fromFileUrl(Deno.mainModule));
const DENO_HOST = "localhost";
const DENO_PORT = 8443;
const MONGO_PORT = 27017;
const MONGO_URI = `mongodb://${DENO_HOST}:${MONGO_PORT}`;
const HOST_DIRS = ["html", "css", "assets"];

const ecdh = new CryptoUtil.ECDH_AES();
const router = new oak.Router();

// weird event flippy-floppy. I dislike async stuff a lot
function interrupt(mdb: DbClient, svr: Server) {
	console.log("");
	const closed = {
		mongo: false,
		svr: false
	};
	svr.addEventListener("close", () => {
		closed.svr = true;
		console.log("HTTPS server closed");
		if (closed.mongo)
			Deno.exit(0);
	});
	mdb.close().then(() => {
		closed.mongo = true;
		console.log("MongoDB client closed");
		if (closed.svr)
			Deno.exit(0);
	});
	svr.abortController.abort();
}

function main(mdb: DbClient) {
	console.log("MongoDB connected to", MONGO_URI);
	const dbBish = mdb.db("bishempty");
	
	const svr = <Server>new oak.Application();
	svr.abortController = new AbortController();

	// add mongodb collections to context
	svr.use(async (ctx, next) => {
		(<BishContext>ctx).users = dbBish.collection<UserEncrypted>("users");
		(<BishContext>ctx).products = dbBish.collection<Product>("products");
		await next();
	});
	svr.use(router.routes());
	svr.use(router.allowedMethods());

	svr.addEventListener("listen", () => {
		console.log(`HTTPS server listening on ${DENO_HOST}:${DENO_PORT}`);
		Deno.addSignalListener("SIGINT", () => interrupt(mdb, svr));
		Deno.addSignalListener("SIGTERM", () => interrupt(mdb, svr));
	});

	svr.listen({
		secure: true,
		hostname: DENO_HOST,
		port: DENO_PORT,
		cert: Deno.readTextFileSync("./tls/cert.pem")
			+ Deno.readTextFileSync("./tls/root.pem"),
		key: Deno.readTextFileSync("./tls/ckey.pem"),
		signal: svr.abortController.signal
	});
}

function listen() {
	mongodb.MongoClient.connect(MONGO_URI)
		.then((conn: DbClient) => main(conn), (e: Error) => {
			console.log("MongoDB connection failed:", e.message);	
			Deno.exit(1);
		});
}

function serveJson(ctx: oak.Context, code: number, body: JsObject) {
	ctx.response.type = "application/json";
	ctx.response.status = code;
	ctx.response.body = body;
}

function serveError(ctx: oak.Context, code: number, msg: string) {
	console.log("Serving", code, msg);
	serveJson(ctx, code, {
		error: true,
		message: msg
	});
}

function checkKeys(ctx: oak.Context) {
	if (!ecdh.keypairReady) {
		serveError(ctx, 503, "ECDH keys not ready");
		return false;
	}
	return true;
}

async function serveFileFrom(ctx: oak.Context, dir: string, file: string) {
	console.log("Serving", file, "from", dir);
	await oak.send(ctx, file, {
		root: path.normalize(path.join(DENO_DIR, "..", dir))
	});
}

Deno.chdir(DENO_DIR);

router.get("/", async ctx =>
	await serveFileFrom(ctx, HOST_DIRS[0], "index.html"));

HOST_DIRS.forEach(dir => {
	router.get(`/${dir}/:path`, async ctx =>
		await serveFileFrom(ctx, dir, ctx.params.path));
});

router.post("/login", ctx => {
	if (!checkKeys(ctx))
		return;
	serveError(ctx, oak.Status.NotImplemented, "Login not implemented (soon!)");
});

if (import.meta.main)
	listen();
