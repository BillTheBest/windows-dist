define([
    'dcl/dcl',
    "xide/widgets/WidgetBase",
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xide/views/_CIDialog',
    'xide/views/_CIPanelDialog'
], function (dcl, WidgetBase, factory, utils, types, CIActionDialog,_CIPanelDialog) {

    return dcl(WidgetBase, {
        declaredClass: "xide.widgets.Expression",
        minHeight: "400px;",
        value: "",
        options: null,
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
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        postMixInProperties: function () {

            this.inherited(arguments);

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
                    "</tbody>" +
                    "</table>" +
                    "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
                    "<div attachTo='last'></div>" +
                    "</div>"
            }

        },
        onValueChanged:function(value,updateTextArea){
            if(this.userData.value===value){
                return;
            }
            this.userData.changed = true;
            this.userData.active = true;
            utils.setCIValueByField(this.userData, "value", value);
            var _args = {
                owner: this.delegate || this.owner,
                ci: this.userData,
                newValue: value
            }
            this.publish(types.EVENTS.ON_CI_UPDATE, _args);
            this._emit('valueChanged', _args);
            if(updateTextArea){
                this.editBox.val(value);
            }
        },
        onSelect: function () {
            var thiz = this;
            var _defaultOptions = {};

            utils.mixin(_defaultOptions, this.options);
            var value = utils.toString(this.userData['value']);
            var actionDialog = new _CIPanelDialog({
                title: 'Expression',
                style: 'width:800px;height:600px;min-height:600px;',
                resizeable: true,
                onOk:function(changedCIS){
                    if(changedCIS && changedCIS[0]){
                        thiz.onValueChanged(changedCIS[0].ci.value,true);
                    }
                },
                cis: [
                    utils.createCI('Expression', types.ECIType.EXPRESSION_EDITOR, value, {
                        group: 'Expression',
                        delegate: this.userData.delegate
                    })
                ]
            });

            this.add(actionDialog,null,false);
            return actionDialog.show();
        },
        startup: function () {
            var thiz = this;
            var value = utils.toString(this.userData['value']);
            var area = $('<textarea rows="3" class="form-control input-transparent" ></textarea>');
            area.val(value);
            this.editBox = area;
            $(this.previewNode).append(area);
            this.editBox.on("change", function (e) {
                thiz.onValueChanged(e.target.value);
            });
            var btn = factory.createSimpleButton('', 'fa-magic', 'btn-default', {
                style: ''
            },this.button0);
            $(btn).click(function () {
                thiz.onSelect();
            })
            this.onReady();
        }
    });
});