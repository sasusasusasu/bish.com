/* safe.ts - error-check routines that aren't worth this disclaimer
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

export function stat(p: string): Deno.FileInfo {
	try {
		return Deno.statSync(p);
	} catch(_) {
		return <Deno.FileInfo> {
			isFile: false, isDirectory: false, isSymlink: false,
			size: 0, mtime: null, atime: null, birthtime: null,
			dev: 0, ino: null, mode: null, nlink: null,
			uid: null, gid: null, rdev: null, blksize: null,
			blocks: null, isBlockDevice: false, isCharDevice: false,
			isFifo: false, isSocket: false
		};
	}
}

export function mkdir(p: string, opt: Deno.MkdirOptions | null = null) {
	try {
		if (opt !== null)
			Deno.mkdirSync(p, opt);
		else
			Deno.mkdirSync(p);
	} catch (_) { /* dir exists */ }
}
