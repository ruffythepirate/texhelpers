const fileHelpers = require('../common/file-helpers');
const askHelpers = require('../common/ask-helpers');
const outputHelpers = require('../common/output-helpers');
const stringHelpers = require('../common/string-helpers');

const levenshteinDistance = stringHelpers.levenshteinDistance;

askOverwriteFile = askHelpers.askOverwriteFile;
askReplaceTerm = askHelpers.askReplaceTerm;
awaitInputToExit = askHelpers.awaitInputToExit;

if (process.argv.length < 4) {
    console.error('Not enough arguments for linematcher. Please use as: node linematcher.js [first-file] [second-file]');
    awaitInputToExit();
}

const first = process.argv[2];
const second = process.argv[3];

const firstContent = fileHelpers.readFileContent(first);
const secondContent = fileHelpers.readFileContent(second);

const firstLineInfos = getLineInfos(firstContent, first);
const secondLineInfos = getLineInfos(secondContent, second);

console.log('created line infos.')

const CUT_OFF_SCORE = 12;

firstFileBestScores = calculateBestScores(firstLineInfos, secondLineInfos);
secondFileBestScores = calculateBestScores(secondLineInfos, firstLineInfos);
const okMatches = firstFileBestScores.concat(secondFileBestScores).filter(v => {return v.bestMatch.score < CUT_OFF_SCORE});

outputLines(`${first} - No Match`, firstFileBestScores.filter(v => {return v.bestMatch.score >= CUT_OFF_SCORE}));
outputLines(`${second} - No Match`, secondFileBestScores.filter(v => {return v.bestMatch.score >= CUT_OFF_SCORE}));
outputLines(`OK Matches`, okMatches);


function outputLines(header, lineInfos) {
  console.log(header);
  lineInfos.forEach(li => {
    console.log(`F${li.lineInfo.file} L${li.lineInfo.index} S${li.bestMatch.score}: ${li.lineInfo.line}`);
  })

}

function calculateBestScores(source, compareLines) {
  const bestScores = source.map( lineInfo => {
    const bestScore = getBestScore(lineInfo.line, compareLines);
    return {
      lineInfo: lineInfo,
      bestMatch: bestScore
    };
  });
  return bestScores;
}

function getBestScore(line, otherLines) {
  return otherLines.map(otherLineInfo => {
  return {
    score: levenshteinDistance(line, otherLineInfo.line),
    lineInfo: otherLineInfo
  }})
  .sort(function(a,b) {
    return a.score - b.score;
  })
  [0];

}

function getLineInfos (content, filename) {
  return content
  .split('\n')
  .map((v,i) => { return {
    line: v,
    index: i,
    file: filename
  }});
}