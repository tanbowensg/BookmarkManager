$(function(){
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

settings.readHistory=function(callback){
    chrome.history.search({
        text:'',
        startTime: new Date().getTime()-24*3600*1000*30,
        endTime:new Date().getTime(),
        maxResults:99999999,
        },function (history){
            settings.history=history
            if(callback){
                callback()
            }
        }
    )
}

settings.updateByHistory=function(){
    settings.readHistory(function(){
        for (var i in settings.history){
            url = myapp.urlToDomain(settings.history[i].url)
            myapp.updateData(url)
        }
        myapp.saveData('data')
    })
}

settings.renderIgnoreList = function() {
    var list = myapp.option.ignoreList
    for (var i = 0; i < list.length; i++) {
        makeIgnoreListRow(list[i])
    }
}

settings.renderAutoAddDelete = function() {
    var addCheck=$("#auto-add-checkbox")
    var addInput=$("#auto-add-input")
    var delCheck=$("#auto-delete-checkbox")
    var delInput=$("#auto-delete-input")
    var save=$("#save-option-button")

    addCheck.on("change",function(){
        addInput.prop("disabled",!addCheck.is(":checked"))
    })
    delCheck.on("change",function(){
        delInput.prop("disabled",!delCheck.is(":checked"))
    })

    addInput.val(myapp.option.autoAdd.limit)
    delInput.val(myapp.option.autoDelete.limit)

    addCheck.prop("checked",myapp.option.autoAdd.enable)
    delCheck.prop("checked",myapp.option.autoDelete.enable)

    save.on("click",function(){
        myapp.option.autoAdd={
            enable:addCheck.is(":checked"),
            limit:addInput.val()
        }
        myapp.option.autoDelete={
            enable:delCheck.is(":checked"),
            limit:delInput.val()
        }

        myapp.saveData("option")
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


myapp = new SmartBookmark()

myapp.init(function() {
    settings.renderIgnoreList()
    settings.renderAutoAddDelete()
    $("#ignore-list-add").click(settings.addToIgnoreList);
})
