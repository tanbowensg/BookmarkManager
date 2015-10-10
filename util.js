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