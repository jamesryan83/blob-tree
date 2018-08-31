

## Blob Tree

Creates an interactive file/folder tree from an array of objects from Azure Blob Storage.

[DEMO](https://jamesryan83.github.io/blob-tree/)



### Configuration

Add this script from the dist folder to the page

`<script src="dist/blob-tree.min.js"></script>`

Then add the following element to a page

`<div id="blob-tree"></div>`

And add the following element to the head of the page

`<link rel="stylesheet" href="dist/blob-tree.css" />`

Then in javascript after the page has loaded

    var blobTree = new BlobTree({
        treeEl: "blob-tree",
        folderFile: "__fld__",
        itemClicked: function (item) {
            console.log(item);
        }
    });

    blobTree.createTree(blobArray);

There's more examples in the index.html file and tests



### Options

| Option         | Type     | Action                                         |
| -------------- | -------- | ---------------------------------------------- |
| treeEl         | string   | blob-tree container element id                 |
| blobList       | array    | list of blobs                                  |
| onItemClicked  | function | item clicked callback                          |
| folderFile     | string   | name of zero byte file (see notes)             |
| ignore         | array    | file extensions to ignore (eg. ["pdf", "xls"]) |



### Notes

Azure blob storage folders are virtual and only exist if they contain something.  It is [recommended](https://stackoverflow.com/a/26719191) to use a zero byte blob as a way to have empty folders in blob storage.  The option `folderFile` is for this purpose and should be the name of the zero byte files.  It is assumed that every folder will have one of these files.

For a list of blobs like this

    folder/__fld__
    folder/file1.txt
    folder/file2.txt
    folder/folder2/__fld__
    folder/folder2/file3.txt
    folder/folder2/file4.txt
    file5.txt

The output will be like this

    folder
        file1.txt
        file2.txt
        folder2
            file3.txt
            file4.txt
    file5.txt

where `__fld__` is the zero byte `folderFile` blob


### Development

Build js only

`npm run start`

Builds js and minified js

`npm run dist`

Run tests

First run `npm run dist` then run `npm run test`

