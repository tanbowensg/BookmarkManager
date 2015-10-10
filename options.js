$(function() {
	var settings = {}

	function makeIgnoreListRow(text) {
		var li = $('<li/>').addClass('ignore-list-li')
		var span = $('<span/>').addClass('ignore-list-url')
		var remove = $('<span>').addClass('ignore-list-remove').text("删除")

		span.text(text)

		remove.click(settings.removeFromIgnoreList)

		li.append(span).append(remove).appendTo($('#ignore-list-ul'))
	}

	settings.renderIgnoreList = function() {
		var list = myapp.option.ignoreList
		for (var i = 0; i < list.length; i++) {
			makeIgnoreListRow(list[i])
		}
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
		$(this).parent().remove()
	}

	$("#ignore-list-add").click(settings.addToIgnoreList);

	myapp.init(function() {
		settings.renderIgnoreList()
	})
})