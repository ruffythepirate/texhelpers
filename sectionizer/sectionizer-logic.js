const sectionizerLogic = module.exports;

sectionizerLogic.collectSectionsInFile = collectSectionsInFile;
sectionizerLogic.getSectionizedString = getSectionizedString;

function getSectionizedString(section, row, preferences) {

	const content = extractContent(row);
    return buildSectionString(content.content, section, preferences);
}

function extractContent(row) {
    const extractRegex = /[\\[sub]*section]?([*]?)\{(.*)\}/
    const match = extractRegex.exec(row);
    if (match) {
        const content = match[2];
        return {
            content: content,
            hasStar: match[1] === '*'
        };
    }
    return {
    	content: row,
    	hasStar: false};
}

function buildSectionString(content, section, preferences) {
	var command = `\\${section.command}`;
	if(section.containsStar) {
		command += '*';
	}

    return `${command}\{${content}\}`;
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
