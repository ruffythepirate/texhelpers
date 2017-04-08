require('terminal-colors');

const inquirer = require('inquirer');
const fs = require('fs');
const fileHelpers = require('../common/file-helpers');
const askHelpers = require('../common/ask-helpers');
const outputHelpers = require('../common/output-helpers');

if (process.argv.length < 3) {
    console.log('Format: splitter [file-to-split] [file-with-chapter beginnings]');
    askHelpers.awaitInputToExit();
}

const fileToSplit = process.argv[2];
const fileWithChapters = process.argv[3];

fileToSplitContent = fileHelpers.readFileContent(fileToSplit).split('\n');
chapterBeginnings = fileHelpers.readFileContent(fileWithChapters).split('\n').filter(s => s);


var lastFoundIndex = 0;
const rowStarts = chapterBeginnings.map(beg => {
    for (var i = lastFoundIndex; i < fileToSplitContent.length; i++) {
        const rowMatches = fileToSplitContent[i].trim().startsWith(beg);
        // console.log(`${fileToSplitContent[i].trim()} starts with ${beg} is = ${rowMatches}`);
        if (rowMatches) {
            lastFoundIndex = i;
            return {
                beginning: beg,
                index: i
            };
        }
    }
    return {
        beginning: beg,
        index: undefined
    };
});

// console.log(rowStarts);

const chapters = rowStarts.map(( v, i, a) => {
    if (!v.index) {
        return {beginning: v.beginning};
    }
    return {
        beginning: v.beginning,
        startIndex: v.index,
        endIndex: (i == a.length - 1) ? undefined : a[i + 1].index
    };
});

console.log('chapters!');
console.log(chapters);


chapters.forEach(c => extractToFile(fileToSplitContent, c.startIndex, c.endIndex, buildName(c.beginning)));

function buildName(beginning) {
    const partName = beginning.replace(/[^0-9a-z]/gi, '');
    return `${fileToSplit}-${partName}`;
}

function extractToFile(allContent, startIndex, endIndex, fileName) {
    if (!startIndex ) {
        console.log(`Couldn't write file ${fileName}, either next or current chapter not found!`);
        return;
    }
    const contentToWrite = allContent
        .slice(startIndex, endIndex)
        .reduce((a, v) => a + v + '\n', '');

    fileHelpers.writeFile(fileName, contentToWrite);
}

askHelpers.awaitInputToExit();
