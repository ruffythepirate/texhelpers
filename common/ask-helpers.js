const inquirer = require('inquirer');

const askHelpers = module.exports;

askHelpers.askReplaceTerm = askReplaceTerm;
askHelpers.askOverwriteFile = askOverwriteFile;

function askReplaceTerm(term, newTerm) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Do you want to overwrite '${term}' with ${newTerm}?`,
        choices: ['Yes', 'No']
    }]);
}

function askOverwriteFile(filename) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Job finished. Do you want to overwrite the file content of ${filename} with your new content?`,
        choices: ['Yes', 'No']
    }]);
}