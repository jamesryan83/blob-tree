
// Notes

// Blob tree options
interface BlobTreeOptions {
    treeEl: string,
    blobList: any[],
    onItemClicked: Function,
    folderFile: string,
    ignore: string[]
}


// A single tree item
interface TreeItem {
    name: string;
    path: string;
    pathParts: string[];
    isFolder: boolean;
    isExpanded?: boolean;
    isSelected?: boolean;
    isVisible: boolean;
    li: any;
}


// Blob tree
class BlobTree {


    constructor(public options: BlobTreeOptions) {
        if (!options || !options.treeEl) {
            console.log("blob-tree: treeEl missing");
            return;
        }

        let tree = document.getElementById(options.treeEl);
        if (!tree) {
            console.log("blob-tree: treeEl not found");
            return;
        }
    }


    // Formats a raw BlobList from azure into a folder structure
    formatBlobsForTree (blobList: any[]) {
        if (!blobList || blobList.length === 0) return [];


        // ignore blobs by file extension
        if (this.options.ignore && this.options.ignore.length > 0) {
            blobList = blobList.filter(x => {
                let ext = x.name.split(".");
                if (ext && ext.length > 1) {
                    if (this.options.ignore.indexOf(ext[ext.length - 1]) !== -1) return false;
                }
                return x;
            });
        }


        // azure bloblist to treeItems
        blobList = blobList.map((x) => {
            let pathParts = x.name.split("/");
            let isFolder = false;

            // remove folderFile from pathParts array if it's there
            if (this.options.folderFile && pathParts.length > 0 &&
                pathParts[pathParts.length - 1] === this.options.folderFile) {
                pathParts.pop();
                isFolder = true;
            }

            return {
                name: pathParts[pathParts.length - 1],
                path: pathParts.join("/"),
                pathParts: pathParts,
                isFolder: isFolder
            }
        });


        // sort into file/folder order
        blobList.sort((a, b)  => {
            for (let i = 0, size = Math.min(a.pathParts.length, b.pathParts.length); i < size; i++) {
                var aIsFolder = i !== a.pathParts.length - 1 || (size === a.pathParts.length && a.isFolder);
                var bIsFolder = i !== b.pathParts.length - 1 || (size === b.pathParts.length && b.isFolder);

                if (aIsFolder && !bIsFolder) return -1; // files after folders
                if (!aIsFolder && bIsFolder) return 1;

                if (a.pathParts[i] < b.pathParts[i]) return -1; // alphabetical
                if (a.pathParts[i] > b.pathParts[i]) return 1;
            }

            if (a.pathParts.length > b.pathParts.length) {
                return 1;
            } else if (b.pathParts.length > a.pathParts.length) {
                return -1;
            }

            return 0;
        });


        return blobList;
    }


    // Create tree
    createTree (blobList: any[]) {
        if (!blobList || blobList.length === 0) return;


        let blobs = this.formatBlobsForTree(blobList);


        // create tree and tree items
        let ul = document.createElement("ul");
        blobs.forEach(blob => {

            let li = document.createElement("li");
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


            blob.li = li


            // tree item text
            let label = document.createElement("label");

            // get display name (name without extension)
            let temp = blob.name.split(".");
            if (temp && temp.length > 1) temp.pop();
            temp = temp.join(".");

            label.appendChild(document.createTextNode(temp));
            li.appendChild(label);

            // add tree item to tree
            ul.appendChild(li);
        });


        // item click events
        ul.addEventListener("click", (e) => {
            if (e.target && e.target["nodeName"] == "LI") {
                e.stopPropagation();

                let li = e.target as HTMLElement;
                let path = li.getAttribute("data-path");
                let pathParts = path.split("/");

                // create item object
                let item = {
                    name: pathParts[pathParts.length - 1],
                    path: path,
                    pathParts: pathParts,
                    isFolder: li.classList.contains("isFolder"),
                    isVisible: li.classList.contains("isVisible"),
                    li: li
                } as TreeItem;

                // other folder events
                if (item.isFolder) {
                    item.isExpanded = li.classList.contains("isExpanded");
                    this.expandCollapseItems(item);
                }

                // set as selected and return item
                this.setSelectedItem(item);
                if (this.options.onItemClicked) {
                    this.options.onItemClicked(item);
                }
            }
        });


        let tree = document.getElementById(this.options.treeEl)

        // remove old list
        let oldUl = tree.firstChild;
        if (oldUl) tree.removeChild(oldUl);

        // add new list to tree container
        tree.appendChild(ul);
    }


    // Returns the currently selected item
    getSelectedItem (): TreeItem {
        let items = document.querySelectorAll(".blob-tree-item.isSelected");
        if (items && items.length > 0) {
            return this.getItemFromPath(items[0].getAttribute("data-path"));
        }
    }


    // Deselectes all items and sets the selected item
    setSelectedItem (item: TreeItem) {
        if (item && item.isSelected) return;

        // remove existing selected classes
        let elems = document.querySelectorAll(".blob-tree-item");
        elems.forEach(x => x.classList.remove("isSelected"));

        if (item) item.li.classList.add("isSelected");
    }


    // Expand/collapse tree items
    expandCollapseItems (clickedItem: TreeItem) {
        if (!clickedItem || !clickedItem.isFolder) return;


        if (clickedItem.isExpanded) {
            clickedItem.li.classList.remove("isExpanded");
        } else {
            clickedItem.li.classList.add("isExpanded");
        }
        clickedItem.isExpanded = !clickedItem.isExpanded;


        let isAfter = false; // collapsing an item doesn't affect items before itself
        let currentItem = null;
        let currentPath = null; // data-path of current item
        let ul = document.getElementById("blob-tree").children.item(0);


        // for each item after the item that was clicked
        for (let i = 0; i < ul.childElementCount; i++) {
            currentItem = ul.children.item(i);
            currentPath = currentItem.getAttribute("data-path");

            if (isAfter) {

                // stop if no longer inside folder
                if (currentPath.split("/").length <= clickedItem.pathParts.length) break;


                // if collapsed
                if (!clickedItem.isExpanded) {
                    currentItem.classList.remove("isVisible");


                // show only items with expanded parents
                } else {

                    // get parent item
                    let parent = null;
                    if (i > 0) {
                        innerFor:
                            for (let j = i - 1; j >= 0; j--) {
                                let tempItem = ul.children.item(j);

                                if (tempItem.classList.contains("isFolder") &&
                                    tempItem.getAttribute("data-path").split("/").length <
                                    currentItem.getAttribute("data-path").split("/").length) {
                                        parent = tempItem;
                                        break innerFor;
                                }
                        }
                    } else {
                        parent = currentItem;
                    }

                    if (parent &&
                        parent.classList.contains("isFolder") &&
                        parent.classList.contains("isExpanded") &&
                        parent.classList.contains("isVisible")) {
                        currentItem.classList.add("isVisible");
                    }
                }
            }

            // start process items below clicked item
            if (currentPath === clickedItem.path) isAfter = true;
        }
    }


    // Returns a tree item from its filepath
    getItemFromPath (path: string): TreeItem {
        let items = document.querySelectorAll("[data-path='" + path + "']");

        if (items && items.length > 0) {
            let pathParts = path.split("/");

            let item = {
                name: pathParts[pathParts.length - 1],
                path: path,
                pathParts: pathParts,
                isFolder: items[0].classList.contains("isFolder"),
                isVisible: items[0].classList.contains("isVisible"),
                li: items[0]
            } as TreeItem;

            if (item.isFolder) item.isExpanded = items[0].classList.contains("isExpanded");

            return item;
        }
    }


    // Remove a file from the tree
    removeFile (filePath) {
        if (!filePath) return;

        let item = this.getItemFromPath(filePath);
        if (item && !item.isFolder) {
            item.li.parentNode.removeChild(item.li);
        }
    }


    // Remove a folder and its sub items
    removeFolder (folderPath) {
        if (!folderPath) return [];

        var removedPaths = [];
        let item = this.getItemFromPath(folderPath);

        folderPath += "/";

        if (item && item.isFolder) {
            document.querySelectorAll(".blob-tree-item").forEach(x => {
                let path = x.getAttribute("data-path");

                if (x.classList.contains("isFolder")) path += "/";

                if (path.indexOf(folderPath) === 0) {
                    x.parentNode.removeChild(x);
                    removedPaths.push(path);
                }
            });
        }

        return removedPaths;
    }

}


if (typeof module !== "undefined" && this.module !== module) {
    exports = module.exports = BlobTree;
}
