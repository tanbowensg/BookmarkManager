document.addEventListener('DOMContentLoaded', renderAll)

function renderAll() {
    render()

    var updateButton = document.getElementById("update")
    updateButton.addEventListener("click", function() {
        myapp.updateBookmarksByData()
    })

    // var saveBackupButton = document.getElementById("savebackup")
    // saveBackupButton.addEventListener("click", function() {
    //     myapp.saveBackup()
    // })

    // var restoreBackupButton = document.getElementById("restorebackup")
    // restoreBackupButton.addEventListener("click", function() {
    //     myapp.restoreBackup()
    // })

    // var clearButton = document.getElementById("clear")
    // clearButton.addEventListener("click", function() {
    //     myapp.clearData('data')
    //     render()
    // })

    function render() {
        myapp.loadData('data', function() {
            myapp.data.shellSortBy('times')
            var fragment = document.createDocumentFragment()
            for (var i = 0; i < myapp.data.length && i <= myapp.option.displayLimit - 1; i++) {
                if (myapp.data.hasOwnProperty(i) && myapp.data[i].ignore !== true) {
                    var li = document.createElement("li")
                    var rank = document.createElement("span")
                    var url = document.createElement("span")
                    var num = document.createElement("span")
                    var remove = document.createElement("i")
                    rank.className = 'rank'
                    li.className = 'row'
                    url.className = 'url'
                    num.className = 'num'
                    remove.className = 'remove glyphicon glyphicon-remove'
                    rank.innerHTML = parseInt(i) + 1
                    url.innerHTML = myapp.data[i].domain
                    num.innerHTML = myapp.data[i].times
                    li.appendChild(rank)
                    li.appendChild(url)
                    li.appendChild(num)
                    li.appendChild(remove)
                    fragment.appendChild(li)
                }
            }
            document.getElementById("list").appendChild(fragment)

            $(".remove").on("click", function() {
                var domain = $(this).siblings('.url').text()
                myapp.deleteRecord(domain)
                $(this).parent().hide(300)
                $(".row").remove()
                render()
            })
        })
    }
}


myapp = new SmartBookmark()
myapp.init(function(){
    $("#option").click(function(){
        chrome.tabs.create({ url: "options.html" });
    })
})