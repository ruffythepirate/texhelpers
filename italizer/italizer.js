const inquirer = require('inquirer');
const fs = require('fs');

// inquirer.prompt([ Pass your questions in here ]).then(function (answers) {
    // Use user feedback for... whatever!!
// });

const texFileNames = getTexFiles('.');

function askForTexFile() {

}

function getTexFiles(folder) {
	return getFiles(folder, '.tex', []);
}

function getFiles (dir, ending, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, ending, files_);
        } else if(filterFile(name, ending)){
            files_.push(name);
        }
    }
    return files_;
}

function filterFile(fileName, ending) {
	return !ending || fileName.endsWith(ending)
}
