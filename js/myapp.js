SmartBookmark = function() {}
    /*-----------------------------操作storage相关的方法--------------------------------------*/
    /**
     * [saveData 把SmartBookmark[key]保存到storage中]
     * @param  {[String]} key [键名：如data,option]
     * @return {[null]}     [description]
     */
SmartBookmark.prototype.saveData = function(key) {
        var that = this
        var obj = {}
        obj[key] = this[key]
        chrome.storage.local.set(obj, function() {
            chrome.extension.getBackgroundPage().window.myapp[key] = that[key]
        })
    }
    /**
     * [loadData 从storage中提取key,保存到SmartBookmark[key]]
     * @param  {[String]}   key      [如:data,option]
     * @param  {Function} callback [异步函数，所以要回调]
     * @return {[null]}            [description]
     */
SmartBookmark.prototype.loadData = function(key, callback) {
        var that = this
        chrome.storage.local.get(key, function(result) {
            that[key] = result[key]
            if (callback) {
                callback()
            }
        })
    }
    /**
     * [clearData 清空SmartBookmark.key[key],storage[key],bg]
     * @return {[null]} [description]
     */
SmartBookmark.prototype.clearData = function(key) {
    this[key] = []
    var obj = {}
    obj[key] = []
    chrome.storage.local.set(obj)
    chrome.extension.getBackgroundPage().window.myapp.data = [] //background里的也要清除掉
}

/*---------------------------End操作storage相关的方法End--------------------------------------*/

/*--------------------------------bg模块、操作URL相关的方法-------------------------------------------*/

/**
 * [getCurrentTabUrl 获得当前tab的url]
 * @param  {Function} callback [异步，需要回调，callback()]
 * @return {[null]}            [description]
 */
SmartBookmark.prototype.getCurrentTabUrl = function(callback) {
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

/**
 * [updateData description]
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
SmartBookmark.prototype.updateData = function(url,title) {
        if (url === "about:blank") {
            return false
        }

        domain = myapp.urlToDomain(url)
        domainNum = myapp.hasDomain(domain)

        if (domainNum || domainNum === 0) {
            myapp.data[domainNum]["times"]++
            myapp.data[domainNum].titleArray.push(title)
        } else {
            myapp.addDomain(domain,title)
        }
    }
    /**
     * [urlToDomain 把复杂的url变成纯域名]
     * @param  {[String]} url [url]
     * @return {[String]} domain [纯域名]
     */
SmartBookmark.prototype.urlToDomain = function(url) {
        if (url === undefined) {
            console.log('有一个url是undefined')
            return 'about:blank'
        }
        var domain = url.split("/")[2]
        if (domain === undefined) {
            if (url.match("^.+\\.+")) { //TODO:这个正则表达式还有问题，以后再再说
                return url
            }
        }
        return domain
    }
    /**
     * [addDomain 根据domain新建一个对象，添加到SmartBookmark.data中]
     * @param {[String]} domain [domain]
     * @param {[String]} title  [title]
     */
SmartBookmark.prototype.addDomain = function(domain, title) {
        var tempData = {
            domain: domain,
            title: title,
            times: 1,
            ignore: false,
            titleArray:[]
        }
        this.data.push(tempData)
    }
    /*--------------------------End操作URL相关的方法End--------------------------------------*/

/*--------------------------------更新书签模块的方法-----------------------------------------*/
/**
 * [updateBookmarks 更新书签模块的主要方法，暂时不用了]
 * @return {[null]}   [description]
 */
SmartBookmark.prototype.updateBookmarks = function() {
    var bm
    var that = this
    that.getBookmarks(function(bmTree) { //getbookmarks是异步函数
        bm = bmTree[0]['children'][0]['children']
        bm = that.bmUrlToDomain(bm)
        bm = that.bmAddTimes(bm)
        bm = that.bmAddIgnore(bm)
        bm.shellSortBy('times')
        that.changeBookmarks(bm)
    })
}

/**
 * [updateBookmarks 更新书签模块的主要方法，是以data为基础的]
 * @return {[null]}   [description]
 */
SmartBookmark.prototype.updateBookmarksByData = function() {
    var bm
    var that = this
    that.getBookmarks(function(bmTree) { //getbookmarks是异步函数
        bm = bmTree[0]['children'][0]['children']
        bm = that.bmUrlToDomain(bm)
        for(var i in myapp.data){
            var index=that.getBykey("domain",myapp.data[i].domain,bm)
            if (index){
                myapp.data[i].parentId=index.parentId
                myapp.data[i].id=index.id
                myapp.data[i].title=index.title
            }
        }
        myapp.data.shellSortBy('times')
        that.changeBookmarks(myapp.data)
    })
}

/**
 * [changeBookmarks description]
 * @param  {[type]} bm [已经排序好的bookmarks数组,其中只包括需要重新排序的书签，
 * 书签对象还必须有id和parentid]
 * @return {[type]}    [description]
 */
SmartBookmark.prototype.changeBookmarks = function(bm) {
    var destination 
    var count=0

    // 先执行ignorelist
    if(this.option.bmUpdateIgnore){
        this.deleteIgnore(bm)
    }

    for (var i=0;i<bm.length;i++) {

        if (bm[i].id !== undefined &&bm[i].domain!==undefined) { 
            destination={
                index : count,
                parentId: bm[i].parentId,
            }
            chrome.bookmarks.move(bm[i].id, destination)
            count++
        }
        else if(bm[i].id===undefined){//自动添加新书签
            destination={
                index : count,
                parentId:"1",
                title:bm[i].title,
                url:"http://"+bm[i].domain//这里必须加上http，否则会报错Invalid　URL
            }
            chrome.bookmarks.create(destination)
            count++
        }
    }
}

/**
 * [getBookmarks 获得当前的书签的bookmark对象]
 * @param  {Function} callback [异步，要回调]
 * @return {[null]}            [description]
 */
SmartBookmark.prototype.getBookmarks = function(callback) { //异步
    var that = this
    chrome.bookmarks.getTree(function(tree) {
        that.bookmarks = tree
        if (callback) {
            callback(tree)
        }
    })
}

/*--------------------------End更新书签模块的方法End--------------------------------------*/

/*--------------------------装饰BookMark对象的方法--------------------------------------*/
// 这里的方法都是用来装饰BookMark对象的，为了调用方便起见，统一以bookmark对象为参数，返回bookmark对象
//TODO:这里的装饰函数每个都要循环bm，可以优化一下
/**
 * [bmUrlToDomain 把bm数组里的每个对象的url都变成domain]
 * @param  {[Array]} bm [description]
 * @return {[Array]}    [description]
 */
SmartBookmark.prototype.bmUrlToDomain = function(bm) {
        for (var i in bm) {
            // 有的可能是文件夹所以没有url所以要检测
            if (bm[i].url) {
                bm[i].domain = this.urlToDomain(bm[i].url) //TODO：如果用了装饰模式那这个函数显然就不用了
            }
        }
        return bm
    }
    /**
     * [bmAddTimes 根据data里的times给每个bm里的对应的书签添加times属性]
     * @param  {[Array]} bm [description]
     * @return {[Array]}    [description]
     */
SmartBookmark.prototype.bmAddTimes = function(bm) {
        for (var i in bm) {
            var robj = this.getBykey("domain", bm[i].domain, this.data)
            var theTimes = (robj === undefined ? 0 : robj.times)
            bm[i].times = (theTimes === undefined ? 0 : theTimes)
        }
        return bm
    }
    /**
     * [bmAddIgnore 给在ignorelist里的bm对象添加ignore=true的属性，而不是直接删除]
     * @param  {[Array]} bm [description]
     * @return {[Array]}   [description]
     */
SmartBookmark.prototype.bmAddIgnore = function(bm) {
    for (var i in bm) {
        var robj = this.getBykey("domain", bm[i].domain, this.data)
        var theIgnore = (robj === undefined ? false : robj.ignore)
        bm[i].ignore = (theIgnore === undefined ? false : theIgnore)
    }
    return bm
}

/**
 * [deleteIgnore 删除掉在ignoreList里的书签对象 ]
 * @param  {[Array]} bm [bm]
 * @return {[Array]}    [description]
 */
//TODO:这个函数未完成
SmartBookmark.prototype.deleteIgnore = function(bm) {
    for (var i in this.option.ignoreList) {
        if(this.option.ignoreList.hasOwnProperty(i)){
            var index=bm.getIndexByVal('domain',this.option.ignoreList[i])
            if(index){
                bm.splice(index,1)
            }
        }
    }
    return bm
}


/*--------------------------End装饰BookMark对象的方法End--------------------------------------*/
/**
 * [getBykey 在一个对象中，根据key和val寻找一个对象]
 * @param  {[String]} key [键]
 * @param  {[type]} val [值]
 * @param  {[Object]} obj [对象]
 * @return {[Object]}     [description]
 */
SmartBookmark.prototype.getBykey = function(key, val, obj) {
    for (var i in obj) {
        if (obj[i][key] === val) {
            return obj[i]
        }
    }
    return false
}

/*-------------------------------------备份的方法--------------------------------------------*/
/**
 * [saveBackup 保存bm备份到storage.bmBackup]
 * @param  {Function} callback [异步函数，所以要回调]
 */
SmartBookmark.prototype.saveBackup = function(callback) {
        var that = this
        that.getBookmarks(function(tree) { //getbookmarks是异步函数
            var d = new Date()
            tree[1] = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
            chrome.storage.local.set({
                'bmBackup': tree
            })
            that.bmBackup = tree
            if (callback) {
                callback()
            }
        })
    }
    /**
     * [restoreBackup 根据storage.bmBackup恢复书签]
     */
SmartBookmark.prototype.restoreBackup = function() {
        var bm
        var that = this
        chrome.storage.local.get('bmBackup', function(result) {
            bm = result['bmBackup'][0]['children'][0]['children']
            bm = that.bmUrlToDomain(bm)
            bm = that.bmAddTimes(bm, that.data)
            that.changeBookmarks(bm)
        })
    }
    /*----------------------------------end备份的方法end-----------------------------------------*/
    /*------------------------------------排除列表的方法-----------------------------------------*/
    /**
     * [addToIgnore 吧url加入猎表]
     * @param {[String]} url [description]
     */
SmartBookmark.prototype.addToIgnore = function(url) {
        if (!this.option.ignoreList.hasValue(url)) {
            this.option.ignoreList.push(url)
        }
        this.updateIgnoreList(url, true)
    }
    /**
     * [removeFromIgnore 吧url从列表中删除]
     * @param  {[String]} url [description]
     */
SmartBookmark.prototype.removeFromIgnore = function(url) {
        this.option.ignoreList.deleteByValue(url)
        this.updateIgnoreList(url, false)
    }
    /**
     * [updateIgnoreList 根据url和ignore，更新一个url到忽视列表，并同步到bg和storage，一般不单独调用]
     * @param  {[String]} url    [description]
     * @param  {[bool]} ignore [description]
     */
SmartBookmark.prototype.updateIgnoreList = function(url, ignore) {
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

/*----------------------------------end排除列表的方法end-----------------------------------------*/

SmartBookmark.prototype.deleteRecord = function(domain) {
    var index = this.hasDomain(domain)
    if (index || index === 0) {
        this.data.splice(index, 1)
        this.saveData('data')
    }
}

SmartBookmark.prototype.hasDomain = function(domain) {
    if (domain === undefined) {
        return false
    }
    for (var i in this.data) {
        if (this.data[i]["domain"] === domain) {
            return i
        }
    }
    return false
}

SmartBookmark.prototype.init = function(callback) {
    var that = this
    that.loadData('data', function() {
        if (that.data === undefined) {
            that.data = []
        }
    })
    that.loadData('bmBackup', function() {
        if (that.bmBackup === undefined) {
            that.bmBackup = []
            that.bmBackup[1] = "目前还没有备份"
        }
    })
    that.loadData('option', function() {
        if (that.option === undefined) {
            that.option = {
                bmUpdateIgnore: true,
                ignoreList: [],
                displayLimit: 20
            }
        }
        if (callback) {
            callback()
            console.log(that.data)
        }
    })
}