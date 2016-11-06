define([
    'dcl/dcl',
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xide/widgets/WidgetBase",
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xide/views/_CIDialog',
    'xide/views/CIView',
    'xide/widgets/JSONDualEditorWidget',
    'xide/views/_Panel'
], function (dcl, declare, lang, WidgetBase, factory, utils,types,CIActionDialog,CIView,JSONDualEditorWidget,_Panel) {

    return dcl(WidgetBase, {
        declaredClass: "xide.widgets.ArgumentsWidget",
        minHeight: "400px;",
        value: "",
        options: null,
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
        "<td width='15%' class=''><span><b>${!title}</b><span></td>" +
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
        filePathValidator: function (value, constraints) {
            return true;
        },

        onSelect: function () {
            var thiz = this;
            var _defaultOptions = {};



            utils.mixin(_defaultOptions, this.options);

            var value = utils.toString(this.userData['value']);
            var changedCIS = [];
            var cisView = null;

            function ok(){

                var value = cisView.widgets[0].getValue();

                thiz.userData.changed = true;

                thiz.userData.active = true;

                utils.setCIValueByField(thiz.userData, "value", value);
                thiz.editBox.val(value);
                var _args = {
                    owner: thiz.delegate || thiz.owner,
                    ci: thiz.userData,
                    newValue: value
                }
                thiz.publish(types.EVENTS.ON_CI_UPDATE, _args);
                thiz._emit('valueChanged', _args);
            }
            var cis = [
                utils.createCI('Arguments', JSONDualEditorWidget, value, {
                    group: 'Arguments',
                    widget:{
                        jsonOptions:{
                            renderTemplates:[],
                            insertTemplates:[],
                            noActions:true
                        }
                    }
                })
            ]
            var panel = new _Panel({
                title: 'Arguments',
                containerClass:'CIDialog',
                options:{
                    "contentSize": {
                        width: '600px',
                        height: '500px'
                    },
                    footerToolbar:[
                        {
                            item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                            event:    "click",
                            btnclass: "btn btn-danger btn-sm",
                            btntext:  " Cancel",
                            callback: function( event ){ event.data.close() }
                        },
                        {
                            item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                            event:    "click",
                            btnclass: "btn btn-primary btn-sm",
                            btntext:  " Ok",
                            callback: function( event ){
                                ok();
                                event.data.close();
                            }
                        }
                    ]

                },
                onShow:function(panel,contentNode,instance){

                    cisView = utils.addWidget(CIView, {
                        delegate: this,
                        resizeToParent:true,
                        options: {
                            groupOrder: {
                                'General': 1,
                                'Send': 2,
                                'Advanced': 4,
                                'Description': 5
                            }
                        },
                        cis: cis
                    }, this, contentNode, true);
                    return [cisView];
                }
            });
            panel.show();
            return panel;

            /*
            var actionDialog = new CIActionDialog({
                title: 'Arguments',
                style: 'width:400px;height:400px;',
                resizeable: true,
                delegate: {
                    onOk: function (dlg, data) {
                        var expression = utils.getCIInputValueByName(data, 'Arguments');
                        thiz.userData.changed = true;
                        thiz.userData.active = true;
                        utils.setCIValueByField(thiz.userData, "value", expression);
                        thiz.editBox.set('value', expression);
                    }
                },
                cis: [
                    utils.createCI('Arguments', JSONDualEditorWidget, value, {
                        group: 'Arguments'
                    })
                ]
            });


            this.add(actionDialog,null,false);
            actionDialog.show();
            */
        },

        fillTemplate: function () {
            var thiz = this;
            var value = utils.toString(this.userData['value']) || '{}';

            var area = $('<textarea rows="3" class="form-control input-transparent" ></textarea>');
            area.val(value);
            this.editBox = area;
            $(this.previewNode).append(area);
            this.editBox.on("change", function (e) {

                var value2 = e.target.value;

                thiz.userData.changed = true;
                thiz.userData.active = true;

                utils.setCIValueByField(thiz.userData, "value", value2);

                var _args = {
                    owner: thiz.delegate || thiz.owner,
                    ci: thiz.userData,
                    newValue: value2,
                    storeItem: thiz.storeItem
                }
                thiz.publish(types.EVENTS.ON_CI_UPDATE, _args);
                thiz._emit('valueChanged', _args);
            });

            var btn = factory.createSimpleButton('', 'fa-magic', 'btn-default', {
                style: ''
            });

            $(btn).click(function () {
                thiz.onSelect();
            })

            $(this.button0).append(btn);
        },
        startup: function () {
            try {
                this.fillTemplate();
                this.onReady();
            }catch(e){
                logError(e);
            }
        }
    });
});