define([
    'dcl/dcl',
    "dojo/_base/declare",
    "dojo/dom-construct",
    "xide/widgets/WidgetBase",
    "xide/factory",
    "xide/utils"
], function (dcl,declare, domConstruct,WidgetBase, factory,utils) {

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
                this.setValue(this.nativeWidget.val());
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



        },
        setupNativeWidgetHandler: function () {

            var nativeWidget = this.nativeWidget;

            if (nativeWidget) {

                var thiz = this;

                this.addHandle("change", this.nativeWidget.on("change", function (value) {
                    thiz.__onChanged(nativeWidget.val());
                }));

                if(this.instant){

                    nativeWidget.on('keyup change', function() {
                        thiz.__onChanged(nativeWidget.val());
                    });                }

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
        set:function(what,value) {

            if (what === 'value' && this.nativeWidget){
                this.nativeWidget.val(value);
            }

            return this.inherited(arguments);
        },
        startup: function () {

            this.inherited(arguments);

            this.valueNode.innerHTML = "";

            var value = this.userData.value;

            var thiz = this;

            var input = domConstruct.create('input',{
                "class":"form-control input-transparent icp icp-auto iconpicker-element iconpicker-input",
                type:"text",
                value:value
            });

            this.nativeWidget = $(input);


            if(this.title===''){
                utils.destroy(this.titleColumn);
            }
            this.valueNode.appendChild(input);



            var what = $(input).iconpicker(
                {
                    //title: 'With custom options',
                    //icons: ['fa-github', 'fa-heart', 'fa-html5', 'fa-css3'],
                    selectedCustomClass: 'label label-success',
                    //mustAccept:true,
                    //placement:'bottomRight',
                    showFooter:false
                }
            );


            what.on('iconpickerSelected', function(e) {
                thiz.__onChanged(thiz.nativeWidget.val());
            });


            this.setupNativeWidgetHandler();
            //this.nativeWidget.trigger('change');
            this.onReady();
        }

    });
});