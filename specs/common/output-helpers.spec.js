const outputHelpers = require('../../common/output-helpers');

const expect = require('chai').expect;

describe('output-helpers.getHighlightInfo', () => {
	it('finds the properties correctly when string exists', () => {
		const result = outputHelpers.getHighlightInfo('with my term', 'term', 5);

		expect(result).to.be.eql({
			row: 5,
			start: 8,
			term: 'term'
		});
	});

	it('finds the properties correctly when string doesnt exist', () => {
		const result = outputHelpers.getHighlightInfo('without my term', 'tarm', 6);

		expect(result).to.be.eql({
			row: 6,
			start: -1,
			term: 'tarm'
		});
	});

});

describe('output-helpers.outputInContext', () => {
	describe('in a 10 string context', () => {
		var textAsArray,
		highlightInfo; 
		
		var printCalls = 0;
		var outputMethod = () => printCalls++;

		beforeEach(() => {
			printCalls = 0;
			textAsArray = ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg', 'hhh', 'iii', 'jjj'];
			highlightInfo = {
				row: 0,
				term: '',
				start: 0
			};
		});

		it('prints at start', () => {
			highlightInfo.row = 0;
			outputHelpers.outputInContext(highlightInfo, textAsArray, outputMethod);
			expect(printCalls).to.be.equal(3);
		});

		it('prints at end', () => {
			highlightInfo.row = 9;
			outputHelpers.outputInContext(highlightInfo, textAsArray, outputMethod);
			expect(printCalls).to.be.equal(3);

		});

		it('prints in middle', () => {
			highlightInfo.row = 5;
			outputHelpers.outputInContext(highlightInfo, textAsArray, outputMethod);
			expect(printCalls).to.be.equal(5);
		});

	});

});