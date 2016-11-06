define([
    'dcl/dcl',
    "dojo/_base/declare",
    "dojo/_base/lang",
    'dojo/_base/connect',
    "xide/widgets/WidgetBase",
    "xide/widgets/FlagsWidget",
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xide/views/CIActionDialog',
    'xide/form/Select'
], function (dcl,declare, lang, connect, WidgetBase, FlagsWidget, factory, utils, types, CIActionDialog, Select) {
    return dcl(WidgetBase, {
        declaredClass:"xide.widgets.Reference",
        wContentSelectorButton: null,
        widgetMode: null,
        lastUploadedFileName: null,
        modeNode: null,
        oriPath: null,
        minHeight: "400px;",
        value: "",
        options: null,
        mode: types.WIDGET_REFERENCE_MODE.BY_ID,
        flagsWidget: null,
        filterFlags: 16,
        pickFilterNode: null,
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
        "<td width='15%' class='widgetTitle'><span><b>${!title}</b><span></td>" +
        "<td width='100px' class='widgetValue2' valign='middle' attachTo='previewNode'></td>" +
        "<td class='extension' width='25px' attachTo='button0'></td>" +
        "<td class='extension' width='25px' attachTo='button1'></td>" +
        "<td class='extension' width='25px' attachTo='button2'></td>" +
        "</tr>" +


        "<tr attachTo='extensionRoot2'>" +

        "<td width='15%' class='widgetTitle'><span><b>Pick Filter</b><span></td>" +

        "<td width='100px' class='widgetValue2' valign='middle' attachTo='pickFilterNode'></td>" +
        "<td class='extension' width='25px' attachTo='button0'></td>" +
        "<td class='extension' width='25px' attachTo='button1'></td>" +
        "<td class='extension' width='25px' attachTo='button2'></td>" +
        "</tr>" +

        "<tr attachTo='extensionRoot2'>" +

        "<td width='15%' class='widgetTitle'><span><b>Mode</b><span></td>" +

        "<td width='100px' class='widgetValue2' valign='middle' attachTo='modeNode'></td>" +
        "<td class='extension' width='25px' attachTo='button0'></td>" +
        "<td class='extension' width='25px' attachTo='button1'></td>" +
        "<td class='extension' width='25px' attachTo='button2'></td>" +
        "</tr>" +

        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        filePathValidator: function (value, constraints) {
            return true;
        },
        postMixInProperties: function () {

            if (this.userData && this.userData.title) {
                this.title = this.userData.title;
            }
            if ((this.userData && this.userData.vertical === true) || this.vertical === true) {

                this.templateString = "<div class='widgetContainer widgetBorder widgetTable' style=''>" +

                    "<table border='0' cellpadding='5px' width='100%' >" +
                    "<tbody>" +

                    "<tr attachTo='extensionRoot'>" +
                    "<td width='100%' class='widgetTitle'><span><b>${!title}</b><span></td>" +
                    "</tr>" +

                    "<tr attachTo='extensionRoot'>" +
                    "<td width='100px' class='widgetValue2' valign='middle' attachTo='previewNode'></td>" +
                    "<td class='extension' width='25px' attachTo='button0'></td>" +
                    "<td class='extension' width='25px' attachTo='button1'></td>" +
                    "<td class='extension' width='25px' attachTo='button2'></td>" +
                    "</tr>" +

                    "<tr attachTo='extensionRoot'>" +
                    "<td width='100%' class='widgetTitle'><span><b>Pick Filter</b><span></td>" +
                    "</tr>" +

                    "<tr attachTo='extensionRoot2'>" +
                    "<td width='100px' class='widgetValue2' valign='middle' attachTo='pickFilterNode'></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "</tr>" +

                    "<tr attachTo='extensionRoot'>" +
                    "<td width='100%' class='widgetTitle'><span><b>Mode</b><span></td>" +
                    "</tr>" +

                    "<tr attachTo='extensionRoot2'>" +
                    "<td width='100px' class='widgetValue2' valign='middle' attachTo='modeNode'></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "<td class='extension' width='25px' ></td>" +
                    "</tr>" +


                    "</tbody>" +
                    "</table>" +
                    "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
                    "<div attachTo='last'></div>" +
                    "</div>"
            }

        },
        onFileSelected: function (path) {
            this.editBox.set('value', path);
            this.value = path;
            this.setValue(path);
        },
        onSelect: function () {
            var thiz = this;

            var _defaultOptions = {};
            if (this.options) {
                lang.mixin(_defaultOptions, this.options);
            }

            try {
                var value = utils.toString(this.userData['value']);
                var actionDialog = new CIActionDialog({
                    title: 'Widget',
                    style: 'width:600px;height:500px;',
                    resizeable: true,
                    delegate: {
                        onOk: function (dlg, data) {
                            var expression = utils.getCIInputValueByName(data, 'Expression');
                            thiz.userData.changed = true;
                            thiz.userData.active = true;
                            utils.setCIValueByField(thiz.userData, "value", expression);
                            thiz.editBox.set('value', expression);
                        }
                    },
                    cis: [
                        utils.createCI('Expression', 29, value, {
                            group: 'Expression',
                            delegate: this.userData.delegate
                        })
                    ]
                });
                actionDialog.show();
            } catch (e) {
                debugger;
            }
        },
        onModeChanged: function (mode) {
            console.log('on widget reference mode changed :  ' + mode);
            this.mode = mode;
        },
        serialize: function () {
            var _data = {
                reference: this.editBox.get('value'),
                mode: this.mode
            };
            console.log('data ',_data);
            return JSON.stringify(_data);
        },
        addModeSelector: function () {
            this.widgetMode = utils.addWidget(Select, {
                userData: {
                    value: this.mode
                },
                options: [
                    {
                        label: 'By Id',
                        value: 'byid',
                        selected: this.mode == 'byid'
                    },
                    {
                        label: 'By Declared Class',
                        value: 'byclass',
                        selected: this.mode == 'byclass'
                    },
                    {
                        label: 'By CSS Query',
                        value: 'bycss',
                        selected: this.mode == 'bycss'
                    },
                    {
                        label: 'By Expression',
                        value: 'byexpression',
                        selected: this.mode == 'byexpression'
                    }
                ]
            }, this, this.modeNode, true);


            var thiz = this;
            this.add(this.widgetMode);
            this.widgetMode._on("change", function (val) {
                thiz.onModeChanged(val);
                thiz.setValue(thiz.serialize());
            });

        },
        onPickFilterChanged: function (val) {
            this.allowHTMLNodes = val == 4;
            this.allowWidgets = val == 16;

        },
        addPickFilter: function () {

            var thiz = this;
            var flags = [{
                value: 2,
                label: 'HTML'
            },
                {
                    value: 4,
                    label: 'Widgets'
                }
            ];

            var flagsWidget = utils.addWidget(FlagsWidget, {
                value: 16,
                data: flags,
                lineBreak: false,
                title: '',
                single: true,
                flagClass: 'flagItem',
                style: 'display:inline-block;width:auto;',
                onFlagChanged: function (val) {
                    thiz.onPickFilterChanged(val);
                },
                _onFlagChange2: function (flagwidget) {
                    return thiz.onPickFilterChanged(flagwidget);
                },
                isChecked2: function (val, itemVal) {
                    return true;
                },
                setValue: function (value) {
                    thiz.filterFlags = value;
                },
                getValue: function () {
                    return thiz.filterFlags;
                }
            }, thiz, this.pickFilterNode, true, 'ui-widget-content');
            flagsWidget.startup();
            this.flagsWidget = flagsWidget;
            return flagsWidget;
        },
        fillTemplate: function () {

            if (this.editBox) {
                return;
            }
            var thiz = this;
            var value = utils.toString(this.userData['value']);
            if (value) {
                var _t = dojo.fromJson(value);
                if (_t) {
                    this.mode = _t.mode;
                    value = _t.reference
                }
            }

            this.editBox = factory.createValidationTextBox(this.previewNode, "", "", value, null, this.delegate, 'Not a path!', 'I need some input');
            this.connectEditBox(this.editBox,function(value){
               thiz.setValue(thiz.serialize());
            });
            this.selectButton = factory.createButton(this.button0, "fa-eyedropper", "elusiveButton", "", "", this.onPick, this);
            this.addPickFilter();
            this.addModeSelector();


        },
        startup: function () {
            this.fillTemplate();
            this.onReady();
        }
    });
});