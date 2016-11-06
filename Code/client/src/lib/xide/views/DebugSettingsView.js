define([
    "dojo/_base/declare",
    "xide/widgets/TemplatedWidgetBase",
    'xide/factory'
], function (declare, TemplatedWidgetBase, factory) {
    return declare("xide.views.DebugSettingsView", [TemplatedWidgetBase],
        {
            root: null,
            dst: null,
            src: null,
            delegate: null,
            selectButton: null,
            value: null,
            settings: {
                script: null,
                host: null,
                port: '9090',
                debug_port: '5858'
            },
            formEdits: {
                script: null,
                host: null,
                port: null,
                debug_port: null
            },
            templateString: "<div>" +
            "<div data-dojo-attach-point='root' data-dojo-type='dijit.layout.ContentPane'></div>" +
            "</div>",
            createEdit: function (label, value) {
                var editWidget = factory.createEditBox(
                    this.root.containerNode,
                    "",
                    label + ":",
                    value,
                    null,
                    this.delegate);

                editWidget.owner = this;
                return editWidget;

            },

            createWidgets: function () {
                this.formEdits.script = this.createEdit("Script Path", this.settings.script);
                this.formEdits.host = this.createEdit("Debugger server Host", this.settings.host);
                this.formEdits.port = this.createEdit("Debugger server Port", this.settings.port);
                this.formEdits.debug_port = this.createEdit("Debugger server Debug Port", this.settings.debug_port);
            },

            getValue: function () {
                this.settings.script = this.formEdits.script.get('value');
                this.settings.host = this.formEdits.host.get('value');
                this.settings.port = this.formEdits.port.get('value');
                this.settings.debug_port = this.formEdits.debug_port.get('value');
                return this.settings;
            },
            startup: function () {
                if (this._started) {
                    return;
                }
                this.inherited(arguments);
                if (this.settings) {
                    this.createWidgets();
                }
                this.formEdits.script.focus();
            }
        });
});
