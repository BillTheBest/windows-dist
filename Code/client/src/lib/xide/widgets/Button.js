/*
define([
    "dojo/_base/declare",
    'dojo/dom-class',
    'dijit/form/Button',
    './_CSSMixin'
], function (declare, domClass, Button, CSSMixin) {

    return declare("xide.widgets.Button", [Button, CSSMixin], {

        currentItem: null,
        buttons: null,
        iconClass: '',
        title: 'title',
        disabled: false,
        iconNode: null,
        linkNode: null,
        setDisabled: function (disabled) {
            this.set('disabled', disabled);
        },
        startup: function () {
            this.inherited(arguments);
            domClass.remove(this.iconNode, 'dijitReset');
            this.setDisabled(this.disabled);
        }
    });

});
*/