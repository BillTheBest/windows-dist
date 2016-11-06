/** @module xgrid/Base **/
define([
    "xdojo/declare"
], function (declare) {
    function createTabContainerClass(baseClass) {
        return declare(null, {
            getTab: function (name) {
                return _.find(this._widgets, {
                    title: name
                });
            },
            _unselectAll: function () {
                _.each(this._widgets, function (tab) {
                    tab.unselect();
                });
            },
            selectChild: function (mixed) {
                if (mixed) {
                    if (_.isString(mixed)) {
                        var tab = this.getTab(mixed);
                        if (tab && tab.select) {
                            this._unselectAll();
                            tab.select();
                        }
                    } else {
                        console.error('selectChild : not a string');
                    }
                } else {
                    console.error('selectChild : mixed = null');
                }
            }
        });
    }
    return createTabContainerClass();
});