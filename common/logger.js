/* logger.js - small utility for uniform log formatting
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

export default class Logger {
	#logInitializer;
	#comp;

	#updateLogInitializer() {
		this.#logInitializer = this.surround[0] + this.namespace +
			((this.#comp !== null) ? `/${this.#comp}` : "") +
			this.surround[1];
	}

	constructor(namespace, options) {
		this.namespace = namespace;
		this.surround = (options?.surround instanceof Array) ?
			options.surround : ["[", "]"];
		this.#comp = (typeof(options?.component) === "string") ?
			options.component : null;
		this.#updateLogInitializer();
	}

	component(comp) {
		if (typeof(comp) !== "string")
			throw new TypeError("component must be a string, got",
				typeof(comp));
		return new Logger(this.namespace, { component: comp });
	}

	log() {
		console.log(this.#logInitializer, ...arguments);
	}

	info() {
		this.log("(INFO)", ...arguments);
	}

	warn() {
		this.log("(WARNING)", ...arguments);
	}

	error() {
		this.log("(ERROR)", ...arguments);
	}
}
