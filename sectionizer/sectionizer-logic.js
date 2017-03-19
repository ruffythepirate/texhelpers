const sectionizerLogic = module.exports;

sectionizerLogic.collectSectionsInFile = collectSectionsInFile;

function getSectionizedString(section, row, preferences) {
    
}

function collectSectionsInFile(fileContent) {
    const result = [];

    const regex = /\\([sub]*section)([*]?)\{(.*)\}/g

    while ((match = regex.exec(fileContent)) != null) {
        let section = {
            command: match[1],
            containsStar: match[2] === '*',
            text: match[3]
        };

        result.push(section)
    }
    return result;
}