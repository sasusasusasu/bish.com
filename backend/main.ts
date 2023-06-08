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

import CachedTranspiler from "./transpiler.ts";
import SessionPool from "./session.ts";
import Logger from "../common/logger.js";
import * as Util from "./util.ts";
import * as Safe from "./safe.ts";
import * as Types from "./types.ts";
import * as CryptoUtil from "../common/crypto_util.js";

const DENO_DIR = path.dirname(path.fromFileUrl(Deno.mainModule));
const DENO_HOST = "localhost";
const DENO_PORT = 8443;
const MONGO_PORT = 27017;
const SESSION_EXPIRE = 3600; // seconds
const MONGO_URI = `mongodb://${DENO_HOST}:${MONGO_PORT}`;
const ROOT_DIR = path.resolve(DENO_DIR, "..");
const HOST_DIRS = ["common", "assets", "frontend"];

Deno.chdir(DENO_DIR);

const logger = new Logger("Main");
const loggerNet = logger.component("Network");
const loggerRoute = logger.component("Routing");
const loggerFile = logger.component("ServeFile");
const loggerAuth = logger.component("UserAuth");
const certKey = Deno.readTextFileSync("./tls/ckey.pem");
const certChain = Deno.readTextFileSync("./tls/cert.pem")
	+ Deno.readTextFileSync("./tls/root.pem");
const tscache = new CachedTranspiler("./cache", ROOT_DIR);
const ecdh = new CryptoUtil.ECDH_AES();
const router = new oak.Router();
const sessions = new SessionPool(SESSION_EXPIRE);

logger.log("Starting from", DENO_DIR);

// weird event flippy-floppy. I dislike async stuff a lot
function interrupt(mdb: Types.DbClient, svr: Types.Server) {
	console.log("");
	tscache.write();
	const closed = {
		mongo: false,
		svr: false
	};
	svr.addEventListener("close", () => {
		closed.svr = true;
		loggerNet.log("HTTPS server closed");
		if (closed.mongo)
			Deno.exit(0);
	});
	mdb.close().then(() => {
		closed.mongo = true;
		loggerNet.log("MongoDB client closed");
		if (closed.svr)
			Deno.exit(0);
	});
	svr.abortController.abort();
}

async function serveFileFrom(ctx: oak.Context, dir: string, file: string) {
	loggerFile.log("Serving", file, "from", dir);
	await oak.send(ctx, file, { root: dir });
}

async function serveFileRequest(ctx: oak.Context, next: oak.Next) {
	if (ctx.request.method !== "GET")
		return next();
	const prel = ctx.request.url.pathname;
	const pabs = path.join(ROOT_DIR, prel);
	const ext = prel.split(".").at(-1);
	if (!HOST_DIRS.includes(Util.splitPath(prel)[0])) {
		loggerFile.log("Not included in host dirs:", prel);
		return next();
	}
	/* process JSX and serve the output from the transpiler cache
	 * if the path extension is .js and the corresponding .jsx file
	 * exists locally
	 */
	if (ext === "js" && Safe.stat(pabs + "x").isFile) {
		await serveFileFrom(ctx, DENO_DIR,
			await tscache.transpile(pabs + "x"));
		return;
	}
	if (Safe.stat(pabs).isFile)
		return serveFileFrom(ctx, ROOT_DIR, prel);
	loggerFile.log("Not serving", prel);
	return next();
}

async function main(mdb: Types.DbClient) {
	loggerNet.log("MongoDB connected to", MONGO_URI);
	const dbBish = mdb.db("bishempty");
	
	const svr = <Types.Server>new oak.Application();
	svr.abortController = new AbortController();
	svr.keys = await CryptoUtil.HMAC.keyRingRaw("SHA-256", 5);

	// add mongodb collections to context
	svr.use((ctx, next) => {
		(<Types.BishContext>ctx).users =
			dbBish.collection<Types.UserEncrypted>("users");
		(<Types.BishContext>ctx).products =
			dbBish.collection<Types.Product>("products");
		return next();
	});
	svr.use(router.routes());
	svr.use(router.allowedMethods());
	svr.use(serveFileRequest);

	svr.addEventListener("listen", () => {
		loggerNet.log(`HTTPS server listening on ${DENO_HOST}:${DENO_PORT}`);
		Deno.addSignalListener("SIGINT", () => interrupt(mdb, svr));
		Deno.addSignalListener("SIGTERM", () => interrupt(mdb, svr));
	});

	try {
		svr.listen({
			secure: true,
			hostname: DENO_HOST,
			port: DENO_PORT,
			cert: certChain,
			key: certKey,
			signal: svr.abortController.signal
		});
	} catch(e) {
		loggerNet.error("HTTPS server setup failed:", e.message);
		mdb.close().then(() => {
			loggerNet.log("MongoDB client closed");
			Deno.exit(1);
		});
	}
}

function listen() {
	mongodb.MongoClient.connect(MONGO_URI)
		.then((conn: Types.DbClient) => main(conn), (e: Error) => {
			loggerNet.error("MongoDB connection failed:", e.message);	
			Deno.exit(1);
		});
}

function serveJson(ctx: oak.Context, code: number, body: Types.JsObject) {
	ctx.response.type = "application/json";
	ctx.response.status = code;
	// error can be overridden in body
	ctx.response.body = { error: false, ...body };
}

function serveError(ctx: oak.Context, code: number, msg: string) {
	loggerRoute.info("Serving HTTP error", code, msg);
	serveJson(ctx, code, {
		error: true,
		message: msg
	});
}

function checkKeys(ctx: oak.Context) {
	if (!ecdh.keypairReady) {
		serveError(ctx, oak.Status.ServiceUnavailable, "ECDH keys not ready");
		return false;
	}
	return true;
}

function checkBody(ctx: oak.Context) {
	if (!ctx.request.hasBody) {
		serveError(ctx, oak.Status.BadRequest, "No data");
		return false;
	}
	return true;
}

async function tryGetKeyFromJSON(ctx: oak.Context)
	: Promise<string | null> {
	try {
		return (await ctx.request.body({ type: "json" }).value).key;
	} catch(e) {
		loggerAuth.error("Failed retrieving key from response");
		serveError(ctx, oak.Status.InternalServerError, e.message);
		return null;
	}
}

async function tryDeriveAES(pubkey: string, ctx: oak.Context)
	: Promise<CryptoKey | null> {
	try {
		const k = await ecdh.deriveAES(pubkey);
		if (k === undefined) {
			serveError(ctx, oak.Status.BadRequest, "No key");
			return null;
		}
		return k;
	} catch(e) {
		serveError(ctx, oak.Status.BadRequest, "Bad key: " + e.message);
		return null;
	}
}

router.get("/", ctx => {
	ctx.response.redirect("/frontend/html/index.html");
});

// session NOT needed
router.get("/auth/key", async ctx => {
	if (!checkKeys(ctx))
		return;
	loggerAuth.log("Serving public key");
	serveJson(ctx, 200, { key: await ecdh.exportKey() });
});

// session NOT needed
router.post("/auth/session", async ctx => {
	if (!checkKeys(ctx) || !checkBody(ctx))
		return;
	const clientECDH = await tryGetKeyFromJSON(ctx);
	if (!clientECDH)
		return;
	const sessionKey = await tryDeriveAES(clientECDH, ctx);
	if (!sessionKey)
		return;
	const s = sessions.new(sessionKey);
	loggerAuth.log("Registered new session", s.id,
		"expiring", s.expireDate.toString());
	await s.cookie(ctx);
	serveJson(ctx, 200, {}); // simply send "error: false"
});

// session needed, authorization NOT needed
router.post("/auth/login", ctx => {
	if (!checkKeys(ctx))
		return;
	serveError(ctx, oak.Status.NotImplemented,
		"Login not implemented (soon!)");
});

if (import.meta.main)
	listen();
