define([
    'dcl/dcl',
    'dojo/_base/lang',
    'xide/utils',
    'xide/types',
    'xide/factory',
    'xide/widgets/WidgetBase',
    "xide/views/_Dialog",
    "xcf/views/DeviceTreeView",
    "xide/views/_PanelDialog"

], function (dcl,lang, utils, types,factory,
             WidgetBase,_Dialog,DeviceTreeView,_PanelDialog) {


    var ACTION = types.ACTION,
        ACTION_TYPE = types.ACTION,
        ACTION_ICON = types.ACTION_ICON,
        test = false,
        marantz, marantzInstance;

    var DefaultPermissions = DeviceTreeView.DefaultPermissions;

    /**
     * Url generator for device/driver/[command|block|variable]
     *
     * @param device
     * @param driver
     * @param block
     * @param prefix
     * @returns {*}
     */
    function toUrl(device, driver, block, prefix) {

        prefix = prefix || '';

        var pattern = prefix + "deviceScope={deviceScope}&device={deviceId}&driver={driverId}&driverScope={driverScope}&block={block}";

        var url = lang.replace(
            pattern,
            {
                deviceId: device.id,
                deviceScope: device.scope,
                driverId: driver.id,
                driverScope: driver.scope,
                block: block.id
            });
        return url;
    }


    /**
     * Filter function to reject selections in a device - tree - view
     * @param item
     * @param acceptCommand
     * @param acceptVariable
     * @param acceptDevice
     * @returns {*}
     */
    function accept(item, acceptCommand, acceptVariable, acceptDevice) {


        var reference = item.ref || {},
            block = reference.item,
            device = reference.device,
            driver = reference.driver,
            scope = block ? block.getScope() : null,
            isCommand = block ? block.declaredClass.indexOf('model.Command') !== -1 : false,
            isVariable = block ? block.declaredClass.indexOf('model.Variable') !== -1 : false;


        if(block && block.isCommand === true){
            isCommand = true;
        }
        if (isCommand && acceptCommand) {
            return toUrl(device, driver, block, 'command://');
        }
        if (isVariable && acceptVariable) {
            return toUrl(device, driver, block, 'variable://');
        }

        return false;

    }

    /**
     * Create a simple CIS
     * @returns {{inputs: *[]}}
     */
    function createPickerCIS(instance) {
        var CIS = {
            "inputs": [
                {
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'General9',
                    "id": "CF_DRIVER_ID2",
                    "name": "CF_DRIVER_ID2",
                    "order": 1,
                    "params": null,
                    "parentId": "myeventsapp108",
                    "platform": null,
                    "storeDestination": "metaDataStore",
                    "title": "Command",
                    "type": 'Command',
                    "uid": "-1",
                    "value": "235eb680-cb87-11e3-9c1a-0800200c9a66",
                    "visible": true
                },
                {
                    "chainType": 0,
                    "class": "cmx.types.ConfigurableInformation",
                    "dataRef": "",
                    "dataSource": "",
                    "description": null,
                    "enabled": true,
                    "enumType": "-1",
                    "flags": -1,
                    "group": 'General1',
                    "id": "CF_DRIVER_ID",
                    "name": "CF_DRIVER_ID",
                    "order": 1,
                    "params": null,
                    "parentId": "myeventsapp108",
                    "platform": null,
                    "storeDestination": "metaDataStore",
                    "title": "Id",
                    "type": 13,
                    "uid": "-1",
                    "value": "235eb680-cb87-11e3-9c1a-0800200c9a66",
                    "visible": true
                }
            ]
        };
        _.each(CIS.inputs, function (ci) {
            ci.driver = instance.driver,
                ci.device = instance.device
        });
        return CIS;
    }

    function doPickerTest(grid, accept) {

        /*
         var toolbar = grid.showToolbar(true,null,null,false);

         var widget = dcl(_XWidget,{
         templateString:'<div>' +
         '<input attachTo="input" data-provide="typeahead" class="typeahead form-control input-transparent" type="text" placeholder="States of USA">'+
         '</div>',
         startup:function(){

         var substringMatcher = function(strs) {
         return function findMatches(q, cb) {
         var matches, substringRegex;

         // an array that will be populated with substring matches
         matches = [];

         // regex used to determine if a string contains the substring `q`
         substrRegex = new RegExp(q, 'i');

         // iterate through the pool of strings and for any string that
         // contains the substring `q`, add it to the `matches` array
         $.each(strs, function(i, str) {
         if (substrRegex.test(str)) {
         matches.push(str);
         }
         });

         cb(matches);
         };
         };

         var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
         'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
         'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
         'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
         'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
         'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
         'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
         'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
         'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
         ];

         this.$input.typeahead({
         hint: true,
         highlight: true,
         minLength: 1,
         name: 'states',
         source: substringMatcher(states)
         });

         }
         });

         utils.addWidget(widget,null,null,toolbar,true);

         */

        grid._on('selectionChanged', function (evt) {
            var selection = evt.selection,
                item = selection && selection.length == 1 ? selection[0] : null;

            if (!item) {
                return;
            }

            var isAccepted = accept(item, true);

            isAccepted && console.log('-selected : ' + isAccepted, item);

        });
    }

    /**
     * Simple test of the device tree view
     * @param grid
     * @param accept
     */
    function createDeviceView(parent,ctx,driver,device,type) {

        var ACTION = types.ACTION;

        var deviceScope = device ? device.info.deviceScope : 'user_devices';

        var grid = utils.addWidget(DeviceTreeView, {
            title: 'Devices',
            collection: ctx.getDeviceManager().getStore(deviceScope),
            delegate: ctx.getDeviceManager(),
            blockManager: ctx.getBlockManager(),
            ctx: ctx,
            icon: 'fa-sliders',
            showHeader: false,
            scope: deviceScope,
            resizeToParent: true,
            permissions:[
                ACTION.EDIT,
                ACTION.RELOAD,
                ACTION.DELETE,
                ACTION.SELECTION,
                ACTION.TOOLBAR,
                ACTION.SEARCH
            ]
        }, null, parent, true);

        grid._on('selectionChanged',function(evt){
            var selection = evt.selection,
                item = selection && selection.length==1 ? selection[0] : null;

            if(!item){
                return;
            }

            var isAccepted = accept(item,type=='command',type=='variable',type=='device');
            isAccepted  && console.log('-selected : ' + isAccepted,item);
            if(isAccepted){
                grid._selected = isAccepted;
                grid._selection = selection;
            }
        });

        setTimeout(function(){
            grid.showToolbar(true);
            grid.resize();
        },500);
        return grid;
    }


    var Module = dcl(WidgetBase, {
        declaredClass: "xcf.widgets.CommandPickerWidget",
        minHeight: "400px;",
        value: "",
        options: null,
        title: 'Command',
        templateString: "<div class='widgetContainer widgetBorder widgetTable' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
        "<td width='15%' class='widgetTitle'><span><b>${!title}</b><span></td>" +
        "<td width='100px' class='widgetValue2' valign='middle' attachTo='valueNode'></td>" +
        "<td class='extension' width='25px' attachTo='button0'></td>" +
        "<td class='extension' width='25px' attachTo='button1'></td>" +
        "<td class='extension' width='25px' attachTo='button2'></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' onclick='' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        onValueChanged:function(value,gridView){

            value = value.newValue || value;

            this.setValue(value);

            var ci = this.userData,
                block = ci.block,
                blockScope = block.scope;

            var selection = gridView._selection || [];
            if(selection[0] && selection[0].ref && selection[0].ref.item){
                blockScope = selection[0].ref.item.scope;
            }

            var title = blockScope.toFriendlyName && blockScope.toFriendlyName(block, value);

            console.log('value changed:  '+title + ' ',block);

            this.commandWidget.set('value',value,title);
        },
        onSelect: function (ctx,driver,device) {

            var thiz = this;
            var _defaultOptions = {},
                ci = this.userData;
            utils.mixin(_defaultOptions, this.options);

            var value = utils.toString(this.userData['value']);

            var dlg = new _PanelDialog({
                size: types.DIALOG_SIZE.SIZE_NORMAL,
                bodyCSS: {
                    'height': 'auto',
                    'min-height': '500px',
                    'padding': '8px',
                    'margin-right': '16px'
                },
                picker: null,
                title:ci.pickerType === "command" ? "Select Command" : "Select Variable",
                onOk: function () {
                    var selected = thiz.picker._selected;
                    selected && thiz.onValueChanged(selected,thiz.picker);
                },
                onShow:function(panel,contentNode,instance){
                    //var thiz = dlg.owner;
                    var picker = createDeviceView(contentNode,ctx,driver,device,ci.pickerType);
                    thiz.picker = picker;
                    thiz.add(picker, null, false);
                    return $(picker.domNode);
                }
            });


            return dlg.show();
        },
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
                    "<td width='50%' class='widgetValue2' valign='middle' attachTo='valueNode'></td>" +
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
        fillTemplate: function () {

            var thiz = this;
            var value = utils.toString(this.userData['value']) || '';
            var ci = this.userData,
                block = ci.block,
                blockScope = block.scope,
                ctx = blockScope.ctx,
                pickerType = ci.pickerType,
                driver = blockScope.driver,
                device = blockScope.device,
                deviceManager = ctx.getDeviceManager(),
                driverManager = ctx.getDriverManager();



            //add the Select Widget for local commands
            var CIS = [],
                isCommand = pickerType == 'command';

            var title = 'Command';


            if(value.indexOf('://')!==-1 && blockScope.toFriendlyName){
                title = blockScope.toFriendlyName(block,value);
            }


            if(blockScope.blockStore) {
                CIS.push(utils.createCI('value', 3, 'Volume', {
                    group: 'General',
                    title: title,
                    value: value,
                    widget: {
                        store: blockScope.blockStore,
                        labelField: 'name',
                        valueField: 'id',
                        search: true,
                        title: title,
                        query: this.query ? this.query : {
                            group: isCommand ? 'basic' : 'basicVariables'
                        },
                        templateString: '<select disabled="${!disabled}" value="${!value}" title="${!title}" data-live-search="${!search}"  data-style="${!style}" class="selectpicker" attachTo="selectNode">'
                    }
                }));
            }else{
                CIS.push(utils.createCI('value', 13, 'Driver Variable', {
                    group: 'General',
                    value: value,
                    title:" "
                }));
            }



            factory.renderCIS(CIS, this.valueNode, this).then(function (widgets) {

                var commandWidget = widgets[0];
                var btn = factory.createSimpleButton('', 'fa-magic', 'btn-default', {
                    style: ''
                });
                thiz.commandWidget = commandWidget;
                commandWidget._on('onValueChanged',function(e){
                    thiz.onValueChanged(e);
                });
                $(btn).click(function () {
                    thiz.onSelect(ctx,driver,device);
                });
                $(thiz.button0).append(btn);
                thiz.add(commandWidget,null,false);
            });
        },
        startup: function () {
            try {
                this.fillTemplate();
                this.onReady();
            } catch (e) {
                logError(e);
            }
        }
    });

    dcl.chainAfter(Module,"destroy");

    return Module;
});
