const chai = require('chai');
const stringHelpers = require('../../common/string-helpers');

describe('StringHelpers.levenshteinDistance', () => {

	it('calculates distance between kitten and sitting to 3', () => {
		const distance = stringHelpers.levenshteinDistance('kitten', 'sitting');

		console.log(distance)
		chai.assert(distance === 3);
	});
});