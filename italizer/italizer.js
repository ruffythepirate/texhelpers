const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

const texFiles = getTexFiles('.');

askForSourceAndTargetTexFile(texFiles).then(function(answers) {
    const sourceContent = readFileContent(answers.source);

    var terms = collectTermsInFile(/\\textit{(.*?)}/g, sourceContent).map(trimString)
    uniqueTerms = terms.filter((v, i, a) => i === a.indexOf(v));
    warnIfTermsAreSubsetOfOthers(uniqueTerms);

    const targetContent = readFileContent(answers.target);
    transformTarget(targetContent, uniqueTerms);

});


function transformTarget(targetContent, terms) {
    if (terms.length < 1) return;

    const termIterator = {
        terms: terms,
        index: 0,
        next: function() {
            return this.terms[this.index++] },
        hasNext: function() {
            return this.index < this.terms.length }
    }

    var textAsArray = splitBySentence(targetContent);

    askAndCheckNextTermRecursive(termIterator,textAsArray);
}

function splitBySentence(text) {
	return text.split(/[.\n]/);
}

function askAndCheckNextTermRecursive(termIterator, textAsArray) {
    const term = termIterator.next();
    console.log('hello');
    askCheckTerm(term).then(function(answers) {
        const shouldCheck = answers.check == 'Yes';
        if (shouldCheck) {
            console.log('Should check!');
            const it = createTermInTextIterator(term, textAsArray);
            highlightFirstTerm(it, term, textAsArray);
        } else {
            askAndCheckNextTermRecursive(termIterator, textAsArray);
        }
    });
}

function createTermInTextIterator(term, textAsArray) {
	const allEntries = 
	textAsArray	
		.map((v,i) => locations(term, v))
		.reduce((a, v, i) => {v.forEach(v => a.push({row: i, start: v, term: term})); return a;}, []);

	const termInTextIterator = {
        data: allEntries,
        index: 0,
        next: function() {
            return this.data[this.index++] },
        hasNext: function() {
            return this.index < this.data.length }
    }

    return termInTextIterator;
}

function locations(substring,string){
  var a=[],i=-1;
  while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
  return a;
}

function highlightFirstTerm(iterator, term, textAsArray) {
	var firstPosition = iterator.next();

	// for(var i = 0; i < textAsArray.length; i++ ) {
		// if(textAsArray[i].indexOf(term) > -1) {
			var i = firstPosition.row;

			printRows(i - 3, i - 1, textAsArray, console.log);
			const highlightedRow = getHighlightedRow(firstPosition, textAsArray[firstPosition.row]);
			console.log(highlightedRow);
			printRows(i + 1 , i + 3, textAsArray, console.log);
		// }
	// }
}

function getHighlightedRow(highlightInfo, row) {
	const start = highlightInfo.start;
	const term = highlightInfo.term;
	return row.substr(0, start) + term.red.underline + row.substr(start+term.length, row.length);
}

function printRows(startIndex, endIndex, textAsArray, printMethod) {
	startIndex = Math.max(startIndex, 0);
	endIndex = Math.min(textAsArray.length, endIndex);
	for(i = startIndex; i < endIndex; i++) {
		printMethod('> '.red + textAsArray[i]);
	}
}

function askCheckTerm(term) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Should the term '${term}' be checked?`,
        choices: ['Yes', 'No']
    }]);
}

function warnIfTermsAreSubsetOfOthers(uniqueArray) {
    const duplicateTerms = getTermsContainedInOtherTerms(uniqueArray);
    if (duplicateTerms.length > 0) {
        console.log("WARNING: The following terms are subsets of other terms:");
        console.log(duplicateTerms);
    }
}

function getTermsContainedInOtherTerms(uniqueArray) {
    return uniqueArray.filter((v, i, a) =>
        a.filter(v1 => v1.indexOf(v) > -1 && v1.length > v.length).length > 1
    )
}

function trimString(string) {
    if (string && string.trim) {
        return string.trim();
    }
    return string;
}

function collectTermsInFile(regex, fileContent) {
    const result = [];
    while ((match = regex.exec(fileContent)) != null) {
        result.push(match[1])
    }
    return result;
}

function readFileContent(filename) {
    return fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
}

function askForSourceAndTargetTexFile(texFiles) {
    return inquirer.prompt([{
        type: 'list',
        name: 'source',
        message: 'Select file that contains italized words.',
        choices: texFiles
    }, {
        type: 'list',
        name: 'target',
        message: 'Select file that should get words italized',
        choices: texFiles
    }])
}

function getTexFiles(folder) {
    return getFiles(folder, '.tex', []);
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

function filterFile(fileName, ending) {
    return !ending || fileName.endsWith(ending)
}
