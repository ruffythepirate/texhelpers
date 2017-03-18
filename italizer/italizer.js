const inquirer = require('inquirer');
const fs = require('fs');
require('terminal-colors');

console.log(process);

if (process.argv.length < 3) {
	console.log('Please input the path to you working directory as a parameter...');
	awaitInputToExit();
}

var folder = process.argv[2];

const texFiles = getTexFiles(folder);

askForSourceAndTargetTexFile(texFiles).then(function(answers) {
    const sourceContent = readFileContent(answers.source);

    var terms = collectTermsInFile(/\\textit{(.*?)}/g, sourceContent).map(trimString)
    uniqueTerms = terms.filter((v, i, a) => i === a.indexOf(v));
    warnIfTermsAreSubsetOfOthers(uniqueTerms);
    const target = answers.target;
    const targetContent = readFileContent(target);
    transformTarget(targetContent, uniqueTerms, (textAsArray) => {
        askOverwriteFile(target).then((answers) => {
            const shouldOverwrite = answers.check == 'Yes';
            if (shouldOverwrite) {
                overwriteTargetFile(target, textAsArray);
            }
            awaitInputToExit();
        });
    });
});

function overwriteTargetFile(filename, textAsArray) {
    const completeText = rebuildText(textAsArray);
    try {
        console.log('overwriting file ' + filename + '...');
        fs.writeFileSync(filename, completeText);
        console.log('successfully overwritten file...');
    } catch (e) {
        console.log(e);
    }
}

function awaitInputToExit() {
    console.log('Press any key to exit');

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

function rebuildText(textAsArray) {
    return textAsArray.reduce((a, v) => a + v, '');
}

function transformTarget(targetContent, terms, onFinished) {
    if (terms.length < 1) return;

    const termIterator = {
        terms: terms,
        index: 0,
        next: function() {
            return this.terms[this.index++]
        },
        hasNext: function() {
            return this.index < this.terms.length
        }
    }

    var textAsArray = splitBySentence(targetContent);

    askAndCheckNextTermRecursive(termIterator, textAsArray, onFinished);

}

function splitBySentence(text) {
	var regEx = /[.\n]/g
	const tokens = [];
	var lastIndex = 0
	while( (match = regEx.exec(text)) != null) {
		tokens.push(text.substring(lastIndex, match.index));
		lastIndex = match.index;
	}

	if(lastIndex < text.length) {
		tokens.push(text.substring(lastIndex, text.length));
	}
 
    assert( text.length === tokens.reduce((a,v) => a+v.length, 0), 'Split text has lost chars..!');

    return tokens;
}

function assert(condition, message) {
	if(!condition) throw message;
}

function askAndCheckNextTermRecursive(termIterator, textAsArray, onFinished) {
    if (!termIterator.hasNext()) {
        onFinished(textAsArray);
        return;
    }
    const term = termIterator.next();
    askCheckTerm(term).then(function(answers) {
        const shouldCheck = answers.check == 'Yes';
        if (shouldCheck) {
            const it = createTermInTextIterator(term, textAsArray);
            checkNextTermInTextRecursive(it, textAsArray, (newTextAsArray) => askAndCheckNextTermRecursive(termIterator, newTextAsArray, onFinished));
        } else {
            askAndCheckNextTermRecursive(termIterator, textAsArray, onFinished);
        }
    });
}

function checkNextTermInTextRecursive(termInTextIterator, textAsArray, onFinished) {
    if (!termInTextIterator.hasNext()) {
        applyTextReplaces(termInTextIterator.data, textAsArray);
        onFinished(textAsArray);
        return;
    }

    const position = termInTextIterator.next();
    highlightPosition(position, textAsArray);
    askReplaceTerm(position.term).then(function(answers) {
        const shouldReplace = answers.check == 'Yes';
        if (shouldReplace) {
            position.replace = true;
        }
        checkNextTermInTextRecursive(termInTextIterator, textAsArray, onFinished);
    });
}

function applyTextReplaces(positions, textAsArray) {
    positions
        .filter(p => p.replace)
        .reverse()
        .forEach(p => textAsArray[p.row] = replacePosition(p, textAsArray));
}

function createTermInTextIterator(term, textAsArray) {
    const allEntries =
        textAsArray
        .map((v, i) => locations(new RegExp('(^\\textit\{)' + escapeRegExp(term), 'g'), v))
        .reduce((a, v, i) => {
            v.forEach(v => a.push({ row: i, start: v, term: term }));
            return a;
        }, []);

    const termInTextIterator = {
        data: allEntries,
        index: 0,
        next: function() {
            return this.data[this.index++]
        },
        hasNext: function() {
            return this.index < this.data.length
        }
    }

    return termInTextIterator;
}

function locations(regex, string) {
    const a = [];
    while ((match = regex.exec(string)) != null) {
        a.push(match.index);
    }
    return a;
}

function escapeRegExp(str) {
    var result = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return result;
}

function highlightPosition(position, textAsArray) {
    var i = position.row;
    const term = position.term;

    printRows(i - 3, i - 1, textAsArray, console.log);
    const highlightedRow = getHighlightedRow(position, textAsArray[position.row]);
    console.log(highlightedRow);
    printRows(i + 1, i + 3, textAsArray, console.log);
}

function replacePosition(position, textAsArray) {
    const i = position.row;
    const row = textAsArray[i];
    const start = position.start;
    const term = position.term;

    return row.substring(0, start) + `\\textit{${term}}` + row.substr(start + term.length, row.length);
}

function getHighlightedRow(highlightInfo, row) {
    const start = highlightInfo.start;
    const term = highlightInfo.term;
    return row.substr(0, start) + term.red.underline + row.substr(start + term.length, row.length);
}

function printRows(startIndex, endIndex, textAsArray, printMethod) {
    startIndex = Math.max(startIndex, 0);
    endIndex = Math.min(textAsArray.length, endIndex);
    for (i = startIndex; i < endIndex; i++) {
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

function askReplaceTerm(term) {
    return inquirer.prompt([{
        type: 'list',
        name: 'check',
        message: `Do you want to overwrite '${term}' with \\textit{${term}}?`,
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
