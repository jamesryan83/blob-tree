"use strict";

// BlobTree tests

declare let karmaHTML: any;


let testBlobs1 = [
    { "name": "folder1/__fld__" },
    { "name": "folder1/file1.html" },
    { "name": "folder1/file2.html" },
    { "name": "folder1/file3.html" },
    { "name": "folder1/folder1/__fld__" },
    { "name": "folder1/folder1/file1.html" },
    { "name": "folder1/folder1/file2.html" },
    { "name": "folder1/folder1/folder1/__fld__" },
    { "name": "folder1/folder1/folder1/file1.html" },
    { "name": "folder1/folder2/__fld__" },
    { "name": "folder1/folder2/folder1/__fld__" },
    { "name": "folder1/folder2/folder1/file1.html" },
    { "name": "folder1/folder2/folder1/folder1/__fld__" },
    { "name": "folder1/folder2/folder1/folder1/file1.html" },
    { "name": "folder1/folder3/__fld__" },
    { "name": "folder1/folder3/file1.html" }
];


describe("BlobTree", () => {


    beforeEach(function (done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

        karmaHTML[0].open();
        karmaHTML[0].onstatechange = function (ready) {
          if (ready) done();
        };
    });


    afterEach(function () {
        karmaHTML[0].close();
    });





    it("new BlobTree() returns error if treeEl is missing", () => {
        let cs = karmaHTML[0].document.defaultView.console;
        spyOn(cs, "log");

        getBlobTree({});

        // check error was logged
        expect(cs.log).toHaveBeenCalledWith("blob-tree: treeEl missing");

        getBlobTree({ treeEl: "" });

        // check error was logged
        expect(cs.log).toHaveBeenCalledWith("blob-tree: treeEl missing");
    });


    it("new BlobTree() returns error if treeEl is not found", () => {
        let cs = karmaHTML[0].document.defaultView.console;
        spyOn(cs, "log");

        getBlobTree({ treeEl: "blah" });

        // check error was logged
        expect(cs.log).toHaveBeenCalledWith("blob-tree: treeEl not found");
    });


    it("new BlobTree() sets tree and options", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });

        // check options
        expect(blobTree.options).toEqual({ treeEl: "blob-tree" } as BlobTreeOptions);
    });




    it("#formatBlobsForTree works with no blobs", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });

        var result = blobTree.formatBlobsForTree(null);
        expect(result).toEqual([]);

        result = blobTree.formatBlobsForTree([]);
        expect(result).toEqual([]);
    });


    it("#formatBlobsForTree works - single file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });

        let result = blobTree.formatBlobsForTree([{ name: "test.html" }]);
        expect(result).toEqual([{
            name: "test.html",
            path: "test.html",
            pathParts: [ "test.html" ],
            isFolder: false
        }]);
    });


    it("#formatBlobsForTree works - single file ignored", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", ignore: ["png"] });

        let result = blobTree.formatBlobsForTree([{ name: "test.png" }]);
        expect(result).toEqual([]);
    });


    it("#formatBlobsForTree works - single folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([{ name: "test/__fld__" }]);
        expect(result).toEqual([{
            name: "test",
            path: "test",
            pathParts: [ "test" ],
            isFolder: true
        }]);
    });


    it("#formatBlobsForTree works - two files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });

        let result = blobTree.formatBlobsForTree([{ name: "test1.pdf" }, { name: "test2.pdf" }]);
        expect(result).toEqual([{
            name: "test1.pdf",
            path: "test1.pdf",
            pathParts: [ "test1.pdf" ],
            isFolder: false
        }, {
            name: "test2.pdf",
            path: "test2.pdf",
            pathParts: [ "test2.pdf" ],
            isFolder: false
        }]);
    });


    it("#formatBlobsForTree works - two folders", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([{ name: "test1/__fld__" }, { name: "test2/__fld__" }]);
        expect(result).toEqual([{
            name: "test1",
            path: "test1",
            pathParts: [ "test1" ],
            isFolder: true
        }, {
            name: "test2",
            path: "test2",
            pathParts: [ "test2" ],
            isFolder: true
        }]);
    });


    it("#formatBlobsForTree works - folder then file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([{ name: "test1/__fld__" }, { name: "test2.xml" }]);
        expect(result).toEqual([{
            name: "test1",
            path: "test1",
            pathParts: [ "test1" ],
            isFolder: true
        }, {
            name: "test2.xml",
            path: "test2.xml",
            pathParts: [ "test2.xml" ],
            isFolder: false
        }]);
    });


    it("#formatBlobsForTree works - file then folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([{ name: "test1.xml" }, { name: "test2/__fld__" }]);
        expect(result).toEqual([{
            name: "test2",
            path: "test2",
            pathParts: [ "test2" ],
            isFolder: true
        }, {
            name: "test1.xml",
            path: "test1.xml",
            pathParts: [ "test1.xml" ],
            isFolder: false
        }]);
    });


    it("#formatBlobsForTree works - file then folder then file then folder then file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([
            { "name": "test.html" },
            { "name": "test2/__fld__"},
            { "name": "test3.html" },
            { "name": "test4/__fld__" },
            { "name": "test5.html" }
        ]);

        expect(result).toEqual([
            { "name": "test2", "path": "test2", "pathParts": [ "test2" ], "isFolder": true },
            { "name": "test4", "path": "test4", "pathParts": [ "test4" ], "isFolder": true },
            { "name": "test.html", "path": "test.html", "pathParts": [ "test.html" ], "isFolder": false },
            { "name": "test3.html", "path": "test3.html", "pathParts": [ "test3.html" ], "isFolder": false },
            { "name": "test5.html", "path": "test5.html", "pathParts": [ "test5.html" ], "isFolder": false }
        ]);
    });


    it("#formatBlobsForTree works - file in folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([
            { "name": "test/__fld__" },
            { "name": "test/test.html" }
        ]);

        expect(result).toEqual([
            { "name": "test", "path": "test", "pathParts": [ "test" ], "isFolder": true },
            { "name": "test.html", "path": "test/test.html", "pathParts": [ "test", "test.html" ], "isFolder": false }
        ]);
    });


    it("#formatBlobsForTree works - file in folder ignore files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__", ignore: ["png"] });

        let result = blobTree.formatBlobsForTree([
            { "name": "test/test2/__fld__" },
            { "name": "test/test2/test2.png" },
            { "name": "test/__fld__" },
            { "name": "test/test.html" },
            { "name": "test/test2.png" },
            { "name": "test1.png" }
        ]);

        expect(result).toEqual([
            { "name": "test", "path": "test", "pathParts": [ "test" ], "isFolder": true },
            { "name": "test2", "path": "test/test2", "pathParts": [ "test", "test2" ], "isFolder": true },
            { "name": "test.html", "path": "test/test.html", "pathParts": [ "test", "test.html" ], "isFolder": false }
        ]);
    });


    it("#formatBlobsForTree works - subfolder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([
            { "name": "test/__fld__" },
            { "name": "test/test2/__fld__" }
        ]);

        expect(result).toEqual([
            { "name": "test", "path": "test", "pathParts": [ "test" ], "isFolder": true },
            { "name": "test2", "path": "test/test2", "pathParts": [ "test", "test2" ], "isFolder": true }
        ]);
    });


    it("#formatBlobsForTree works - bigger one 1", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree([
            { name: "test1/__fld__" },
            { name: "test2/test3/test4/test.html" },
            { name: "test2/test3/test5/test7/__fld__" },
            { name: "test2/test3/test5/test7/test.html" },
            { name: "test2/test3/test4/__fld__" },
            { name: "test2/test3/test5/__fld__" },
            { name: "test2/test3/__fld__" },
            { name: "test2/test3/test.html" },
            { name: "test2/test3/test2.html" },
            { name: "test2/__fld__" },
            { name: "test4/__fld__" },
            { name: "test5/something/__fld__" },
            { name: "test5/something/hi.html" },
            { name: "test5/__fld__" },
            { name: "hi2.html" },
            { name: "test.html" },
            { name: "test3.html" },
            { name: "test5.html" }
        ]);

        expect(result).toEqual([
            { name: "test1", path: "test1", pathParts: [ "test1" ], isFolder: true },
            { name: "test2", path: "test2", pathParts: [ "test2" ], isFolder: true },
            { name: "test3", path: "test2/test3", pathParts: [ "test2", "test3" ], isFolder: true },
            { name: "test4", path: "test2/test3/test4", pathParts: [ "test2", "test3", "test4" ], isFolder: true },
            { name: "test.html", path: "test2/test3/test4/test.html", pathParts: [ "test2", "test3", "test4", "test.html" ], isFolder: false },
            { name: "test5", path: "test2/test3/test5", pathParts: [ "test2", "test3", "test5" ], isFolder: true },
            { name: "test7", path: "test2/test3/test5/test7", pathParts: [ "test2", "test3", "test5", "test7" ], isFolder: true },
            { name: "test.html", path: "test2/test3/test5/test7/test.html", pathParts: [ "test2", "test3", "test5", "test7", "test.html" ], isFolder: false },
            { name: "test.html", path: "test2/test3/test.html", pathParts: [ "test2", "test3", "test.html" ], isFolder: false },
            { name: "test2.html", path: "test2/test3/test2.html", pathParts: [ "test2", "test3", "test2.html" ], isFolder: false },
            { name: "test4", path: "test4", pathParts: [ "test4" ], isFolder: true },
            { name: "test5", path: "test5", pathParts: [ "test5" ], isFolder: true },
            { name: "something", path: "test5/something", pathParts: [ "test5", "something" ], isFolder: true },
            { name: "hi.html", path: "test5/something/hi.html", pathParts: [ "test5", "something", "hi.html" ], isFolder: false },
            { name: "hi2.html", path: "hi2.html", pathParts: [ "hi2.html" ], isFolder: false },
            { name: "test.html", path: "test.html", pathParts: [ "test.html" ], isFolder: false },
            { name: "test3.html", path: "test3.html", pathParts: [ "test3.html" ], isFolder: false },
            { name: "test5.html", path: "test5.html", pathParts: [ "test5.html" ], isFolder: false }
        ]);
    });


    it("#formatBlobsForTree works - bigger one 2", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });

        let result = blobTree.formatBlobsForTree(testBlobs1);

        expect(result).toEqual([
            { name: "folder1", path: "folder1", pathParts: ["folder1"], isFolder: true },
            { name: "folder1", path: "folder1/folder1", pathParts: ["folder1", "folder1"], isFolder: true },
            { name: "folder1", path: "folder1/folder1/folder1", pathParts: ["folder1", "folder1", "folder1"], isFolder: true },
            { name: "file1.html", path: "folder1/folder1/folder1/file1.html", pathParts: ["folder1", "folder1", "folder1", "file1.html"], isFolder: false },
            { name: "file1.html", path: "folder1/folder1/file1.html", pathParts: ["folder1", "folder1", "file1.html"], isFolder: false },
            { name: "file2.html", path: "folder1/folder1/file2.html", pathParts: ["folder1", "folder1", "file2.html"], isFolder: false },
            { name: "folder2", path: "folder1/folder2", pathParts: ["folder1", "folder2"], isFolder: true },
            { name: "folder1", path: "folder1/folder2/folder1", pathParts: ["folder1", "folder2", "folder1"], isFolder: true },
            { name: "folder1", path: "folder1/folder2/folder1/folder1", pathParts: ["folder1", "folder2", "folder1", "folder1"], isFolder: true },
            { name: "file1.html", path: "folder1/folder2/folder1/folder1/file1.html", pathParts: ["folder1", "folder2", "folder1", "folder1", "file1.html"], isFolder: false },
            { name: "file1.html", path: "folder1/folder2/folder1/file1.html", pathParts: ["folder1", "folder2", "folder1", "file1.html"], isFolder: false },
            { name: "folder3", path: "folder1/folder3", pathParts: ["folder1", "folder3"], isFolder: true },
            { name: "file1.html", path: "folder1/folder3/file1.html", pathParts: ["folder1", "folder3", "file1.html"], isFolder: false },
            { name: "file1.html", path: "folder1/file1.html", pathParts: ["folder1", "file1.html"], isFolder: false },
            { name: "file2.html", path: "folder1/file2.html", pathParts: ["folder1", "file2.html"], isFolder: false },
            { name: "file3.html", path: "folder1/file3.html", pathParts: ["folder1", "file3.html"], isFolder: false}
        ]);

    });




    it("#createTree does nothing when there's no blobs", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });
        spyOn(blobTree, "formatBlobsForTree");

        blobTree.createTree([]);

        expect(blobTree.formatBlobsForTree).toHaveBeenCalledTimes(0);
    });


    it("#createTree creates a tree - single file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree" });
        spyOn(blobTree, "formatBlobsForTree").and.callThrough();

        blobTree.createTree([{ name: "test1.pdf" }]);

        expect(blobTree.formatBlobsForTree).toHaveBeenCalledTimes(1);

        let tree = getDocument().getElementById("blob-tree");
        expect(tree.childElementCount).toBe(1);

        let ul = tree.children.item(0);
        expect(ul.nodeName).toBe("UL");
        expect(ul.childElementCount).toBe(1);

        let li = ul.children.item(0);
        expect(li.nodeName).toBe("LI");
        expect(li.childElementCount).toBe(1);
        expect(li.classList.toString()).toBe("blob-tree-item isVisible");
        expect(li["title"]).toBe("test1.pdf");

        let label = li.children.item(0);
        expect(label.nodeName).toBe("LABEL");
        expect(label.childElementCount).toBe(0);
        expect(label.innerHTML).toBe("test1");
    });


    it("#createTree creates a tree - single folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        spyOn(blobTree, "formatBlobsForTree").and.callThrough();

        blobTree.createTree([{ name: "folder1/__fld__" }]);

        expect(blobTree.formatBlobsForTree).toHaveBeenCalledTimes(1);

        let tree = getDocument().getElementById("blob-tree");
        expect(tree.childElementCount).toBe(1);

        let ul = tree.children.item(0);
        expect(ul.nodeName).toBe("UL");
        expect(ul.childElementCount).toBe(1);

        let li = ul.children.item(0);
        expect(li.nodeName).toBe("LI");
        expect(li.childElementCount).toBe(1);
        expect(li.classList.toString()).toBe("blob-tree-item isVisible isFolder isExpanded");
        expect(li["title"]).toBe("folder1");

        let label = li.children.item(0);
        expect(label.nodeName).toBe("LABEL");
        expect(label.childElementCount).toBe(0);
        expect(label.innerHTML).toBe("folder1");
    });


    it("#createTree creates a tree - bigger one", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        spyOn(blobTree, "formatBlobsForTree").and.callThrough();

        blobTree.createTree(testBlobs1);

        expect(blobTree.formatBlobsForTree).toHaveBeenCalledTimes(1);

        let tree = getDocument().getElementById("blob-tree");
        expect(tree.childElementCount).toBe(1);

        let ul = tree.children.item(0);
        expect(ul.nodeName).toBe("UL");
        expect(ul.childElementCount).toBe(16);

        // check first item
        let li = ul.children.item(0);
        expect(li.nodeName).toBe("LI");
        expect(li.childElementCount).toBe(1);
        expect(li.classList.toString()).toBe("blob-tree-item isVisible isFolder isExpanded");
        expect(li["title"]).toBe("folder1");

        let label = li.children.item(0);
        expect(label.nodeName).toBe("LABEL");
        expect(label.childElementCount).toBe(0);
        expect(label.innerHTML).toBe("folder1");
    });




    it("click file sets file as selected", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        spyOn(blobTree, "setSelectedItem").and.callThrough();

        blobTree.createTree([{ name: "test1.pdf" }, { name: "test2.txt" }]);

        let tree = getDocument().getElementById("blob-tree");
        let ul = tree.children.item(0);

        let li = ul.children.item(0) as HTMLElement;
        let li2 = ul.children.item(1) as HTMLElement;

        // select item
        expect(li.classList.contains("isSelected")).toBeFalsy();
        li.click();
        expect(blobTree.setSelectedItem).toHaveBeenCalledTimes(1);
        expect(li.classList.contains("isSelected")).toBeTruthy();
        expect(li2.classList.contains("isSelected")).toBeFalsy();

        // select different item
        li2.click();
        expect(blobTree.setSelectedItem).toHaveBeenCalledTimes(2);
        expect(li2.classList.contains("isSelected")).toBeTruthy();

        // check initial selected item was deselected
        expect(li.classList.contains("isSelected")).toBeFalsy();
    });


    it("click folder sets folder as selected", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        spyOn(blobTree, "setSelectedItem").and.callThrough();

        blobTree.createTree([{ name: "test/__fld__" }, { name: "test.pdf" }]);

        let tree = getDocument().getElementById("blob-tree");
        let ul = tree.children.item(0);

        let li = ul.children.item(0) as HTMLElement;
        let li2 = ul.children.item(1) as HTMLElement;

        // select item
        expect(li.classList.contains("isSelected")).toBeFalsy();
        li.click();
        expect(blobTree.setSelectedItem).toHaveBeenCalledTimes(1);
        expect(li.classList.contains("isSelected")).toBeTruthy();
        expect(li2.classList.contains("isSelected")).toBeFalsy();

        // select different item
        li2.click();
        expect(blobTree.setSelectedItem).toHaveBeenCalledTimes(2);
        expect(li2.classList.contains("isSelected")).toBeTruthy();

        // check initial selected item was deselected
        expect(li.classList.contains("isSelected")).toBeFalsy();
    });


    it("click file returns clicked file", () => {
        let clickCount = 0;

        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__", onItemClicked: function (item) {
            clickCount++;

            if (clickCount === 1) expect(item.name).toBe("test1.pdf");
            if (clickCount === 2) expect(item.name).toBe("test2.txt");
        }});

        spyOn(blobTree, "setSelectedItem").and.callThrough();

        blobTree.createTree([{ name: "test1.pdf" }, { name: "test2.txt" }]);

        let tree = getDocument().getElementById("blob-tree");
        let ul = tree.children.item(0);

        let li = ul.children.item(0) as HTMLElement;
        let li2 = ul.children.item(1) as HTMLElement;

        // select item
        li.click();

        // select different item
        li2.click();

    });


    it("click folder returns folder and calls update state and expand item", () => {
        let clickCount = 0;

        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__", onItemClicked: function (item) {
            clickCount++;

            if (clickCount === 1) expect(item.name).toBe("test");
            if (clickCount === 2) expect(item.name).toBe("test.txt");
        }});

        spyOn(blobTree, "setSelectedItem").and.callThrough();
        spyOn(blobTree, "expandCollapseItems").and.callThrough();

        blobTree.createTree([{ name: "test/__fld__" }, { name: "test.txt" }]);

        let tree = getDocument().getElementById("blob-tree");
        let ul = tree.children.item(0);

        let li = ul.children.item(0) as HTMLElement;
        let li2 = ul.children.item(1) as HTMLElement;

        // select item
        li.click();

        // select different item
        li2.click();

        expect(blobTree.expandCollapseItems).toHaveBeenCalledTimes(1);
    });




    it("#expandCollapseItems works - single folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "folder1/__fld__" }]);

        let item = blobTree.getItemFromPath("folder1");
        expect(item.isExpanded).toBeTruthy();

        item.li.click();

        item = blobTree.getItemFromPath("folder1");
        expect(item.isExpanded).toBeFalsy();
    });


    it("#expandCollapseItems works - single folder with file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "folder1/__fld__" }, { name: "folder1/test.pdf" }]);

        let folder = blobTree.getItemFromPath("folder1");
        let file = blobTree.getItemFromPath("folder1/test.pdf");
        expect(folder.isExpanded).toBeTruthy();
        expect(file.isVisible).toBeTruthy();

        folder.li.click();

        folder = blobTree.getItemFromPath("folder1");
        expect(folder.isExpanded).toBeFalsy();
        file = blobTree.getItemFromPath("folder1/test.pdf");
        expect(file.isVisible).toBeFalsy();
    });


    it("#expandCollapseItems works - single folder two files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder1/__fld__" },
            { name: "folder1/test.pdf" },
            { name: "folder1/test2.pdf" }
        ]);

        let folder = blobTree.getItemFromPath("folder1");
        let file = blobTree.getItemFromPath("folder1/test.pdf");
        let file2 = blobTree.getItemFromPath("folder1/test2.pdf");
        expect(folder.isExpanded).toBeTruthy();
        expect(file.isVisible).toBeTruthy();
        expect(file2.isVisible).toBeTruthy();

        folder.li.click();

        folder = blobTree.getItemFromPath("folder1");
        expect(folder.isExpanded).toBeFalsy();
        file = blobTree.getItemFromPath("folder1/test.pdf");
        file2 = blobTree.getItemFromPath("folder1/test2.pdf");
        expect(file.isVisible).toBeFalsy();
        expect(file2.isVisible).toBeFalsy();
    });


    it("#expandCollapseItems works - nested folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder1/__fld__" },
            { name: "folder1/test.pdf" },
            { name: "folder1/folder2/__fld__" },
            { name: "folder1/folder2/test2.pdf" },
            { name: "test3.pdf" }
        ]);


        let folder = blobTree.getItemFromPath("folder1");
        let folder2 = blobTree.getItemFromPath("folder1/folder2");
        let file = blobTree.getItemFromPath("folder1/test.pdf");
        let file2 = blobTree.getItemFromPath("folder1/folder2/test2.pdf");
        let file3 = blobTree.getItemFromPath("test3.pdf");
        expect(folder.isExpanded).toBeTruthy();
        expect(folder2.isExpanded).toBeTruthy();
        expect(file.isVisible).toBeTruthy();
        expect(file2.isVisible).toBeTruthy();
        expect(file3.isVisible).toBeTruthy();

        folder2.li.click();

        folder = blobTree.getItemFromPath("folder1");
        folder2 = blobTree.getItemFromPath("folder1/folder2");
        file = blobTree.getItemFromPath("folder1/test.pdf");
        file2 = blobTree.getItemFromPath("folder1/folder2/test2.pdf");
        file3 = blobTree.getItemFromPath("test3.pdf");
        expect(folder.isExpanded).toBeTruthy();
        expect(folder2.isExpanded).toBeFalsy();
        expect(file.isVisible).toBeTruthy();
        expect(file2.isVisible).toBeFalsy();
        expect(file3.isVisible).toBeTruthy();

        folder.li.click();

        folder = blobTree.getItemFromPath("folder1");
        folder2 = blobTree.getItemFromPath("folder1/folder2");
        file = blobTree.getItemFromPath("folder1/test.pdf");
        file2 = blobTree.getItemFromPath("folder1/folder2/test2.pdf");
        file3 = blobTree.getItemFromPath("test3.pdf");
        expect(folder.isExpanded).toBeFalsy();
        expect(folder2.isExpanded).toBeFalsy();
        expect(file.isVisible).toBeFalsy();
        expect(file2.isVisible).toBeFalsy();
        expect(file3.isVisible).toBeTruthy();

        folder.li.click();

        folder = blobTree.getItemFromPath("folder1");
        folder2 = blobTree.getItemFromPath("folder1/folder2");
        file = blobTree.getItemFromPath("folder1/test.pdf");
        file2 = blobTree.getItemFromPath("folder1/folder2/test2.pdf");
        file3 = blobTree.getItemFromPath("test3.pdf");
        expect(folder.isExpanded).toBeTruthy();
        expect(folder2.isExpanded).toBeFalsy();
        expect(file.isVisible).toBeTruthy();
        expect(file2.isVisible).toBeFalsy();
        expect(file3.isVisible).toBeTruthy();
    });




    it("#removeFile does nothing when item not found", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "test1.pdf" }]);

        blobTree.removeFile("blah");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(1);
    });


    it("#removeFile does nothing when item is a folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "folder/__fld__" }]);

        blobTree.removeFile("folder");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(1);
    });


    it("#removeFile removes a file - single file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "test1.pdf" }]);

        blobTree.removeFile("test1.pdf");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(0);
    });


    it("#removeFile removes a file - file in folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder/__fld__" },
            { name: "folder/test1.pdf" },
            { name: "folder/test2.pdf" },
        ]);

        blobTree.removeFile("folder/test1.pdf");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(2);
    });




    it("#removeFolder does nothing when item not found", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "folder/__fld__" }]);

        let removedPaths = blobTree.removeFolder("folder2");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(1);
        expect(removedPaths).toEqual([]);
    });


    it("#removeFolder does nothing when item is a file", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "test.csv" }]);

        let removedPaths = blobTree.removeFolder("test.csv");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(1);
        expect(removedPaths).toEqual([]);
    });


    it("#removeFolder removes a folder - single folder", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([{ name: "folder/__fld__" }]);

        let removedPaths = blobTree.removeFolder("folder");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(0);
        expect(removedPaths).toEqual(["folder/"]);
    });


    it("#removeFolder removes a folder - folder with files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder/__fld__" },
            { name: "folder/test.csv" },
            { name: "folder/test2.pdf" }
        ]);

        let removedPaths = blobTree.removeFolder("folder");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(0);
        expect(removedPaths).toEqual(["folder/", "folder/test.csv", "folder/test2.pdf"]);
    });


    it("#removeFolder removes a folder - inner folder with files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder/__fld__" },
            { name: "folder/test.csv" },
            { name: "folder/test2.pdf" },
            { name: "folder/folder2/__fld__" },
            { name: "folder/folder2/test1.pdf" },
            { name: "folder/folder2/test2.pdf" }
        ]);

        let removedPaths = blobTree.removeFolder("folder/folder2");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(3);
        expect(removedPaths).toEqual([
            "folder/folder2/", "folder/folder2/test1.pdf", "folder/folder2/test2.pdf"]);
    });


    it("#removeFolder removes a folder - outer folder with files", () => {
        let blobTree = getBlobTree({ treeEl: "blob-tree", folderFile: "__fld__" });
        blobTree.createTree([
            { name: "folder/__fld__" },
            { name: "folder/test.csv" },
            { name: "folder/test2.pdf" },
            { name: "folder/folder2/__fld__" },
            { name: "folder/folder2/test1.pdf" },
            { name: "folder/folder2/test2.pdf" }
        ]);

        let removedPaths = blobTree.removeFolder("folder");

        let ul = getDocument().getElementById("blob-tree").children.item(0);
        expect(ul.childElementCount).toBe(0);
        expect(removedPaths).toEqual([
            "folder/",
            "folder/folder2/",
            "folder/folder2/test1.pdf",
            "folder/folder2/test2.pdf",
            "folder/test.csv",
            "folder/test2.pdf"]);
    });





    // --------------------- Other functions  ---------------------

    // returns a new BlobTree
    function getBlobTree(options): BlobTree {
        return new karmaHTML[0].document.defaultView.BlobTree(options);
    }


    function getDocument(): HTMLDocument {
        return karmaHTML[0].document;
    }

});
