define([
    "dojo/_base/declare",
    "xide/widgets/WidgetBase",
    'xide/factory',
    'xide/utils',
    'xide/types',
    'xblox/views/BlocksFileEditor',
    'xide/views/ActionDialog',
    'dojo/dom-style'

], function (declare, WidgetBase, factory, utils, types, BlocksFileEditor, ActionDialog,domStyle) {

    return declare("xide.widgets.BlockPickerWidget", [WidgetBase], {

        minHeight: "54px;",
        value: "",
        options: null,
        dialogTitle: 'Select Block',
        showDialog:true,
        lastItem:null,
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
        "<td width='15%' class='widgetTitle'><span><b>Block</b><span></td>" +
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
        destroy:function(){
            this.ctx.blockManager.ignoreItemSelection=false;
            this.inherited(arguments);
        },
        filePathValidator: function (value, constraints) {
            return true;
        },
        onItemSelected: function (evt) {

            if(!this.isMyBeanContext(evt)){
                return;
            }

            if(evt.item) {
                this.lastItem = evt.item;
                if(this.lastItem) {
                    this.userData.changed = true;
                    this.userData.active = true;
                    if (this.editBox) {
                        this.editBox.set('value', this.lastItem.id);
                    }

                    //console.log('got block,',this);

                    this.value = this.lastItem.id;
                    this.setValue(this.lastItem.id);
                }
            }


        },
        _createBlockView:function(where,scope){

            this.ctx.blockManager.ignoreItemSelection=true;

            var blockEditor = utils.addWidget(BlocksFileEditor, {
                style: 'height:inherit;width:inherit;padding:0px;',
                beanContextName: this.id,
                ctx:this.ctx

            }, this, where, true);

            blockEditor.initWithScope(scope);

            this.blockView = blockEditor;
        },
        resize:function(){
            this.inherited(arguments);
            if(this.blockView){
                this.blockView.resize();
            }
        },
        onSelect: function () {

            var scope = this.userData['scope'],
                thiz = this;

            var dialog = new ActionDialog({
                title: this.dialogTitle,
                resizeable: true,
                resizeToContent: false,
                fitContent: true,
                dialogClass: 'CIDialogRoot',
                style: 'min-width:600px;min-height:500px',
                delegate: {
                    onOk:function(){

                        if(thiz.lastItem) {
                            thiz.userData.changed = true;
                            thiz.userData.active = true;
                            thiz.editBox.set('value', thiz.lastItem.id);
                            thiz.value = thiz.lastItem.id;
                            thiz.setValue(thiz.lastItem.id);
                        }
                    }
                }
            });

            dialog.show().then(function () {
                thiz._createBlockView(dialog,scope);
            });

        },
        fillTemplate: function () {

            var value = utils.toString(this.userData['value']);
            this.editBox = factory.createValidationTextBox(this.previewNode, "", "", value, this.filePathValidator, this.delegate, 'Not a path!', 'I need some input');
            this.connectEditBox(this.editBox);
            this.selectButton = factory.createButton(this.button0, "el-icon-folder-open", "elusiveButton", "", "", this.onSelect, this);
        },
        startup: function () {

            this.inherited(arguments);

            this.subscribe(types.EVENTS.ON_ITEM_SELECTED);

            if(this.userData.showDialog===false){

                dojo.empty(this.domNode);
                domStyle.set(this.domNode,{
                    'height':'inherit',
                    'margin':'0px'
                });
                var scope = this.userData['scope'];
                this.beanContextName = this.id;
                this._createBlockView(this.domNode,scope);
                return;
            }

            this.fillTemplate();
            this.onReady();
            this.beanContextName = this.id;

        }
    });
});