define([
    'dcl/dcl',
    "xide/widgets/WidgetBase",
    "xide/factory"
], function (dcl,WidgetBase, factory) {
    return dcl(WidgetBase, {
        declaredClass:'xide.widgets.SelectWidget',
        value: "unset",
        _lastValue: null,
        _nativeHandles:false,
        widgetChanged: function (value) {

            this.changed = true;
            if (this.userData) {
                this.userData.changed = true;
            }
            if (this.nativeWidget) {
                if (this.nativeWidget instanceof dijit.form.CheckBox) {
                    this.setValue(this.nativeWidget.get('checked'));
                    return;
                }
                this.setValue(this.nativeWidget.value);
            }
        },
        setupNativeWidgetHandler: function () {
            var thiz = this;
            if (this.nativeWidget && !this._nativeHandles) {
                this.nativeWidget._added = true;
                if(!this.nativeWidget._started){
                    this.valueNode.innerHTML = "";
                    this.valueNode.appendChild(this.nativeWidget.domNode);
                    this.nativeWidget.startup();
                }

                this._nativeHandles = true;


                if(this.nativeWidget._on){


                    //console.log('sub ', thiz.nativeWidget.id + '  ' + this.id);
                    this.nativeWidget._on("change", function (value) {
                        if (thiz._lastValue !== null && thiz._lastValue === value) {
                            return;
                        }
                        thiz._lastValue = value;
                        thiz.widgetChanged(this);

                    });

                }else {

                    this.addHandle("change", this.nativeWidget.on("change", function (value) {
                        if (thiz._lastValue !== null && thiz._lastValue === value) {
                            return;
                        }

                        thiz._lastValue = value;
                        thiz.widgetChanged(this);

                    }));
                }

                this.addHandle("blur", this.nativeWidget.on("blur", function () {
                    thiz.setActive(false);
                }));
                this.addHandle("focus", this.nativeWidget.on("focus", function () {
                    thiz.setActive(true);
                }));
            }
        },
        initWithDataItem: function (data) {
            this.empty();
            this.data = data;
            var thiz = this;
            this.widgets = factory.createWidgetsFromArray(data.inputs, thiz);
            if (this.widgets) {
                this.attachWidgets(this.widgets);
            }
        },
        startup: function () {
            if (this.nativeWidget && this.nativeWidget._added!==true) {
                this.valueNode.innerHTML = "";
                this.valueNode.appendChild(this.nativeWidget.domNode);
                this.setupNativeWidgetHandler();
            }
            this.onReady();
        }
    });
});