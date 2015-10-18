$(function() {
    $('#tab-nav a:first').tab('show')
})

var settings = {}

function makeIgnoreListRow(text) {
    var li = $('<li/>').addClass('ignore-list-li')
    var span = $('<span/>').addClass('ignore-list-url')
    var remove = $('<i>').addClass("ignore-list-remove glyphicon glyphicon-remove")

    span.text(text)

    remove.click(settings.removeFromIgnoreList)

    li.append(remove).append(span).appendTo($('#ignore-list-ul'))
}

function showSuccess(text){
    var html='<div class="alert alert-success fade" id="alert" role="alert">'+
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>'
          +text+'</div>'
    $(html).insertBefore('#tab-nav').addClass('in')
}

settings.readHistory = function(day, callback) {
    chrome.history.search({
        text: '',
        startTime: new Date().getTime() - 24 * 3600 * 1000 * day,
        endTime: new Date().getTime(),
        maxResults: 99999999,
    }, function(history) {
        settings.history = history
        if (callback) {
            callback()
        }
    })
}

settings.updateByHistory = function(day) {
    myapp.clearData('data')
    settings.readHistory(day, function() {
        for (var i in settings.history) {
            myapp.updateData(settings.history[i].url,settings.history[i].title)
        }
        myapp.saveData('data')
        showSuccess("导入成功！")
    })
}

settings.renderIgnoreList = function() {
    var list = myapp.option.ignoreList
    for (var i = 0; i < list.length; i++) {
        makeIgnoreListRow(list[i])
    }
}

settings.renderAutoAddDelete = function() {
    var addCheck = $("#auto-add-checkbox")
    var addInput = $("#auto-add-input")
    var delCheck = $("#auto-delete-checkbox")
    var delInput = $("#auto-delete-input")
    var save = $("#save-option-button")

    addCheck.on("change", function() {
        addInput.prop("disabled", !addCheck.is(":checked"))
    })
    delCheck.on("change", function() {
        delInput.prop("disabled", !delCheck.is(":checked"))
    })

    addInput.val(myapp.option.autoAdd.limit)
    delInput.val(myapp.option.autoDelete.limit)

    addCheck.prop("checked", myapp.option.autoAdd.enable)
    delCheck.prop("checked", myapp.option.autoDelete.enable)

    save.on("click", function() {
        myapp.option.autoAdd = {
            enable: addCheck.is(":checked"),
            limit: addInput.val()
        }
        myapp.option.autoDelete = {
            enable: delCheck.is(":checked"),
            limit: delInput.val()
        }

        myapp.saveData("option")
        showSuccess("保存成功！")
    })
}

settings.addToIgnoreList = function() {
    var input = $("#ignore-list-input")
    var url = input.val()
    myapp.addToIgnore(url)
    input.val('')
    makeIgnoreListRow(url)
}

settings.removeFromIgnoreList = function() {
    var url = $(this).siblings('.ignore-list-url').text()
    myapp.removeFromIgnore(url)
    $(this).parent().hide().remove()
}

settings.setDisplayLimit = function(limit) {
    myapp.option.displayLimit = limit
    myapp.saveData("option")
}


myapp = new SmartBookmark()

myapp.init(function() {
    settings.renderIgnoreList()
    settings.renderAutoAddDelete()

    $("#ignore-list-add").click(settings.addToIgnoreList)

    $("#load-history-button").click(function(event) {
        var day = $("#load-history-day").val()
        settings.updateByHistory(day)
    });

    $("#last-backup-time").text(myapp.bmBackup[1])

    $("#save-backup-button").click(function() {
        myapp.saveBackup(function() {
            $("#last-backup-time").text(myapp.bmBackup[1])
            showSuccess("备份成功！")
        })
    })

    $("#restore-backup-button").click(function() {
        myapp.restoreBackup(function(){
            showSuccess("恢复成功！")
        })
    })

    $("#display-limit-save").click(function() {
        var limit = $("#display-limit-input").val()
        settings.setDisplayLimit(limit)
        showSuccess("设置成功！")
    });

    $("#display-limit-input").val(myapp.option.displayLimit)

    $("#clear-all-button").click(function() {
        myapp.clearData('data')
        showSuccess("记录清空完毕！")
    });
})