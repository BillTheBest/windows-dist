/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xide/widgets/WidgetBase',
    'xide/widgets/FlagsWidget'

], function (dcl,types,
             utils, WidgetBase,FlagsWidget) {


    var Module = dcl(WidgetBase, {
        declaredClass: "xide.widgets.ArgumentsWidget",
        minHeight: "400px;",
        value: "",
        options: null,
        title:"",
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style='overflow: auto;height: 100%'>" +
        "<div attachTo='itemsNode' class='text-default'></div>"+
        "</div>",
        renderFlags:function(label,value){

            var LOGGING_FLAGS = types.LOGGING_FLAGS;
            
            var flags = [
                {
                    value: LOGGING_FLAGS.GLOBAL_CONSOLE,
                    label: 'Global Console'
                },
                {
                    value: LOGGING_FLAGS.DEV_CONSOLE,
                    label: 'Chrome Dev - Console'
                },
                {
                    value: LOGGING_FLAGS.DEVICE_CONSOLE,
                    label: 'Device Console'
                },
                {
                    value: LOGGING_FLAGS.STATUS_BAR,
                    label: 'Status Bar'
                },
                {
                    value: LOGGING_FLAGS.POPUP,
                    label: '%%Popup'
                },
                {
                    value: LOGGING_FLAGS.FILE,
                    label: 'File'
                }

            ];

            var flagsWidget = utils.addWidget(FlagsWidget, {
                value: value,
                data: flags,
                lineBreak: false,
                title: label,
                titleWidth:'30%',
                single: false,
                hex:true,
                userData:{
                    value:value
                }
            }, this, this.itemsNode, true, 'ui-widget-content');

            this.$itemsNode.append('<hr/>');

            return flagsWidget;

        },
        renderItem:function(label,value,object){
            var widget = this.renderFlags(label,value);
            var self = this;
            widget._on('change',function(value){
                object[label]=value;
                self.setValue(JSON.stringify(object,null,2));
            });
            return widget;
        },
        _renderItem:function(output,defaultFlags){
            var value = this.userData.value;
            var flags = output in value ? value[output] : defaultFlags;
            this.add(this.renderItem(output,flags,this.userData.value));
        },
        startup: function () {
            var LOGGING_FLAGS = types.LOGGING_FLAGS;
            var OUTPUT = types.LOG_OUTPUT;
            if(_.isString(this.userData.value)){
                this.userData.value = utils.fromJson(this.userData.value);
            }

            if(!this.userData.value || !_.isObject(this.userData.value)){
                this.userData.value = {};
            }
            var value = this.userData.value;
            
            this._renderItem(OUTPUT.DEVICE_CONNECTED,LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP |  LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEVICE_CONSOLE);            
            this._renderItem(OUTPUT.DEVICE_DISCONNECTED,LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP |  LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEVICE_CONSOLE);
            this._renderItem(OUTPUT.RESPONSE,LOGGING_FLAGS.DEVICE_CONSOLE | LOGGING_FLAGS.GLOBAL_CONSOLE);
            this._renderItem(OUTPUT.SEND_COMMAND,LOGGING_FLAGS.DEVICE_CONSOLE | LOGGING_FLAGS.GLOBAL_CONSOLE);
            this._renderItem(OUTPUT.DEVICE_ERROR,LOGGING_FLAGS.GLOBAL_CONSOLE | LOGGING_FLAGS.POPUP | LOGGING_FLAGS.STATUS_BAR | LOGGING_FLAGS.DEV_CONSOLE | LOGGING_FLAGS.DEVICE_CONSOLE);

            this.onReady();
        }
    });

    types.registerWidgetMapping('Logging Flags',Module);

    return Module;

});