// MultiMap implements a map that permits multiple (unique) values under the
// same key. Entries are not stored in any particular order. Values under each
// key are not stored in a particular order.

class MultiMap {
	constructor() {
		this.map = new Map();
	}

	get keyCount() {
		return this.map.size;
	}

	sizeOf(key) {
		const values = this.map.get(key);
		if (values) {
			return values.size;
		}
		return 0;
	}

	getTotalSize() {
		let total = 0;
		for (const [_, values] in this.map) {
			total += values.size;
		}
		return total;
	}

	get(key) {
		return this.map.get(key);
	}

	add(key, value) {
		const values = this.map.get(key);
		if (!values) {
			this.map.set(key, new Set().add(value));
		} else {
			values.add(value);
		}
		return this;
	}

	delete(key, value) {
		const values = this.map.get(key);
		if (values) {
			values.delete(value);
			if (values.size === 0) {
				this.map.delete(key);
			}
		}
		return this;
	}

	deleteAll(key) {
		this.map.delete(key);
		return this;
	}

	clear() {
		this.map.clear();
		return this;
	}

	keys() {
		return this.map.keys();
	}

	*entries() {
		for (const [key, values] of this.map) {
			for (const value of values) {
				yield [key, value];
			}
		}
	}

	forEach(cb) {
		for (const [key, values] of this.map) {
			for (const value of values) {
				cb(key, value);
			}
		}
	}

	[Symbol.iterator]() {
		return this.entries();
	}
}

module.exports = MultiMap;
