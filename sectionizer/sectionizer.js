const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

const iterator = require('../common/iterator');
const stringHelpers = require('../common/string-helpers');
const askHelpers = require('../common/ask-helpers');
const fileHelpers = require('../common/file-helpers');
const outputHelpers = require('../common/output-helpers');
const ranking = require('../common/ranking');
const sectionizerLogic = require('sectionizer-logic');

askReplaceTerm = askHelpers.askReplaceTerm;

collectSectionsInFile = sectionizerLogic.collectSectionsInFile;


if (process.argv.length < 3) {
    console.log('Please input the path to you working directory as a parameter...');
    awaitInputToExit();
}

var folder = process.argv[2];

const texFiles = fileHelpers.getTexFiles(folder);

fileHelpers.askForSourceAndTargetTexFile(texFiles,
        'Select file that contains sections.',
        'Select file that should get section data written to it.')
    .then(function(answers) {
        const target = answers.target;
        const sourceContent = fileHelpers.readFileContent(answers.source);
        var sections = collectSectionsInFile(sourceContent)

        const sectionIterator = iterator(sections);

        askSections(sections).then((answers) => {
            const fileAsArray = getFileAsArray(target);

            fixSectionRecursive(sectionIterator,
                fileAsArray,0 ,
                (transformedText) => {

                });

        });
    });


function fixSectionRecursive(sectionIterator, textAsArray, lastReplaceIndex, onFinished) {
    if (!sectionIterator.hasNext()) {
        onFinished(textAsArray);
        return;
    }
    const section = sectionIterator.next();
            
    const bestIndex = ranking.getBestRowIndex(section, textAsArray, lastReplaceIndex);
    const highlightInfo = outputHelpers.getHighlightInfo(textAsArray[bestIndex],textAsArray[bestIndex], lastReplaceIndex)
    outputHelpers.outputInContext(highlightInfo, textAsArray, console.log);

    askReplaceTerm(textAsArray[highlightInfo.row],
        textAsArray[highlightInfo.row]);
}



function getFileAsArray(filename) {
    const content = fileHelpers.readFileContent(filename);
    return content.split('\n');
}



function askSections(sections) {
    return inquirer.prompt([{
        type: 'checkbox',
        message: 'Select Sections',
        name: 'headings',
        choices: sections.map(s => {
            return {
                name: s.text,
                checked: true
            }
        })
    }, {
        type: 'list',
        message: 'Preserve ignore section numbers?',
        name: 'numbers',
        choices: [
            { text: 'Preserve from source', value: 'preserve'},
            { text: 'Always numbers', value: 'always'},
            { text: 'Never numbers', value: 'never'}
        ]
    }]);
}
