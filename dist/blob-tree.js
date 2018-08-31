// Notes
// Blob tree
var BlobTree = /** @class */ (function () {
    function BlobTree(options) {
        this.options = options;
        if (!options || !options.treeEl) {
            console.log("blob-tree: treeEl missing");
            return;
        }
        var tree = document.getElementById(options.treeEl);
        if (!tree) {
            console.log("blob-tree: treeEl not found");
            return;
        }
    }
    // Formats a raw BlobList from azure into a folder structure
    BlobTree.prototype.formatBlobsForTree = function (blobList) {
        var _this = this;
        if (!blobList || blobList.length === 0)
            return [];
        // ignore blobs by file extension
        if (this.options.ignore && this.options.ignore.length > 0) {
            blobList = blobList.filter(function (x) {
                var ext = x.name.split(".");
                if (ext && ext.length > 1) {
                    if (_this.options.ignore.indexOf(ext[ext.length - 1]) !== -1)
                        return false;
                }
                return x;
            });
        }
        // azure bloblist to treeItems
        blobList = blobList.map(function (x) {
            var pathParts = x.name.split("/");
            var isFolder = false;
            // remove folderFile from pathParts array if it's there
            if (_this.options.folderFile && pathParts.length > 0 &&
                pathParts[pathParts.length - 1] === _this.options.folderFile) {
                pathParts.pop();
                isFolder = true;
            }
            return {
                name: pathParts[pathParts.length - 1],
                path: pathParts.join("/"),
                pathParts: pathParts,
                isFolder: isFolder
            };
        });
        // sort into file/folder order
        blobList.sort(function (a, b) {
            for (var i = 0, size = Math.min(a.pathParts.length, b.pathParts.length); i < size; i++) {
                var aIsFolder = i !== a.pathParts.length - 1 || (size === a.pathParts.length && a.isFolder);
                var bIsFolder = i !== b.pathParts.length - 1 || (size === b.pathParts.length && b.isFolder);
                if (aIsFolder && !bIsFolder)
                    return -1; // files after folders
                if (!aIsFolder && bIsFolder)
                    return 1;
                if (a.pathParts[i] < b.pathParts[i])
                    return -1; // alphabetical
                if (a.pathParts[i] > b.pathParts[i])
                    return 1;
            }
            if (a.pathParts.length > b.pathParts.length) {
                return 1;
            }
            else if (b.pathParts.length > a.pathParts.length) {
                return -1;
            }
            return 0;
        });
        return blobList;
    };
    // Create tree
    BlobTree.prototype.createTree = function (blobList) {
        var _this = this;
        if (!blobList || blobList.length === 0)
            return;
        var blobs = this.formatBlobsForTree(blobList);
        // create tree and tree items
        var ul = document.createElement("ul");
        blobs.forEach(function (blob) {
            var li = document.createElement("li");
            li.title = blob.name;
            li.setAttribute("data-path", blob.path);
            // add classes
            li.classList.add("blob-tree-item");
            li.classList.add("isVisible");
            if (blob.isFolder) {
                li.classList.add("isFolder");
                li.classList.add("isExpanded");
            }
            // indent tree item
            li.setAttribute("style", "padding-left: " + (30 + ((blob.pathParts.length - 1) * 15)) + "px");
            blob.li = li;
            // tree item text
            var label = document.createElement("label");
            // get display name (name without extension)
            var temp = blob.name.split(".");
            if (temp && temp.length > 1)
                temp.pop();
            temp = temp.join(".");
            label.appendChild(document.createTextNode(temp));
            li.appendChild(label);
            // add tree item to tree
            ul.appendChild(li);
        });
        // item click events
        ul.addEventListener("click", function (e) {
            if (e.target && e.target["nodeName"] == "LI") {
                e.stopPropagation();
                var li = e.target;
                var path = li.getAttribute("data-path");
                var pathParts = path.split("/");
                // create item object
                var item = {
                    name: pathParts[pathParts.length - 1],
                    path: path,
                    pathParts: pathParts,
                    isFolder: li.classList.contains("isFolder"),
                    isVisible: li.classList.contains("isVisible"),
                    li: li
                };
                // other folder events
                if (item.isFolder) {
                    item.isExpanded = li.classList.contains("isExpanded");
                    _this.expandCollapseItems(item);
                }
                // set as selected and return item
                _this.setSelectedItem(item);
                if (_this.options.onItemClicked) {
                    _this.options.onItemClicked(item);
                }
            }
        });
        var tree = document.getElementById(this.options.treeEl);
        // remove old list
        var oldUl = tree.firstChild;
        if (oldUl)
            tree.removeChild(oldUl);
        // add new list to tree container
        tree.appendChild(ul);
    };
    // Returns the currently selected item
    BlobTree.prototype.getSelectedItem = function () {
        var items = document.querySelectorAll(".blob-tree-item.isSelected");
        if (items && items.length > 0) {
            return this.getItemFromPath(items[0].getAttribute("data-path"));
        }
    };
    // Deselectes all items and sets the selected item
    BlobTree.prototype.setSelectedItem = function (item) {
        if (item && item.isSelected)
            return;
        // remove existing selected classes
        var elems = document.querySelectorAll(".blob-tree-item");
        elems.forEach(function (x) { return x.classList.remove("isSelected"); });
        if (item)
            item.li.classList.add("isSelected");
    };
    // Expand/collapse tree items
    BlobTree.prototype.expandCollapseItems = function (clickedItem) {
        if (!clickedItem || !clickedItem.isFolder)
            return;
        if (clickedItem.isExpanded) {
            clickedItem.li.classList.remove("isExpanded");
        }
        else {
            clickedItem.li.classList.add("isExpanded");
        }
        clickedItem.isExpanded = !clickedItem.isExpanded;
        var isAfter = false; // collapsing an item doesn't affect items before itself
        var currentItem = null;
        var currentPath = null; // data-path of current item
        var ul = document.getElementById("blob-tree").children.item(0);
        // for each item after the item that was clicked
        for (var i = 0; i < ul.childElementCount; i++) {
            currentItem = ul.children.item(i);
            currentPath = currentItem.getAttribute("data-path");
            if (isAfter) {
                // stop if no longer inside folder
                if (currentPath.split("/").length <= clickedItem.pathParts.length)
                    break;
                // if collapsed
                if (!clickedItem.isExpanded) {
                    currentItem.classList.remove("isVisible");
                    // show only items with expanded parents
                }
                else {
                    // get parent item
                    var parent_1 = null;
                    if (i > 0) {
                        innerFor: for (var j = i - 1; j >= 0; j--) {
                            var tempItem = ul.children.item(j);
                            if (tempItem.classList.contains("isFolder") &&
                                tempItem.getAttribute("data-path").split("/").length <
                                    currentItem.getAttribute("data-path").split("/").length) {
                                parent_1 = tempItem;
                                break innerFor;
                            }
                        }
                    }
                    else {
                        parent_1 = currentItem;
                    }
                    if (parent_1 &&
                        parent_1.classList.contains("isFolder") &&
                        parent_1.classList.contains("isExpanded") &&
                        parent_1.classList.contains("isVisible")) {
                        currentItem.classList.add("isVisible");
                    }
                }
            }
            // start process items below clicked item
            if (currentPath === clickedItem.path)
                isAfter = true;
        }
    };
    // Returns a tree item from its filepath
    BlobTree.prototype.getItemFromPath = function (path) {
        var items = document.querySelectorAll("[data-path='" + path + "']");
        if (items && items.length > 0) {
            var pathParts = path.split("/");
            var item = {
                name: pathParts[pathParts.length - 1],
                path: path,
                pathParts: pathParts,
                isFolder: items[0].classList.contains("isFolder"),
                isVisible: items[0].classList.contains("isVisible"),
                li: items[0]
            };
            if (item.isFolder)
                item.isExpanded = items[0].classList.contains("isExpanded");
            return item;
        }
    };
    // Remove a file from the tree
    BlobTree.prototype.removeFile = function (filePath) {
        if (!filePath)
            return;
        var item = this.getItemFromPath(filePath);
        if (item && !item.isFolder) {
            item.li.parentNode.removeChild(item.li);
        }
    };
    // Remove a folder and its sub items
    BlobTree.prototype.removeFolder = function (folderPath) {
        if (!folderPath)
            return [];
        var removedPaths = [];
        var item = this.getItemFromPath(folderPath);
        folderPath += "/";
        if (item && item.isFolder) {
            document.querySelectorAll(".blob-tree-item").forEach(function (x) {
                var path = x.getAttribute("data-path");
                if (x.classList.contains("isFolder"))
                    path += "/";
                if (path.indexOf(folderPath) === 0) {
                    x.parentNode.removeChild(x);
                    removedPaths.push(path);
                }
            });
        }
        return removedPaths;
    };
    return BlobTree;
}());
if (typeof module !== "undefined" && this.module !== module) {
    exports = module.exports = BlobTree;
}
