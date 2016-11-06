define([
    "dojo/_base/declare",
    'dojo/dom-class',
    'dijit/form/ToggleButton'
], function (declare, domClass, ToggleButton) {
    return declare("xide/widgets/ToggleButton", [ToggleButton], {
        currentItem: null,
        buttons: null,
        iconClass: '',
        title: 'title',
        disabled: false,
        iconNode: null,
        linkNode: null,
        _setCheckedAttr: function (value, priorityChange) {
            this.inherited(arguments);
            //this.checked = !value;//weird
            domClass.remove(this.iconNode, this.icon1);
            domClass.remove(this.iconNode, this.icon2);
            domClass.add(this.iconNode, value ? 'fa-toggle-on' : 'fa-toggle-off');
        },
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