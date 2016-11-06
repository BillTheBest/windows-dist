define([
    'dcl/dcl',
    "dojo/_base/declare",
    "xide/widgets/TemplatedWidgetBase",
    'xide/factory',
    'xide/utils',
    'xide/widgets/WidgetBase'
], function (dcl, declare, TemplatedWidgetBase, factory, utils,WidgetBase) {


    return dcl(WidgetBase, {
        declaredClass: "xide.widgets.FlagsWidget",
        data: null,
        title: "NoTitle",
        value: 0,
        minHeight: "25px;",
        checkboxRoot: null,
        lineBreak: false,
        flagClass: '',
        checkboxes: null,
        single: false,
        titleWidth:'15%',
        templateString2: "<div style='padding: 8px' class='FlagsWidget'>" +

        "</div>",

        templateString:"<div class='widgetContainer widgetBorder widgetTable widget' style=''>" +
        "<table border='0' cellpadding='5px' width='100%'>" +
        "<tbody align='left'>" +
        "<tr attachTo='extensionRoot' valign='middle' style='height:90%'>" +
        "<td attachTo='titleColumn' width='${!titleWidth}' class='widgetTitle'><b><span attachTo='titleNode'>${!title}</span></b></td>" +
        "<td valign='middle' class='widgetValue' attachTo='valueNode' width='300px'>" +
            "<table border='0' cellpadding='0px' width='auto'  class=''>" +
                "<tbody align='left'>" +
                    "<tr valign='top' style=''>" +
                        "<td valign='top' attachTo='checkboxRoot' class=''></td>" +
                    "</tr>" +
                "</tbody>" +
            "</table>" +

        "</td>" +
        "<td class='extension' attachTo='previewNode'></td>" +
        "<td class='extension' attachTo='button0'></td>" +
        "<td class='extension' attachTo='button1'></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        widgetChanged: function (dst, widget) {

            dst.checkSettings();
        },
        _onFlagChange: function (flagWidget) {


            var userVal = this.getValue();

            if (this.single) {
                for (var i = 0; i < this.checkboxes.length; i++) {
                    if (this.checkboxes[i][0].id !== flagWidget.id) {
                        this.checkboxes[i].removeAttr('checked');
                        userVal = utils.disableFlag(userVal, this.checkboxes[i]._value);
                    }
                }
            }
            var widgetValue = flagWidget.checked;


            if(!this.hex){
                if (widgetValue === false) {
                    userVal = utils.disableFlag(userVal, flagWidget._value);
                } else {
                    userVal += (1 << flagWidget._value);
                }
            }else{
                if (widgetValue === true) {
                    userVal = userVal | flagWidget._value;
                }else{
                    userVal &=~flagWidget._value;
                }
            }
            this.setValue(userVal);
            this._emit('change',userVal);
        },
        isChecked: function (val, itemVal) {
            if(this.hex===true){
                return val & itemVal ? true : false;
            }
            return utils.hasFlag3(val, itemVal);
        },
        initWithData: function (items, _val) {
            if(this._renderedCB){
                return;
            }
            this._renderedCB = true;
            var thiz = this;
            this.checkboxes = [];

            _val = _val || this.getValue();
            function wire(what){
                what.on('change',function(evt){
                    thiz._onFlagChange(what[0]);

                });
            }
            var cb = function (delegate, widget) {
                thiz._onFlagChange(widget);
            };
            for (var i = 0; i < items.length; i++) {

                var _checked = this.isChecked(_val, items[i].value);
                var _flag = factory.createCheckBox(this.checkboxRoot, items[i].label, items[i].value, _checked,this.id+'_cb'+'_'+items[i].value,items[i].title);
                _flag[0]._value =  items[i].value;
                this.checkboxes.push(_flag);
                if (this.lineBreak) {
                    var br = dojo.doc.createElement('br');
                    this.checkboxRoot.appendChild(br);
                }
                wire(_flag);
            }
        },
        enableAll: function () {},
        setupListeners: function () {},
        startup: function () {
            if (this.data) {
                this.initWithData(this.data, this.value);
            }
        }
    });
});