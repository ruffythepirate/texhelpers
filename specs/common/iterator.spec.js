const chai = require('chai');
const iterator = require('../../common/iterator');

const assert = chai.assert;

describe('iterator.hasNext', () => {

	it('returns true when there are entries', () => {
		var it = iterator([2, 3]);
		chai.assert(it.hasNext());
	});

		it('returns false when there are no entries', () => {
		var it = iterator([]);
		chai.assert(!it.hasNext());
	});

	it('returns false when entries are iterated', () => {
		var it = iterator([1]);
		chai.assert(it.hasNext());
		it.next();
		chai.assert(!it.hasNext());
	});
});

describe('iterator.next', () => {

	it('returns next entry', () => {
		var it = iterator([2, 3]);

		assert(it.next() === 2);
		assert(it.next() === 3);
	});

	it('returns undefined if no more entries', () => {
		var it = iterator([]);
		assert(it.next() === undefined);
	});
});