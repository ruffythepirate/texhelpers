const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

const iterator = require('../common/iterator');
const stringHelpers = require('../common/string-helpers');
const askHelpers = require('../common/ask-helpers');
const fileHelpers = require('../common/file-helpers');
const outputHelpers = require('../common/output-helpers');
const ranking = require('../common/ranking');
const sectionizerLogic = require('./sectionizer-logic');

askReplaceTerm = askHelpers.askReplaceTerm;
askOverwriteFile = askHelpers.askOverwriteFile;
awaitInputToExit = askHelpers.awaitInputToExit;

collectSectionsInFile = sectionizerLogic.collectSectionsInFile;
getSectionizedString = sectionizerLogic.getSectionizedString;


if (process.argv.length < 4) {
    console.err('Not enough arguments for sectionizer. Please use as: node sectionizer.js [source-file] [target-file]');
    awaitInputToExit();
}

var sourceFile = process.argv[2];
var targetFile = process.argv[3];

const sourceContent = fileHelpers.readFileContent(sourceFile);
var sections = collectSectionsInFile(sourceContent)

const sectionIterator = iterator(sections);

askSections(sections).then((answers) => {
    const fileAsArray = getFileAsArray(targetFile);

    fixSectionRecursive(sectionIterator,
        fileAsArray, 0,
        (transformedText) => {
            askOverwriteFile(target).then((answers) => {
                const shouldOverwrite = answers.check == 'Yes';
                if (shouldOverwrite) {
                    const completeText = rebuildText(textAsArray);
                    fileHelpers.overwriteTargetFile(target, completeText);
                }
                awaitInputToExit();
            });
        });
});

function rebuildText(textAsArray) {
    return textAsArray.reduce((a, v) => a + v + '\n', '');
}

function fixSectionRecursive(sectionIterator, textAsArray, lastReplaceIndex, onFinished) {
    if (!sectionIterator.hasNext()) {
        onFinished(textAsArray);
        return;
    }
    const section = sectionIterator.next();

    const bestIndex = ranking.getBestRowIndex(section, textAsArray, lastReplaceIndex);

    const highlightInfo = outputHelpers.getHighlightInfo(textAsArray[bestIndex], textAsArray[bestIndex], bestIndex)
    outputHelpers.outputInContext(highlightInfo, textAsArray, console.log);

    const newHeading = getSectionizedString(section, textAsArray[highlightInfo.row], {});
    askReplaceTerm(textAsArray[highlightInfo.row],
        newHeading).then((answers) => {
        const shouldReplace = answers.check === 'Yes';
        if (shouldReplace) {
            textAsArray = replaceInArray(bestIndex, newHeading, textAsArray);
        }
        fixSectionRecursive(sectionIterator, textAsArray, bestIndex, onFinished);
    });
}

function replaceInArray(index, newRowContent, allRows) {
    return allRows.map((v, i) => i === index ? newRowContent : v);
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
            { text: 'Preserve from source', value: 'preserve' },
            { text: 'Always numbers', value: 'always' },
            { text: 'Never numbers', value: 'never' }
        ]
    }]);
}
