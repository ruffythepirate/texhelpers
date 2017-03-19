const chai = require('chai');
const ranking = require('../../common/ranking');

const assert = chai.assert;
const expect = chai.expect;

describe('ranking.getBestRowIndex', () => {

	describe('comparing a with aa, bb, cc, aa', () => {
		const section = {
			text: 'a'
		};
		const textAsArray = ['aa', 'bb', 'cc', 'aa'];

		it('returns 0 when startindex is 0', () => {
			const result = ranking.getBestRowIndex(section, textAsArray, 0);
			expect(result).to.be.equal(0);
		});

		it('returns 3 when startindex is 1', () => {
			const result = ranking.getBestRowIndex(section, textAsArray, 1);
			expect(result).to.be.equal(3);
		});
	});
});