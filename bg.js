chrome.webNavigation.onCompleted.addListener(function(details) {
    var url, title, domain, domainNum
        // 先判断frameId，只有当0的时候才是主窗口，其余的都是别的frame
    if (details.frameId === 0) {
        // 通过details里的tabId，拿到tab，再通过tab拿到title
        // chrome.tabs.get(details.tabId,function(tab){
        //     title=tab.title
        // })

        url = details.url

        if (url === "about:blank") {
            return false
        }

        domain = myapp.urlAnalysize(url)
        domainNum = myapp.domainExist(domain)

        if (domainNum || domainNum === 0) {
            myapp.data[domainNum]["times"]++
        } else {
            myapp.addURL(domain)
        }

        myapp.saveData()

        console.log(domain)
        console.log(myapp.data[domainNum]["times"])
    }
})