const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

if (process.argv.length < 3) {
	console.log('Please input the path to you working directory as a parameter...');
	awaitInputToExit();
}

var folder = process.argv[2];

const texFiles = getTexFiles(folder);

askForSourceAndTargetTexFile(texFiles).then(function(answers) {
    const sourceContent = readFileContent(answers.source);
    var sections = collectSectionsInFile(sourceContent)
    console.log(sections)
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

function readFileContent(filename) {
    return fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
}

function getTexFiles(folder) {
    return getFiles(folder, '.tex', []);
}

function filterFile(fileName, ending) {
    return !ending || fileName.endsWith(ending)
}

function getFiles(dir, ending, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, ending, files_);
        } else if (filterFile(name, ending)) {
            files_.push(name);
        }
    }
    return files_;
}

function askForSourceAndTargetTexFile(texFiles) {
    return inquirer.prompt([{
        type: 'list',
        name: 'source',
        message: 'Select file that contains sections.',
        choices: texFiles
    }, {
        type: 'list',
        name: 'target',
        message: 'Select file that should get section data written to it.',
        choices: texFiles
    }])
}