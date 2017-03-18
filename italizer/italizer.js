const inquirer = require('inquirer');
const fs = require('fs');

const texFiles = getTexFiles('.');

askForSourceAndTargetTexFile(texFiles).then(function(answers) {
	sourceContent = readFileContent(answers.source);

	var terms = collectTermsInFile(/\\textit{(.*?)}/g, sourceContent).map(trimString)
	uniqueTerms = terms.filter((v,i,a) => i === a.indexOf(v)); 

	warnIfTermsAreSubsetOfOthers(uniqueTerms);
});

function warnIfTermsAreSubsetOfOthers(uniqueArray) {
	const duplicateTerms = getTermsContainedInOtherTerms(uniqueArray);
	if(duplicateTerms.length > 0) {
		console.log("WARNING: The following terms are subsets of other terms:");
		console.log(duplicateTerms);
	}
}

function getTermsContainedInOtherTerms(uniqueArray) {
	return uniqueArray.filter((v,i,a) => 
		a.filter(v1 => v1.indexOf(v) > -1 && v1.length > v.length).length > 1
	)
}

function trimString(string) {
	if(string && string.trim) {
		return string.trim();
	}
	return string;
}

function collectTermsInFile(regex, fileContent) {
	const result = [];
	while ((match = regex.exec( fileContent )) != null)
	{
    	result.push(match[1])
	}
	return result;
}

function readFileContent(filename) {
	return fs.readFileSync(filename, {encoding: 'utf8', flag: 'r'});
}

function askForSourceAndTargetTexFile(texFiles) {
   return inquirer.prompt([
  {
    type: 'list',
    name: 'source',
    message: 'Select file that contains italized words.',
    choices: texFiles
  },
  {
    type: 'list',
    name: 'target',
    message: 'Select file that should get words italized',
    choices: texFiles
  }
  ])
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
