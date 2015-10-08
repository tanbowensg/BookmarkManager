document.addEventListener('DOMContentLoaded', function() {
    myapp.loadData(function(){
        var fragment=document.createDocumentFragment()
        for(var i in myapp.data){
            var span=document.createElement("span")
            span.innerHTML=myapp.data[i].domain+'点击了'+myapp.data[i].times+'次</br>'
            fragment.appendChild(span)
        }
        document.body.appendChild(fragment)
    })
})