const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

const iterator = require('../common/iterator');
const stringHelpers = require('../common/string-helpers');
const fileHelpers = require('../common/file-helpers');
const outputHelpers = require('../common/output-helpers');
const ranking = require('../common/ranking');

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


        askSections(sections).then((answers) => {
            const fileAsArray = getFileAsArray(target);


            //1 Find correct row.
            //2 Ask if replace.
            //3 replace in array.
            //4 Next 


        });
    });


function fixSectionRecursive(sectionIterator, textAsArray, lastReplaceIndex, onFinished) {
    if (!sectionIterator.hasNext()) {
        onFinished(textAsArray);
        return;
    }
    const section = sectionIterator.next();
            
    var bestIndex = ranking.getBestRowIndex(section, textAsArray, lastReplaceIndex);
    outputHelpers.outputInContext(, textAsArray, console.log);
}


function getFileAsArray(filename) {
    const content = fileHelpers.readFileContent(filename);
    return content.split('\n');
}

function collectSectionsInFile(fileContent) {
    const result = [];

    const regex = /\\([sub]*section)([*]?)\{(.*)\}/g

    while ((match = regex.exec(fileContent)) != null) {
        let section = {
            command: match[1],
            containsStar: match[2] === '*',
            text: match[3]
        };

        result.push(section)
    }
    return result;
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
