define([
    "dojo/_base/declare",
    'xide/mixins/EventedMixin',
    'xide/views/TitlePane'
],function (declare, EventedMixin,TitlePane){
        /**
         *  Special version of title pane which allows additional action buttons with the title bar
         */
        return declare("xide.widgets.ActionTogglePane", [TitlePane,EventedMixin],{

        });
});