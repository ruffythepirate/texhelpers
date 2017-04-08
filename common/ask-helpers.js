const inquirer = require('inquirer');
require('terminal-colors');

const askHelpers = module.exports;

askHelpers.askReplaceTerm = askReplaceTerm;
askHelpers.askOverwriteFile = askOverwriteFile;
askHelpers.awaitInputToExit = awaitInputToExit;


function askReplaceTerm(term, newTerm) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Do you want to overwrite '${term.red.underline}' with ${newTerm.green.underline}?`,
        choices: ['Yes', 'No', 'All', 'Skip']
    }]);
}

function askOverwriteFile(filename) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Job finished. Do you want to overwrite the file content of ${filename.green.underline} with your new content?`,
        choices: ['Yes', 'No']
    }]);
}

function awaitInputToExit() {
    console.log('Press any key to exit');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}
