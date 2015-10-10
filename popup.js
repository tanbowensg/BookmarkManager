myapp.init()

document.addEventListener('DOMContentLoaded', function() {

    render()

    var updateButton = document.getElementById("update")
    updateButton.addEventListener("click", function() {
        myapp.updateBookmarks()
    })

    var saveBackupButton = document.getElementById("savebackup")
    saveBackupButton.addEventListener("click", function() {
        myapp.saveBackup()
    })

    var restoreBackupButton = document.getElementById("restorebackup")
    restoreBackupButton.addEventListener("click", function() {
        myapp.restoreBackup()
    })

    var clearButton = document.getElementById("clear")
    clearButton.addEventListener("click", function() {
        myapp.clearData()
        render()
    })


    function render() {
        myapp.loadData('data',function() {
            myapp.data.shellSortBy('times')
            var fragment = document.createDocumentFragment()
            for (var i in myapp.data) {
                if (myapp.data.hasOwnProperty(i)&&myapp.data[i].ignore!==true) {
                    var li = document.createElement("li")
                    var url = document.createElement("span")
                    var num = document.createElement("span")
                    li.className = 'row'
                    url.className = 'url'
                    num.className = 'num'
                    url.innerHTML = myapp.data[i].domain
                    num.innerHTML = myapp.data[i].times
                    li.appendChild(url)
                    li.appendChild(num)
                    fragment.appendChild(li)
                }
            }
            document.getElementById("list").appendChild(fragment)
        })
    }
})

