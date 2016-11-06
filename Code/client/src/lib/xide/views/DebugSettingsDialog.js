define([
    "dojo/_base/declare",
    "dojo/dom-style",
    './DebugSettingsView',
    'xide/views/ActionDialog'
], function (declare, domStyle, DebugSettingsView, ActionDialog) {
    return declare("xide.views.DebugSettingsDialog", [ActionDialog],
        {
            view: null,
            item: null,
            onResized: function () {
                this._resizeToContent();
                this.resize();
            },
            _createView: function (settings) {

                this.view = new DebugSettingsView({
                    className: 'debugSettingsView',
                    delegate: this,
                    ctx: this.ctx,
                    settings: settings
                }, dojo.doc.createElement('div'));

                this.containerNode.appendChild(this.view.domNode);
                this.view.startup();
            },
            initWithSettings: function (settings) {
                try {
                    this._createView(settings);
                } catch (e) {
                    console.error(e);
                }

                this.addActionButtons();

                domStyle.set(this.containerNode, {
                    height: 'inherit'
                });
                this.fixHeight();

                this.resize();
            },
            startup: function () {
                this.inherited(arguments);
                if (this.didLoad)
                    return;
                this.didLoad = true;
            }
        });
})
;