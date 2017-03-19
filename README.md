#Introduction

This repository contains different tools that I use when converting a open office document into a proper latex document.

## Italizer

The italizer tool lets you select two files. It will find the terms in the first file that is contained withing \textit{}, and then prompt you for the second file for each of these words if you want to encapsulate them with \textit{} also. Finally it overwrites the second file with content based on your decisions.

## Testing

To run the tests in specs, install mocha `npm install mocha -g`. Then navigate to the folder Specs and run `mocha . --recursive`.