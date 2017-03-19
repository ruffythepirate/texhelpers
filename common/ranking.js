const ranking = module.exports;
ranking.getBestRowIndex = getBestRowIndex;

const stringHelpers = require('./string-helpers');


function getBestRowIndex(section, textAsArray, startIndex) {
    const remainingRows = textAsArray.slice(startIndex);

    var sortedByRelevance = remainingRows.map((v, i) => {return {
        score: stringHelpers.levenshteinDistance(section.text, v),
        index: i
    }}).sort((first, second) => {
        if(first.score !== second.score) 
            return first.score - second.score;
        return first.index - second.index;
    });

    return sortedByRelevance[0].index + startIndex;
}