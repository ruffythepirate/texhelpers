# Introduction

This repository contains different tools that I use when converting a open office document into a proper latex document.

## Italizer

The italizer tool lets you select two files. It will find the terms in the first file that is contained withing \textit{}, and then prompt you for the second file for each of these words if you want to encapsulate them with \textit{} also. Finally it overwrites the second file with content based on your decisions.

Use the tool by running `node italizer.js [source-file] [target-file]`. The tool will then find terms that are enclosed in `\textit{}`. It then looks for these words in the target-file and asks if they should also be enclosed in the target file. If the term already is enclosed in the target file it is ignored.

## Testing

To run the tests in specs, install mocha `npm install mocha -g`. Then navigate to the folder Specs and run `mocha . --recursive`.