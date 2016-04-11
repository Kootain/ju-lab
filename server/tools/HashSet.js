'use strict';

function HashSet() {
    this._data = {};
    this._length = 0;
    this._DEFAULT = new Date();
}

HashSet.prototype.contains = function(val) {
        val = val.toString();
        return (!!this._data[val] && this._data.hasOwnProperty(val));
    };

    

HashSet.prototype.remove = function(val) {
    val = val.toString();
    if (!this.contains(val)) {
        return false;
    } else {
        delete this._data[val.toString()];
        this._length--;
        return true;
    }
};

HashSet.prototype.clear = function() {
    for ( var val in this._data) {
        if (this._data.hasOwnProperty(val)) {
            delete this._data[val];
        }
    }
    this._length = 0;
};

HashSet.prototype.isEmpty = function() {
    return (this._length === 0);
};

HashSet.prototype.size = function() {
    return this._length;
};

HashSet.prototype.toArray = function() {
    this._data.length = this._length;
    var arr = Array.prototype.slice.call(this._data);
    delete this._data.length;
    return arr;
};

HashSet.prototype.add = function(val) {
    if (!this.contains(val.toString())) {
        this._length++;
    }
    this._data[val.toString()] = val;
};

module.exports = HashSet;