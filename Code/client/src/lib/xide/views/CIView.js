define([
    "dcl/dcl",
    'xide/views/CIViewMixin',
    'xide/_base/_Widget'
], function (dcl,CIViewMixin,_Widget) {
    return dcl([_Widget, CIViewMixin.dcl], {
        templateString:'<div class="CIView"></div>',
        data: null,
        widgets: null,
        delegate: null,
        helpNodes: null,
        store: null,
        groups: null,
        groupContainer: null,
        cssClass: 'CIView',
        options: null,
        tabContainerStyle: null,
        sortGroups: function (groups, groupMap) {
            groups = groups.sort(function (a, b) {
                if (a.name && b.name && groupMap[a.name] != null && groupMap[b.name] != null) {
                    var orderA = groupMap[a.name];
                    var orderB = groupMap[b.name];
                    return orderB - orderA;
                }
                return 100;
            });
            return groups;
        },
        getElements: function (data, group) {
            var res = [];

            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                if (obj.group === group) {
                    res.push(obj);
                }
            }
            return res;
        },
        startup: function () {
            if (this.cis) {
                this.startDfd = this.initWithCIS(this.cis);
            }
        }
    });
});