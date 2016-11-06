var test = false;
if(false){
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'xide/types',
    "dgrid/OnDemandGrid",
    'xide/grid/_Base',
    "xide/views/GridView",
    "dgrid/extensions/DnD"
], function (declare, lang, types, OnDemandGrid, _Base, GridView, Dnd) {


    return declare("xide.views.ExpressionsGridView", [GridView],
        {
            cssClass: 'conditionalResponseGridView',
            onReloaded: function () {
                this.inherited(arguments);
                if (this.delegate) {
                    this.delegate.onReloaded();
                }
            },
            onShow: function () {
                this.inherited(arguments);
                this.publish(types.EVENTS.RESIZE);
            },
            onGridDataChanged: function (evt) {
            },
            createWidgets: function (store) {

                var thiz = this;
                var SharedDndGridSource = declare(Dnd.GridSource, {
                    copyState: function () {
                        return false; // never copy, only swap
                    },
                    onDropExternal: function (source, nodes, copy, targetItem) {

                    },
                    onDropInternal: function (source, nodes, copy, targetItem) {
                        console.log('on drop internal');
                    }
                });

                var baseClasses = [OnDemandGrid, _Base, Dnd];

                baseClasses = this.getGridBaseClasses(baseClasses, {
                    keyboardNavigation: true,
                    keyboardSelect: false,
                    selection: true
                });
                var _ctorArgs = {
                    sort: null,
                    dndConstructor: SharedDndGridSource, // use extension defined above
                    cellNavigation: false,
                    collection: store,
                    showHeader: false,
                    columns: [
                        {
                            label: "Name",
                            field: "name",
                            sortable: true
                        }
                    ]
                };

                if (this.gridParams) {
                    _ctorArgs = lang.mixin(_ctorArgs, this.gridParams);
                }
                var grid = new (declare(baseClasses))(_ctorArgs, this.containerNode);
                grid.refresh();
                this.grid = grid;
                this.onGridCreated(grid);
            },
            startup: function () {
                this.inherited(arguments);
                if (this.store) {
                    this.createWidgets(this.store);
                }
            }
        });
});
}