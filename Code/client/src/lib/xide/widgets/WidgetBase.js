define([
    'dcl/dcl',
    'dojo/_base/connect',
    "dojo/dom-class",
    "xide/widgets/TemplatedWidgetBase",
    "xide/utils",
    "xide/factory",
    "xide/types",
    "dojo/dom-construct"

], function (dcl,connect, domClass, TemplatedWidgetBase, utils, factory, types, domConstruct) {

    var Module = dcl([TemplatedWidgetBase], {
        declaredClass:"xide.widgets.WidgetBase",
        cssClass: '',
        _currentPlatform: null,
        data: null,
        model: null,
        widgets: null,
        delegate: null,
        helpNodes: null,
        navigationView: null,
        currentWidget: null,
        currentDataItem: null,
        didLoad: false,
        isSubWidget: false,
        title: "NoTitle",
        value: "Unset",
        minHeight: "60px;",
        previewNode: null,
        button0: null,
        valueNode: null,
        button1: null,
        toolBarRoot: null,
        toolBar: null,
        button2: null,
        button3: null,
        wButton2: null,
        wButton3: null,
        nativeWidget: null,
        isInherited: false,
        expander: null,
        expanderButton: null,
        expanderOpen: false,
        expanderPane: null,
        lastHeight: null,
        hasPlatform: false,
        titleNode: null,
        storeDelegate: null,
        extensionRoot: null,
        extensionTag: 'td',
        extensionClass: 'extension',
        _didSendReady: false,
        styles: null,
        active: true,
        vertical: false,
        titleColumn: null,
        templateString: "<div class='widgetContainer widgetBorder widgetTable widget' style=''>" +
        "<table border='0' cellpadding='5px' width='100%'>" +
        "<tbody align='left'>" +
        "<tr attachTo='extensionRoot' valign='middle' style='height:90%'>" +
        "<td attachTo='titleColumn' width='15%' class='widgetTitle'><b><span attachTo='titleNode'>${!title}</span></b></td>" +
        "<td valign='middle' class='widgetValue' attachTo='valueNode' width='100px'>${!value}</td>" +
        "<td class='extension' attachTo='previewNode'></td>" +
        "<td class='extension' attachTo='button0'></td>" +
        "<td class='extension' attachTo='button1'></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<div attachTo='expander' style='width:100%;'></div>" +
        "<div attachTo='last'></div>" +
        "</div>",
        changed: false,
        setActive: function (active) {
            this.active = false;
            if (this.userData) {
                this.userData._active = active;
            }
        },
        setStoreDelegate: function (delegate) {
            this.storeDelegate = delegate;
        },
        getExtensionRoot: function () {
            return this.extensionRoot;
        },
        getFreeExtensionSlot: function (startNode) {
            var root = startNode || this.getExtensionRoot();
            if (!root) {
                return null;
            }

            var node = utils.findEmptyNode(root, '.extension');

            if (!node) {
                node = domConstruct.create(this.extensionTag, {
                    className: this.extensionClass
                }, root);
            }

            return node;

        },
        getCurrentPlatform: function () {
            return this._currentPlatform;
        },
        getRootId: function () {
            return this.id;
        },
        save: function () {

            this.publish(types.EVENTS.ON_CI_UPDATE, {
                owner: this.delegate || this.owner,
                ci: this.userData,
                newValue: this.getValue(),
                storeItem: this.storeItem
            });

        },
        /***
         * Widget base protocol to be implemented by each subclass
         * @param value
         */
        setValue: function (value, dataSource, dataRef, title) {
            var oldValue = utils.getCIValueByField(this.userData, "value");
            this.userData = utils.setCIValueByField(this.userData, "value", value);
            if (this.skipSave == true) {
                this.skipSave = false;
                return;
            }

            var eventArgs = {
                owner: this.delegate || this.owner,
                ci: this.userData,
                newValue: value,
                oldValue: oldValue,
                storeItem: this.storeItem
            };


            this.publish(types.EVENTS.ON_CI_UPDATE, eventArgs);


            this._emit('valueChanged', eventArgs);


        },

        /**
         *
         * @param platform
         * @param field
         * @returns {*}
         */
        getValue: function (platform, field) {
            return utils.getCIValueByField(this.userData, field || "value");

        },
        clearValue: function () {

        },
        empty: function () {


        },
        buildToolbar: function () {


        },
        fillTemplate: function () {

            var thiz = this;
            if (this.nativeWidget) {
                this.valueNode.innerHTML = "";
                this.valueNode.appendChild(this.nativeWidget.domNode);
            }
        },
        addClearButton: function () {

            if (this.wButton1) {
                return;
            }

            var thiz = this;
            var anchor = dojo.doc.createElement('DIV', {});
            this.wButton1 = new dijit.form.ToggleButton({
                role: "button",
                showLabel: false,
                checked: true,
                iconClass: "widgetDeleteButton",
                style: "padding-left:0px;"
            }, anchor);

            this.button1.appendChild(this.wButton1.domNode);

            connect.connect(this.wButton1, "onClick", function (item) {
                thiz.clearValue();
                if (thiz.setThumbnail) {
                    thiz.setThumbnail("");
                }
            });
        },
        startup: function () {

            if (this.value == null) {
                this.value = "Unset";
            }

            if (this._started) {
                return;
            }

            var res = this.inherited(arguments);

            if (this.userData && this.userData.inherited && this.userData.inherited == true) {
                this.isInherited = true;
                domClass.remove(this.domNode, "widgetContainer");
                this.buildToolbar();
                domClass.add(this.domNode, "widgetContainerAlternate");

            }
            if (this.userData.toolTip) {
                this.initToolTip(this.userData.toolTip);
            }

            if (this.nativeWidget && this.setupNativeWidgetHandler) {
                this.setupNativeWidgetHandler();
            }
            this.updateTitleNode(this.title);

            if (this.showLabel == false) {
                utils.destroy(this.titleColumn);
            }
            return res;
        },
        connectEditBox: function (editBox, onChanged) {

            var thiz = this;

            function cb(value){
                if (onChanged) {
                    onChanged(value);
                }
                var _valueNow = utils.toString(thiz.userData['value']);

                if (value === _valueNow) {
                    return;
                }
                thiz.userData.changed = true;
                thiz.userData.active = true;
                if (thiz.serialize) {
                    value = thiz.serialize();
                }
                utils.setCIValueByField(thiz.userData, "value", value);

                factory.publish(types.EVENTS.ON_CI_UPDATE, {
                    owner: thiz.delegate || thiz.owner,
                    ci: thiz.userData,
                    newValue: value,
                    storeItem: thiz.storeItem
                }, thiz);
            }

            if(editBox._on){
                editBox._on('change',cb);
            }else {
                connect.connect(editBox, "onChange", cb);
            }

        },
        onReady: function () {

            if (!this._didSendReady) {

                factory.publish(types.EVENTS.ON_WIDGET_READY, {
                    ci: this.userData,
                    widget: this,
                    storeItem: this.storeItem,
                    owner: this.owner
                });
                this._didSendReady = true;
            }

            if (this.userData && this.userData.vertical === true) {
                domClass.add(this.domNode, 'vertical');
            }

            var _class = _.last(this.declaredClass.split('.'));
            $(this.domNode).addClass(_class);
        },
        onDidRenderWidgets:function(view,widgets){

        },
        onAttached:function(view){}
    });

    dcl.chainAfter(Module,"destroy");
    
    return Module;
});
