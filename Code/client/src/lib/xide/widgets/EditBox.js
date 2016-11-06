define([
    'dcl/dcl',
    "dojo/dom-construct",
    "xide/widgets/WidgetBase",
    "xide/utils"
], function (dcl,domConstruct,WidgetBase, utils) {

    return dcl(WidgetBase, {
        declaredClass:'xide.widgets.EditBox',
        value: "unset",
        _lastValue: null,
        instant:false,
        widgetChanged: function (value) {
            this.changed = true;
            if (this.userData) {
                this.userData.changed = true;
            }
            if (this.nativeWidget) {
                var _value = this.nativeWidget.val();
                this.setValue(_value);
                this.value = _value;
            }
        },
        __onChanged:function(value){
            var thiz = this,
                nativeWidget = this.nativeWidget;
            if(thiz.validator){
                var validated  = thiz.validator(value,nativeWidget);
                if (validated) {
                    this.userData.invalid=false;
                    nativeWidget.removeClass('text-danger');
                    nativeWidget.addClass('text-success');
                }else{
                    nativeWidget.removeClass('text-success');
                    nativeWidget.addClass('text-danger');
                    this.userData.invalid=true;
                }
            }
            if (thiz._lastValue !== null && thiz._lastValue === value) {
                return;
            }
            thiz._lastValue = value;
            thiz.widgetChanged(this.nativeWidget);
            thiz._emit('change',value);
        },
        setupNativeWidgetHandler: function () {

            var nativeWidget = this.nativeWidget;

            if (nativeWidget) {

                var thiz = this;

                this.addHandle("change",this.__on(this.nativeWidget,'change',null,function (value) {
                    thiz.__onChanged(nativeWidget.val());
                }));
                /*
                this.addHandle("change", this.nativeWidget.on("change", function (value) {
                    thiz.__onChanged(nativeWidget.val());
                }));
                */

                if(this.instant){
                    nativeWidget.on('keyup change', function() {
                        thiz.__onChanged(nativeWidget.val());
                    });
                }

                /*
                this.nativeWidget.change(function (e) {
                    console.log('edit changed'+e);
                });
                */
                this.addHandle("blur", this.nativeWidget.on("blur", function () {
                    thiz.setActive(false);
                }));
                this.addHandle("focus", this.nativeWidget.on("focus", function () {
                    thiz.setActive(true);
                }));
            }
        },
        set:function(what,value,updateOnly) {

            if(updateOnly===true){
                this.updateOnly = true;
            }
            if (what === 'value' && this.nativeWidget){
                this.nativeWidget.val(value);
            }


            return this.inherited(arguments);
        },
        get:function(what) {
            if (what === 'value' && this.nativeWidget){
                return this.nativeWidget.val();
            }
        },
        startup: function () {
            this.valueNode.innerHTML = "";
            var value = this.userData.value;
            var input = domConstruct.create('input',{
                "class":"form-control input-transparent",
                type:"text",
                value:value
            });
            this.nativeWidget = $(input);
            if(!this.title || this.title===''){
                utils.destroy(this.titleColumn);
            }
            this.valueNode.appendChild(input);
            this.setupNativeWidgetHandler();
            this.nativeWidget.trigger('change');
            this.onReady();
        }

    });
});