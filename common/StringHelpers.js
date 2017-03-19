const stringHelpers = module.exports;

stringHelpers.levenshteinDistance = levenshteinDistance;

function levenshteinDistance(firstString, secondString) {
    const d = initLevenshteinDistanceMatrix(
        firstString.length,
        secondString.length);

    for (var i = 1; i < d.length; i++) {
        for (var j = 1; j < d[i].length; j++) {
            var substitutionCost = 0;
            if (firstString[i - 1] !== secondString[j - 1]) {
                substitutionCost = 1;
            }
            d[i][j] = Math.min(d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + substitutionCost);
        }
    }
    return d[firstString.length][secondString.length];
}

function initLevenshteinDistanceMatrix(size1, size2) {
    const matrix = create2DArray(size1 + 1, size2 + 1);

    createSeriesUntil(size1 + 1).forEach((v, i) => matrix[i][0] = i)
    createSeriesUntil(size2 + 1).forEach((v, i) => matrix[0][i] = i)

    return matrix;
}

function createSeriesUntil(number) {
    return Array.apply(null, {length: number}).map(Number.call, Number)
}

function create2DArray(height, width) {
    return [...Array(height).keys()].map(i => Array(width));
}
