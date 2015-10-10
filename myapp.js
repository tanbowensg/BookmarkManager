BookmarkManager = function() {}

BookmarkManager.prototype.saveData = function(key) {
    var obj = {}
    obj[key] = this[key]
    chrome.storage.local.set(obj)
}

BookmarkManager.prototype.loadData = function(key, callback) {
    var that = this
    chrome.storage.local.get(key, function(result) {
        that[key] = result[key]
        if (callback) {
            callback()
        }
    })
}

BookmarkManager.prototype.getCurrentTabUrl = function(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });

    // Most methods of the Chrome extension APIs are alocalhronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //     url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is alocal.
}

BookmarkManager.prototype.urlAnalysize = function(url) {
    var domain = url.split("/")[2]
    return domain
}

BookmarkManager.prototype.addURL = function(domain, title) {

    var tempData = {
        domain: domain,
        title: title,
        times: 1,
        ignore: false
    }
    this.data.push(tempData)
}

BookmarkManager.prototype.clearData = function() {
        this.data = []
        chrome.storage.local.set({
            'data': []
        })
        chrome.extension.getBackgroundPage().window.this.data = [] //background里的也要清除掉
    }
    /**
     * [changeBookmarks description]
     * @param  {[type]} bm [已经排序好的bookmarks数组]
     * @return {[type]}    [description]
     */

BookmarkManager.prototype.changeBookmarks = function(bm) {
    var destination = {
        parentId: bm[0].parentId,
        index: 0
    }
    for (var i in bm) {
        destination.index = parseInt(i)
        if (bm[i].id !== undefined && (!this.option.bmUpdateIgnore || !bm[i].ignore)) {
            chrome.bookmarks.move(bm[i].id, destination)
        }
    }
}

BookmarkManager.prototype.getBookmarks = function(callback) { //异步
    var that = this
    chrome.bookmarks.getTree(function(tree) {
        that.bookmarks = tree
        if (callback) {
            callback(tree)
        }
    })
}

/**
 * [updateBookmarks ]
 * @param  {[array]} r [这是本地记录的数组]
 * @param  {[array]} b [这是书签的数组]
 * @return {[type]}   [description]
 */
BookmarkManager.prototype.updateBookmarks = function(r) {
    var bm
    var that = this
    that.getBookmarks(function(bmTree) { //getbookmarks是异步函数
        bm = bmTree[0]['children'][0]['children']
        bm = that.bookmarksUrlToDomain(bm)
        bm = that.bookmarksAddTimes(bm, that.data)
        bm = that.bookmarksAddIgnore(bm, that.data)
        bm.shellSortBy('times')
        that.changeBookmarks(bm)
    })
}

// this.deleteIgnore=function(bm){
//     for(var i in this.option.ignoreList){
//         bm.deleteIgnore(this.option.ignoreList[i])
//     }
//     return bm
// }

BookmarkManager.prototype.bookmarksUrlToDomain = function(b) {
    for (var i in b) {
        // 有的可能是文件夹所以没有url所以要检测
        if (b[i].url) {
            b[i].url = this.urlAnalysize(b[i].url)
        }
    }
    return b
}

BookmarkManager.prototype.bookmarksAddTimes = function(b, r) {
    for (var i in b) {
        var robj = this.getBykey("domain", b[i].url, r)
        var theTimes = (robj === undefined ? 0 : robj.times)
        b[i].times = (theTimes === undefined ? 0 : theTimes)
    }
    return b
}

BookmarkManager.prototype.bookmarksAddIgnore = function(b, r) {
    for (var i in b) {
        var robj = this.getBykey("domain", b[i].url, r)
        var theIgnore = (robj === undefined ? false : robj.ignore)
        b[i].ignore = (theIgnore === undefined ? false : theIgnore)
    }
    return b
}

BookmarkManager.prototype.getBykey = function(key, val, obj) {
    for (var i in obj) {
        if (obj[i][key] === val) {
            return obj[i]
        }
    }
}

BookmarkManager.prototype.saveBackup = function() {
    this.getBookmarks(function(tree) { //getbookmarks是异步函数
        chrome.storage.local.set({
            'bmBackup': tree
        })
    })
}

BookmarkManager.prototype.restoreBackup = function() {
    var bm
    var that = this
    chrome.storage.local.get('bmBackup', function(result) {
        bm = result['bmBackup'][0]['children'][0]['children']
        bm = that.bookmarksUrlToDomain(bm)
        bm = that.bookmarksAddTimes(bm, that.data)
        that.changeBookmarks(bm)
    })
}

BookmarkManager.prototype.updateIgnoreList = function(url, ignore) {
    for (var i in this.data) {
        if (this.data[i].domain === url) {
            this.data[i].ignore = ignore
            break
        }
    }
    //同步bg里的ignoreList
    chrome.extension.getBackgroundPage().window.myapp.option.ignoreList = myapp.option.ignoreList
    this.saveData('data')
    this.saveData('option')
}

BookmarkManager.prototype.addToIgnore = function(url) {
    if (!this.option.ignoreList.hasValue(url)) {
        this.option.ignoreList.push(url)
    }
    this.updateIgnoreList(url, true)
}

BookmarkManager.prototype.removeFromIgnore = function(url) {
    this.option.ignoreList.deleteByValue(url)
    this.updateIgnoreList(url, false)
}

BookmarkManager.prototype.deleteRecord = function(domain) {
    var index = this.hasDomain(domain)
    if (index || index === 0) {
        this.data.split(0, index)
        this.saveData('data')
    }
}

BookmarkManager.prototype.hasDomain = function(domain) {
    for (var i in this.data) {
        if (this.data[i]["domain"] === domain) {
            return i
        }
    }
    return false
}

BookmarkManager.prototype.init = function(callback) {
    var that = this
    that.loadData('data', function() {
        if (that.data === undefined) {
            that.data = []
        }
    })
    that.loadData('option', function() {
        if (that.option === undefined) {
            that.option = {
                bmUpdateIgnore: true,
                ignoreList: []
            }
        }
        if (callback) {
            callback()
            console.log(that.data)
        }
    })
}

myapp = new BookmarkManager()