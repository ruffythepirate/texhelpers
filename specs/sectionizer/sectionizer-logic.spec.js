const chai = require('chai');
const sectionizerLogic = require('../../sectionizer/sectionizer-logic');

const expect = chai.expect;

const collectSectionsInFile = sectionizerLogic.collectSectionsInFile;
const getSectionizedString = sectionizerLogic.getSectionizedString;


describe('sectionizer-logic.getSectionizedString', () => {

	const rowWithoutWrapping = 'my title...';
	const rowWithWrapping = '\\subsection*{my title...}';
	const sectionInfo = {
		command: 'section',
		containsStar: true,
		text: 'my other title...'
	};

	it('wraps content in section-info', () => {
		const result = getSectionizedString(sectionInfo, rowWithoutWrapping, {});

		expect(result).to.be.equal('\\section*{my title...}');
	});

	it('replaces current wrapping', () => {
		const result = getSectionizedString(sectionInfo, rowWithWrapping, {});

		expect(result).to.be.equal('\\section*{my title...}');
	});
});


describe('sectionizer-logic.collectSectionsInFile', () => {

	const stringWithoutSection='blabla';
	const stringWithSectionNoNumbering='blabla \\section*{a section} bla bla';
	const stringWithSubSectionNoNumbering='blabla \\subsection*{a section} bla bla';
	const stringWithSectionWithNumbering='blabla \\section{a section}';


    describe('find sections', () => {
        it('find no sections in section free string', () => {
        	const result = collectSectionsInFile(stringWithoutSection);

        	expect(result.length).to.be.equal(0);
        });

        it('finds a section', () => {
        	const result = collectSectionsInFile(stringWithSectionNoNumbering);
        	expect(result[0].command).to.be.equal('section');
        	expect(result[0].text).to.be.equal('a section');
        });

        it('finds a subsection', () => {
        	const result = collectSectionsInFile(stringWithSubSectionNoNumbering);

        	expect(result[0].command).to.be.equal('subsection');
        	expect(result[0].text).to.be.equal('a section');
        });

    });

    describe('find numbering included', () => {
        it('finds star is included', () => {
	       	const result = collectSectionsInFile(stringWithSectionNoNumbering);
        	
        	expect(result[0].containsStar).to.be.equal(true);
        });

        it('finds star is not included', () => {
       		const result = collectSectionsInFile(stringWithSectionWithNumbering);
        	
        	expect(result[0].containsStar).to.be.equal(false);
        });
    });
});
