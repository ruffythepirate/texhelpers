const outputHelpers = module.exports;

require('terminal-colors');

outputHelpers.outputInContext = outputInContext

function outputInContext(highlightInfo, textAsArray, outputMethod) {
	var i = highlightInfo.row;
    const term = highlightInfo.term;

    printRows(i - 3, i - 1, textAsArray, outputMethod);
    const highlightedRow = getHighlightedRow(highlightInfo, textAsArray[highlightInfo.row]);
    outputMethod(highlightedRow);
    printRows(i + 1, i + 3, textAsArray, outputMethod);
}

function getHighlightedRow(highlightInfo, row) {
    const start = highlightInfo.start;
    const term = highlightInfo.term;
    return row.substr(0, start) + term.red.underline + row.substr(start + term.length, row.length);
}

function printRows(startIndex, endIndex, textAsArray, outputMethod) {
    startIndex = Math.max(startIndex, 0);
    endIndex = Math.min(textAsArray.length, endIndex);
    for (i = startIndex; i < endIndex; i++) {
        outputMethod('> '.red + textAsArray[i]);
    }
}