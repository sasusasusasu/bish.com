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

// Oak is basically Express, but for Deno
import * as path from "https://deno.land/std@0.189.0/path/mod.ts";
import * as oak from "https://deno.land/x/oak@v12.5.0/mod.ts";
import mongodb from "npm:mongodb";

interface BishProduct {
	sku: string,
	name: string,
	picture: string, // data:image/png,base64
}

interface BishUserEncrypted {
	name: string,
	enc: string
}

interface BishUser {
	name: string,
	hash: string,
	admin: boolean
}

interface BishContext extends oak.Context {
	users?: mongodb.Collection<BishUserEncrypted>,
	products?: mongodb.Collection<BishProduct>
}

interface Server extends oak.Application {
	abortController: AbortController
}

// 2lazy2type
type DbClient = mongodb.MongoClient;

const DENO_DIR = path.dirname(path.fromFileUrl(Deno.mainModule));
const DENO_HOST = "localhost";
const DENO_PORT = 8443;
const MONGO_PORT = 27017;
const MONGO_URI = `mongodb://${DENO_HOST}:${MONGO_PORT}`;
const FRONTEND_DIR = path.normalize(path.join(DENO_DIR, "../frontend"));

Deno.chdir(DENO_DIR);

const router = new oak.Router();

router.post("/login", (ctx, next) => {
	const bish = <BishContext>ctx;
	console.log(bish.users);
	console.log(bish.products);
	next();
});

// weird event flippy-floppy. I dislike async stuff a lot
function interrupt(mdb: DbClient, svr: Server) {
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
	const dbBish = mdb.db("lmaobish");
	
	const svr = <Server>new oak.Application();
	svr.abortController = new AbortController();

	// add mongodb collections to context
	svr.use((ctx, next) => {
		(<BishContext>ctx).users = dbBish.collection<BishUserEncrypted>("users");
		(<BishContext>ctx).products = dbBish.collection<BishProduct>("products");
		next();
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

if (import.meta.main) {
	listen();
}
