define([
    'dcl/dcl',
    "dojo/_base/declare",
    "dojo/_base/lang",
    "xide/widgets/WidgetBase",
    "xide/widgets/EditBox",
    'xide/factory',
    'xide/utils',
    'xfile/FileActions',
    "xfile/views/FileGridLight",
    "dojo/Deferred"
], function (dcl,declare, lang, WidgetBase, EditBox,factory, utils,FileActions,FileGridLight,Deferred) {
    return dcl([WidgetBase], {
        declaredClass:"xide.widgets.FileWidget",
        oriPath: null,
        minHeight: "54px;",
        value: "",
        options: null,
        dialogTitle: 'Select Script',
        editBox:null,
        templateString: "<div class='widgetContainer widgetBorder widgetTable widget' style=''>" +
        "<table border='0' cellpadding='5px' width='100%' >" +
        "<tbody>" +
        "<tr attachTo='extensionRoot'>" +
        "<td width='15%' class='widgetTitle'><span><b>${!title}</b><span></td>" +
        "<td width='80px' class='widgetValue2' valign='middle' attachTo='previewNode'></td>" +
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
        onFileSelected: function (dlg, item) {
            if (item) {

                var acceptFiles = utils.toBoolean(this.userData['acceptFiles']);
                var acceptFolders = utils.toBoolean(this.userData['acceptFolders']);
                var encodeFilePath = utils.toBoolean(this.userData['encodeFilePath']);
                var buildFullPath = utils.toBoolean(this.userData['buildFullPath']);
                var isDirectory = item.directory === true;

                if (isDirectory && !acceptFolders) {
                    return;
                } else if (!isDirectory && !acceptFiles) {
                    return;
                }
                this.userData.changed = true;
                this.userData.active = true;


                var _newPath = buildFullPath ? utils.buildPath(item.mount, item.path, encodeFilePath) : item.path;
                this.editBox.set('value', _newPath);
                this.value = _newPath;
                this.setValue(_newPath);

            }
        },
        getOptions: function () {
            var ctx = this.ctx || window['xFileContext'];
            var _defaultOptions = {
                title: this.dialogTitle,
                owner: ctx,
                dst: {
                    name: 'Select',
                    path: '.'
                },
                src: '.',
                ctx: ctx
            };
            var options = this.options || ctx.defaultOptions;
            if (options) {
                _defaultOptions = utils.mixin(_defaultOptions, options);
                console.dir(options);
            } else {
                console.error('have no options');
            }

            //there are file picker options in the CI?
            var userOptions = this.userData ? this.userData.filePickerOptions : {};
            if (userOptions) {
                _defaultOptions = utils.mixin(_defaultOptions, userOptions);
            }

            //we actually need a new store with different options
            if (_defaultOptions.store && _defaultOptions.defaultStoreName) {

                if (!userOptions || !userOptions.defaultStoreOptions) {
                    _defaultOptions.defaultStoreOptions = {
                        "fields": 1663,
                        "includeList": "*",
                        "excludeList": "*"
                    };
                }
                //get a new store
                _defaultOptions.store = ctx.getStore(_defaultOptions.defaultStoreName, _defaultOptions.defaultStoreOptions);

            }else if(userOptions.defaultStoreOptions){
                _defaultOptions.store = ctx.getStore(_defaultOptions.defaultStoreName, userOptions.defaultStoreOptions);
            }

            return _defaultOptions;
        },
        onSelect: function () {
            var self = this;

            utils.destroy(this.picker);

            if(this._onSelect){
                var _dlgDfd =this._onSelect(this);
                if(_dlgDfd.then){
                    _dlgDfd.then(function(val){
                        self.editBox.set('value',val);
                        self.setValue(val);
                    });
                }
                return _dlgDfd;
            }

            var thiz = this;
            var defaultOptions = this.getOptions();
            try {
                function done(item,selection,picker){
                    var firstItem = item;
                    var val = firstItem.realPath || firstItem.path;
                    self.editBox.set('value',val);
                    self.setValue(val);
                }
                var dfd = new Deferred();

                FileActions.createFilePicker(this,"",done,'Select File',null,defaultOptions,dfd,FileGridLight);


                //this.picker = picker;
                //this.add(picker);

            } catch (e) {
                console.error('file widget crash : ' + e);
                logError(e);
            }
        },

        set:function(what,value){
            if(this.editBox && what==='value'){
                this.editBox.set(what,value);
            }
            return this.inherited(arguments);
        },
        postMixInProperties: function () {

            if(this.userData && this.userData.widget && this.userData.widget.title){
                this.title=this.userData.widget.title;
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

            return this.inherited(arguments);
        },
        fillTemplate: function () {
            var value = utils.toString(this.userData['value']),
                self = this;

            var editBox = utils.addWidget(EditBox,{
                userData:this.userData,
                title:''
            },null,this.previewNode,true);

            this.editBox = editBox;
            editBox._on('change',function (val) {
                self.setValue(val);
            })

            var btn = factory.createSimpleButton('', 'fa-folder', 'btn-default', {
                style: ''
            });
            $(btn).click(function(){
                self.onSelect();
            })
            $(this.button0).append(btn);

            this.add(editBox);

        },
        startup: function () {

            this.inherited(arguments);
            this.fillTemplate();
            this.onReady();
        }
    });
});