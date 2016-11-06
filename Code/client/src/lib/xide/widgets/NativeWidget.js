define([
    'dcl/dcl',
    "dojo/_base/declare",
    "xide/widgets/WidgetBase",
    "xide/factory"
], function (dcl,declare, WidgetBase, factory) {
    return dcl(WidgetBase, {
        declaredClass:'xide.widgets.NativeWidget',
        value: "unset",
        _lastValue: null,
        _nativeHandles:false,
        widgetChanged: function (value) {
            this.changed = true;

            if (this.userData) {
                this.userData.changed = true;
            }

            //if (this.nativeWidget) {
                this.setValue(value);
           // }
        },
        setupNativeWidgetHandler: function () {

            var thiz = this;

            if (this.nativeWidget && !this._nativeHandles) {

                this.nativeWidget._added = true;

                if(!this.nativeWidget._started){
                    //console.error('native widget not started : ' + this.nativeWidget.declaredClass);
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
        startup: function () {




            var data = this.userData;
            var type = this.type;
            var label = data.title;
            var value = this.value;
            var $root = $(this.valueNode);
            var thiz = this;

            //console.error('start native widget ',data);
            if(type){

                this.valueNode.innerHTML = "";

                this.titleNode.innerHTML = "";


                if(type ==='CheckBox') {


                    $root = $(this.titleNode);


                    var id = this.id + '_Checkbox';

                    var element = '';
                    element += '<div class="checkbox checkbox-success ">';
                    if (typeof data.icon !== 'undefined') {
                        //element += '<span style="float: left" class="' + data.icon + '"></span>';
                    }
                    element += '<input id="' + id + '" type="checkbox" ' + (value == true ? 'checked' : '') + '>';
                    element += '<label for="' + id + '">';
                    element += this.localize(label) + '</label>';
                    element += '</div>';

                    var $widget = $(element);

                    $root.append($widget);

                    var $nativeWidget = $widget.find('INPUT');
                    this.__on($nativeWidget,'change',null,function(){

                        var _value = $nativeWidget[0].checked;

                        if (thiz._lastValue !== null && thiz._lastValue === _value) {
                            return;
                        }
                        thiz._lastValue = _value;
                        thiz.widgetChanged(_value);
                    });
                }
            }
            this.onReady();
        }
    });
});