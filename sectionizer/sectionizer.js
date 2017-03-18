const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

const fileHelpers = require('../common/FileHelpers');

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
    const sourceContent = fileHelpers.readFileContent(answers.source);
    var sections = collectSectionsInFile(sourceContent)
    sections.forEach(s => console.log(s.text));
});

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