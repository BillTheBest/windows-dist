define([
    'dcl/dcl',
    'xide/views/CIViewMixin',
    'xide/layout/_TabContainer',
    'xide/layout/Container'
], function (dcl,CIViewMixin,_TabContainer,Container) {
    return dcl([Container, CIViewMixin.dcl], {
        declaredClass:"xide.views.CIGroupedSettingsView",
        style:"width: inherit;height: 100%;",
        currentWidget: null,
        allWidgets: null,
        cis: null,
        appStore: null,
        storeDelegate: null,
        storeItem: null,
        delegate: null,
        showAllTab: false,
        closable: true,
        tabContainerClass:_TabContainer,
        onShow:function(){
            this.inherited(arguments);
            if(this.tabContainer){
                _.each(this.tabContainer.getChildren(),function(pane){
                    pane.onShow();
                });
            }
        },
        startup: function () {
            try {
                if (this.cis) {
                    this.initWithCIS(this.cis);
                }
            } catch (e) {
                logError(e,'error rendering CIS ' + e);
            }
        }
    });
});