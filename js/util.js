Array.prototype.shellSortBy = function(key) {
    function more(a, b) {
        if (a > b) {
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
                if (more(this[j][key], this[j - h][key])) {
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

Array.prototype.deleteByValue=function(val){
    for (var i in this){
        if(this[i]===val){
            this.splice(i,1)
            break
        }
    }
}

Array.prototype.hasValue=function(val){
    for (var i in this){
        if(this[i]===val){
            return i
        }
    }
    return false
}

Array.prototype.getObjHasKey=function(key){
    for (var i in this){
        if(this[i].hasOwnProperty(key)){
            return i
        }
    }
    return false
}
/**
 * [getFrequency 在一个数组中获得出现频率最高的值]
 * @return {[type]} [description]
 */
Array.prototype.getFrequency=function(){
    this.sort()
    var count=0
    var max={
        val:0,
        num:0
    }
    for (var i =1;i<this.length;i++){
        if(this[i]===""){
            continue
        }
        if(this[i]===this[i-1]){
            count++
            if(max.num<count){
                max.num=count
                max.val=this[i]
            }
        }
        else{
            count=1
        }
    }
    return max.val+"出现了"+max.num+"次"
}