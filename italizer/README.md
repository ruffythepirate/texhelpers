# Introduction

This tool reads two files. It finds all words encapsulated in \textit{} in the first file, and then try to find these words in the second file. It will then ask for each occurrence, if you want to encapsulate the word in the second file. After making a decision for each word, you are asked if you want to overwrite the second file with a content based on your decisions.

# Usage

```
    node italizer.js <path-to-where-tex-files-are>
```

# Recommendation

It is possible in Open Office to search and replace in a document using regular expressions, with formatting constraints. By doing this, you can select to search only for text that is in italics.

There you can search for `.*`, and replace it with `\\textit{$0}`. This way you get a text with all of the italics text contained with textit.