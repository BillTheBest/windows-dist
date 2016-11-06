define([
    'dcl/dcl'
], function (dcl) {
    return dcl(null, {
        declaredClass: "xide.views.History",
        constructor: function () {
            this._history = [];
        },
        _history: null,
        _index: 0,
        destroy:function(){
            delete this._history;
        },
        set: function (data) {
            this._history = data;
            this._index = this.length();
        },
        pop: function () {
            this._history.pop();
            this._index = this.length();
        },
        push: function (cmd) {
            if (this._history.indexOf(cmd) == -1) {
                this._history.push(cmd);
                this._index = this.length();
            }
        },
        length: function () {
            if(this._history) {
                return this._history.length;
            }
        },
        getNext: function () {
            this._index += 1;
            var cmd = this._history[this._index] || "";
            this._index = Math.min(this.length(), this._index);
            return cmd;
        },
        getPrev: function () {
            this._index = Math.max(0, this._index - 1);
            return this._history[this._index];
        },
        remove:function(what){
            this._history && this._history.remove(what);
            this._index = Math.min(this.length(), this._index);
        },
        getNow: function () {
            var index = Math.max(0, this._index - 1);
            if(this._history) {
                return this._history[index];
            }
        },
        setNow: function (what) {
            if(this._history) {
                this._history.remove(what);
                this._history.push(what);
            }
        },
        indexOf:function(what){
            if(this._history) {
                return this._history.indexOf(what);
            }
            return -1;
        }
    });
});