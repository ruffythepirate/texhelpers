const fs = require('fs');
const inquirer = require('inquirer');

var fileHelpers = module.exports;

fileHelpers.getTexFiles = getTexFiles;
fileHelpers.askForSourceAndTargetTexFile = askForSourceAndTargetTexFile;
fileHelpers.readFileContent = readFileContent;

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

function askForSourceAndTargetTexFile(texFiles, firstQuestion, secondQuestion) {
    return inquirer.prompt([{
        type: 'list',
        name: 'source',
        message: firstQuestion,
        choices: texFiles
    }, {
        type: 'list',
        name: 'target',
        message: secondQuestion,
        choices: texFiles
    }])
}