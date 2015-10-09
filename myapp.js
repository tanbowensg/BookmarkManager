var myapp = {}

myapp.saveData = function() {
    chrome.storage.local.set({
        'data': myapp.data
    })
}

myapp.loadData = function(callback) {
    chrome.storage.local.get("data", function(result) {
        myapp.data = result["data"]
        console.log(myapp.data)
        if (callback) {
            callback()
        }
    })
}

myapp.getCurrentTabUrl = function(callback) {
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

myapp.urlAnalysize = function(url) {
    var domain = url.split("/")[2]
    return domain
}

myapp.domainExist = function(domain) {
    var isExists = false
    for (var i in myapp.data) {
        if (myapp.data[i]["domain"] === domain) {
            isExists = i
            break
        }
    }
    return isExists
}

myapp.addURL = function(domain, title) {
    var tempData = {
        domain: domain,
        title: title,
        times: 1
    }
    myapp.data.push(tempData)
}

Array.prototype.shellSortBy = function(key) {
    function less(a, b) {
        if (a < b) {
            return true
        } else {
            return false
        }
    }

    function exch(a, i, j) {
        var t = a[i]
        a[i] = a[j]
        a[j] = t
    }
    var l = this.length
    var h = 128
    while (h < l / 2) h = 2 * h + 1
    while (h >= 1) {
        for (var i = h; i < l; i++) {
            for (var j = i; j >= h; j -= h) {
                if (!less(this[j][key], this[j - h][key])) {
                    exch(this, j, j - h)
                } else {
                    break
                }
            }
        }
        h = Math.floor(h / 2)
    }
    return this
}

myapp.clearData = function() {
        myapp.data = []
        chrome.storage.local.set({
            'data': []
        })
        chrome.extension.getBackgroundPage().window.myapp.data = [] //background里的也要清除掉
    }
    /**
     * [changeBookmarks description]
     * @param  {[type]} bm [已经排序好的bookmarks数组]
     * @return {[type]}    [description]
     */

myapp.changeBookmarks = function(bm) {
    var id
    var destination = {
        parentId: bm[0].parentId,
        index: 0
    }
    for (var i in bm) {
        destination.index = parseInt(i)
        if (!(bm[i].id === undefined)) {
            chrome.bookmarks.move(bm[i].id, destination)
        }
    }
}

myapp.getBookmarks = function(callback) { //异步
    chrome.bookmarks.getTree(function(tree) {
        myapp.bookmarks = tree
        if (callback) {
            callback(tree)
        }
    })
}

myapp.copyId = function(a, b) {
    a.id = b.id
    return b
}

/**
 * [updateBookmarks ]
 * @param  {[array]} r [这是本地记录的数组]
 * @param  {[array]} b [这是书签的数组]
 * @return {[type]}   [description]
 */
myapp.updateBookmarks = function(r) {
    var bm
    myapp.getBookmarks(function(bmTree) { //getbookmarks是异步函数
        bm = bmTree[0]['children'][0]['children']
        bm = myapp.bookmarksUrlToDomain(bm)
        bm = myapp.bookmarksAddTimes(bm, myapp.data)
        bm.shellSortBy('times')
        myapp.changeBookmarks(bm)
    })
}

myapp.bookmarksUrlToDomain = function(b) {
    for (var i in b) {
        // 有的可能是文件夹所以没有url所以要检测
        if (b[i].url) {
            b[i].url = myapp.urlAnalysize(b[i].url)
        }
    }
    return b
}

myapp.bookmarksAddTimes = function(b, r) {
    for (var i in b) {
        var robj = myapp.getBykey("domain", b[i].url, r)
        var theTimes = (robj === undefined ? 0 : robj.times)
        b[i].times = (theTimes === undefined ? 0 : theTimes)
    }
    return b
}

myapp.getBykey = function(key, val, obj) {
    for (var i in obj) {
        if (obj[i][key] === val) {
            return obj[i]
        }
    }
}

myapp.saveBackup = function() {
    myapp.getBookmarks(function(tree) { //getbookmarks是异步函数
        chrome.storage.local.set({
            'bmBackup': tree
        })
    })
}

myapp.restoreBackup = function() {
    var bm
    chrome.storage.local.get('bmBackup', function(result) {
        bm = result['bmBackup'][0]['children'][0]['children']
        bm = myapp.bookmarksUrlToDomain(bm)
        bm = myapp.bookmarksAddTimes(bm, myapp.data)
        myapp.changeBookmarks(bm)
    })
}

myapp.init = function() {
    myapp.loadData()
}

myapp.init()