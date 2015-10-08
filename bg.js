// var myapp={}

// myapp.saveData=function() {
//     chrome.storage.local.set({'data': myapp.data})
// }

// myapp.loadData=function(){
//     chrome.storage.local.get("data",function(result){
//         myapp.data=result["data"]
//         console.log(myapp.data)
//     })
// }

// myapp.getCurrentTabUrl=function (tabs,callback) {
//     // Query filter to be passed to chrome.tabs.query - see
//     // https://developer.chrome.com/extensions/tabs#method-query
//     var queryInfo = {
//         active: true,
//         currentWindow: true
//     };

//     chrome.tabs.query(queryInfo, function(tabs) {
//         // chrome.tabs.query invokes the callback with a list of tabs that match the
//         // query. When the popup is opened, there is certainly a window and at least
//         // one tab, so we can safely assume that |tabs| is a non-empty array.
//         // A window can only have one active tab at a time, so the array consists of
//         // exactly one tab.
//         var tab = tabs[0];

//         // A tab is a plain object that provides information about the tab.
//         // See https://developer.chrome.com/extensions/tabs#type-Tab
//         var url = tab.url;

//         // tab.url is only available if the "activeTab" permission is declared.
//         // If you want to see the URL of other tabs (e.g. after removing active:true
//         // from |queryInfo|), then the "tabs" permission is required to see their
//         // "url" properties.
//         console.assert(typeof url == 'string', 'tab.url should be a string');

//         callback(url);
//     });

//     // Most methods of the Chrome extension APIs are alocalhronous. This means that
//     // you CANNOT do something like this:
//     //
//     // var url;
//     // chrome.tabs.query(queryInfo, function(tabs) {
//     //     url = tabs[0].url;
//     // });
//     // alert(url); // Shows "undefined", because chrome.tabs.query is alocal.
// }

// myapp.urlAnalysize=function(url){
//     var domain=url.split("/")[2]
//     return domain
// }

// myapp.domainExist=function(domain){
//     var isExists=false
//     for (var i in myapp.data){
//         if(myapp.data[i]["domain"]===domain){
//             isExists=i
//             break
//         }
//     }
//     return isExists
// }

// myapp.addURL=function(domain){
//     var tempData={
//         domain:domain,
//         times:1
//     }
//     myapp.data.push(tempData)
// }

myapp.loadData()

chrome.webNavigation.onCompleted.addListener(function(details) {
    var url = details.url
    if(url==="about:blank"){
        return false
    }
    var domain = myapp.urlAnalysize(url)
    var domainNum = myapp.domainExist(domain)
    if (domainNum || domainNum === 0) {
        myapp.data[domainNum]["times"]++
    }
    else{
        myapp.addURL(domain)
    }
    myapp.saveData()
    console.log(domainNum)
    console.log(domain)
    console.log(myapp.data[domainNum]["times"])
})
