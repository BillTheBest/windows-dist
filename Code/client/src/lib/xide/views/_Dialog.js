/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    "xide/mixins/EventedMixin",
    "xide/widgets/_Widget",
    'dojo/Deferred',
    'xide/_Popup'

], function (dcl,types,
             utils, EventedMixin,
             _Widget,Deferred,_Popup
) {



    var ctx = window.sctx,
        root;

    var _BootstrapDialog  = typeof BootstrapDialog !=='undefined' ? BootstrapDialog : {};

    var Module = dcl([_Widget.dcl,EventedMixin.dcl],{
        declaredClass:'xide/views/_Dialog',
        //message: null,
        cssClass:'bootstrap3-dialog',
        containerClass:'',
        type: types.DIALOG_TYPE.WARNING,
        size: types.DIALOG_SIZE.SIZE_WIDE,
        //defaultOptions:_BootstrapDialog.defaultOptions,
        dlg:null,
        bodyCSS:null,
        okButtonClass:'btn-danger',
        startDfd:null,
        _ready:false,
        getData:function(){
            return null;
        },
        getInstance:function(args){

            this.defaultOptions  = typeof BootstrapDialog !=='undefined' ? BootstrapDialog.defaultOptions : {};

            if(this.dlg){
                return this.dlg;
            }

            args = this.buildArgs(args);

            var instance = new _BootstrapDialog(args),
                oldRealize = instance.realize,
                self = this;

            if(!instance){
                console.error('BootstrapDialog not loaded, abort');
                return;
            }

            instance.realize = function(){
                oldRealize.apply(instance,null);
                self.buildRendering(instance);
                $.each(args.buttons, function (index, button) {
                    var $button = instance.getButton(button.id);
                    if($button && button.focus==true){
                        $button.addClass('active');
                    }
                });

                $(instance.$modalDialog).draggable({ handle: ".modal-header" });
            }

            instance.owner = this;


            this.dlg = instance;

            return instance;

        },
        buildRendering:function(dlg){
            this.containerNode= this.domNode = dlg.$modalBody[0];
            dlg.$modalBody.addClass(this.containerClass);
            this.bodyCSS && dlg.$modalBody.css(this.bodyCSS);
        },
        onshown:function(dlg){
            dlg.owner.resize();
            dlg.owner.onShow.apply(dlg.owner,[]);
            var zIndexBackdrop = window.__nextZ ? window.__nextZ(1) : 1040;
            var zIndexModal = window.__nextZ ? window.__nextZ() : 1050;

            dlg.$modal.css('z-index',zIndexBackdrop);
            dlg.$modalDialog.css('z-index',zIndexModal);

            this._ready = true;
        },
        onReady:function(){
            var self = this;
            setTimeout(function(){
                self._ready = true;
            },100);

        },
        startup:function(){
            var dlg = this.getInstance();
        },
        destroy:function(){
            this.dlg && this.dlg.close();
        },
        show:function(args){

            var self=this;

            if(!this.startDfd){
                this.startDfd = new Deferred();
                this.startDfd.then(function(){
                    self.onReady();
                });
            }

            var dlg = this.getInstance(args);

            dlg.open();

            setTimeout(function(){
                self._ready=true;
            },1000);

            return this.startDfd;

        },

        getButtons:function(){

            var thiz = this;

            var buttons = [{
                icon: 'fa-check',
                label: thiz.localize('Ok'),
                cssClass: thiz.okButtonClass || 'btn-primary',
                hotkey: 13, // Enter.
                autospin: false,
                focus:true,
                id:utils.createUUID(),
                action: function(dialogRef) {
                    if(!thiz._ready){
                        return;
                    }
                    dialogRef.close(false);
                    dialogRef.owner.onOk(thiz.getData());
                }
            },
            {
                icon: 'glyphicon glyphicon-check',
                label: thiz.localize('CANCEL'),
                cssClass: 'btn-info',
                autospin: false,
                id:utils.createUUID(),
                action: function (dialogRef) {
                    dialogRef.close();
                    dialogRef.owner.onCancel();
                }

            }
            ];

            return buttons;

        },
        buildArgs:function(args){
            args = args || this.defaultOptions || {};
            utils.mixin(args,{
                type: this.type,
                size: this.size,
                message:this.message,
                title:this.title,
                buttons:this.buttons,
                onOk:this.onOk,
                onCancel:this.onCancel,
                onShow:this.onShow,
                onshown:this.onshown
                //defaultOptions:_BootstrapDialog.defaultOptions,
            });
            args.title = this.localize(args.title)
            return args;
        },
        constructor:function(args){
            this.buttons = this.getButtons();
            utils.mixin(this,args);
        },
        onOk:function(){},
        onCancel:function(){}
    });

    dcl.chainAfter(Module, "onReady");
    dcl.chainAfter(Module, "onOk");
    dcl.chainAfter(Module, "onCancel");
    dcl.chainAfter(Module, "resize");


    return Module;

});