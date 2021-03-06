require('terminal-colors');

const inquirer = require('inquirer');
const fs = require('fs');
const fileHelpers = require('../common/file-helpers');
const askHelpers = require('../common/ask-helpers');
const outputHelpers = require('../common/output-helpers');
const iterator = require('../common/iterator');

askOverwriteFile = askHelpers.askOverwriteFile;
askReplaceTerm = askHelpers.askReplaceTerm;
awaitInputToExit = askHelpers.awaitInputToExit;

if (process.argv.length < 4) {
    console.err('Not enough arguments for italizer. Please use as: node italizer.js [source-file] [target-file]');
    awaitInputToExit();
}

const source = process.argv[2];
const target = process.argv[3];

const sourceContent = fileHelpers.readFileContent(source);

var terms = collectTermsInFile(/\\textit{(.*?)}/g, sourceContent).map(trimString).filter(a => a).sort((a, b) => b.length - a.length);
uniqueTerms = terms.filter((v, i, a) => i === a.indexOf(v));
warnIfTermsAreSubsetOfOthers(uniqueTerms);
const targetContent = fileHelpers.readFileContent(target);
transformTarget(targetContent, uniqueTerms, (textAsArray) => {
    askOverwriteFile(target).then((answers) => {
        const shouldOverwrite = answers.check == 'Yes';
        if (shouldOverwrite) {
            const completeText = rebuildText(textAsArray);
            fileHelpers.overwriteTargetFile(target, completeText);
        }
        awaitInputToExit();
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

function rebuildText(textAsArray) {
    return textAsArray.reduce((a, v) => a + v, '');
}

function transformTarget(targetContent, terms, onFinished) {
    if (terms.length < 1) return;

    const termIterator = iterator(terms);

    var textAsArray = splitByNewline(targetContent);

    askAndCheckNextTermRecursive(termIterator, textAsArray, onFinished);

}

function splitByNewline(text) {
    var regEx = /[\n]/g
    return splitByRegex(text, regEx);
}

function splitByRegex(text, regEx) {
    const tokens = [];
    var lastIndex = 0
    while ((match = regEx.exec(text)) != null) {
        var thisIndex = Math.min(match.index + 1, text.length)
        tokens.push(text.substring(lastIndex, thisIndex));
        lastIndex = thisIndex;
    }

    if (lastIndex < text.length) {
        tokens.push(text.substring(lastIndex, text.length));
    }

    assert(text.length === tokens.reduce((a, v) => a + v.length, 0), 'Split text has lost chars..!');

    return tokens;
}

function splitBySentence(text) {
    var regEx = /[.\n]/g
    return splitByRegex(text, regEx);
}

function assert(condition, message) {
    if (!condition) throw message;
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

function checkNextTermInTextRecursive(termInTextIterator, textAsArray, onFinished, doAll) {
    if (!termInTextIterator.hasNext()) {
        applyTextReplaces(termInTextIterator.data, textAsArray);

        if (doAll) {
            console.log(`Replaced ${termInTextIterator.data.length} entries`);
        }

        onFinished(textAsArray);
        return;
    }

    if (doAll) {
        const position = termInTextIterator.next();
        position.replace = true;
        checkNextTermInTextRecursive(termInTextIterator, textAsArray, onFinished, doAll);
    }

    const position = termInTextIterator.next();
    outputHelpers.outputInContext(position, textAsArray, console.log);
    askReplaceTerm(position.term, `\\textit{${position.term}}`)
        .then(function(answers) {
            if (answers.check === 'Skip') {
                const skippedTerms = termInTextIterator.remainingEntries() + 1;
                console.log(`Skipping ${skippedTerms} entries`);
                applyTextReplaces(termInTextIterator.data, textAsArray);
                onFinished(textAsArray);
                return;
            }
            doAll = doAll || answers.check === 'All';
            const shouldReplace = doAll || answers.check === 'Yes';
            if (shouldReplace) {
                position.replace = true;
            }
            checkNextTermInTextRecursive(termInTextIterator, textAsArray, onFinished, doAll);
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
        .map((v, i) => findLocations(new RegExp('(?!\\textit\{)' +
            escapeRegExp(term), 'g'), v))
        .reduce((a, v, i) => {
            v.forEach(v => a.push({ row: i, start: v, term: term }));
            return a;
        }, []);

    const termInTextIterator = iterator(allEntries);

    return termInTextIterator;
}

function findLocations(regex, string) {
    const a = [];
    const enclosedIndexes = findEnclosedIndexes(string);
    while ((match = regex.exec(string)) != null) {
        if (!enclosedIndexes.find(a => a.start <= match.index && a.stop >= match.index)) {
            a.push(match.index);
        }
    }
    return a;
}

function findEnclosedIndexes(string) {
    const a = [];
    const textitRegex = /\\textit{(.*?)}/g
    while ((match = textitRegex.exec(string)) != null) {
        a.push({ start: match.index, stop: match.index + match[0].length });
    }
    return a;
}

function escapeRegExp(str) {
    var result = str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    return result;
}



function replacePosition(position, textAsArray) {
    const i = position.row;
    const row = textAsArray[i];
    const start = position.start;
    const term = position.term;

    return row.substring(0, start) + `\\textit{${term}}` + row.substr(start + term.length, row.length);
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
