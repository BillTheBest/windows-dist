/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    "xide/mixins/EventedMixin",
    "xide/widgets/_Widget",
    'dojo/Deferred',
    'xide/_Popup',
    'xide/registry'
], function (dcl, types, utils,EventedMixin,_Widget,Deferred,_Popup,registry) {

    var Module = dcl([_Widget.dcl,EventedMixin.dcl],{
        containerClass:'',
        type: types.DIALOG_TYPE.WARNING,
        size: types.DIALOG_SIZE.SIZE_WIDE,
        titleBarClass:'',
        panel:null,
        bodyCSS:null,
        startDfd:null,
        _ready:false,
        title:'No Title',
        /**
         * jsPanelOptions
         * @link http://beta.jspanel.de/api/#defaults
         * @type {object}
         */
        options:null,
        getDefaultOptions:function(mixin){
            var self = this;
            var options = {
                "contentSize": {
                    width: '600px',
                    height: '500px'
                },
                footerToolbar:[
                    {
                        item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                        event:    "click",
                        btnclass: "btn btn-danger btn-sm",
                        btntext:  " Cancel",
                        callback: function( event ){
                            event.data.close();
                            self.onCancel();
                        }
                    },
                    {
                        item:     "<button style='margin-left:5px;' type='button'><span class='...'></span></button>",
                        event:    "click",
                        btnclass: "btn btn-primary btn-sm",
                        btntext:  " Ok",
                        callback: function( event ){
                            self.onOk();
                            event.data.close();
                        }
                    }
                ]
            };
            utils.mixin(options,mixin);
            return options;
        },
        getInstance:function(args){
            if(this.panel){
                return this.panel;
            }
            _Popup.nextZ(3);
            var self = this;
            this.panel = $.jsPanel(utils.mixin({
                zi:_Popup.nextZ(),
                position: {
                    left: 200,
                    top: 100
                },
                title: self.title || 'jsPanel theme info',
                theme: self.theme || 'bootstrap-default',
                onmaximized:function(){
                    self.resize();
                },
                onnormalized:function(){
                    self.resize();
                },
                onbeforeclose:function(){
                    self.destroy(false);
                },
                callback: function (panel) {

                    self.domNode = this.content[0];

                    var thiz = this;

                    self.onshown(this,this.content[0]).then(function(){

                        thiz.content.addClass(self.containerClass);
                        thiz.content.css('tabIndex',1);
                        thiz.header.addClass(self.type);
                        thiz.footer.addClass('modal-footer');
                        var newZ = _Popup.nextZ();
                        panel.css("z-index", newZ);
                        panel.attr('tabIndex',1);
                        panel.keyup(function (event) {
                            if(event.which === 27){
                                self.destroy(true);
                            }
                        });
                        panel.focus();
                    });
                }
            },args));
            this.panel.on("resize",function(){
                self.resize();
            });
            return this.panel;
        },
        onshown:function(panelInstance,content){
            var self = this,
                head = new Deferred();

            if(this.onShow){
                var result = this.onShow(panelInstance,content,this);
                function ready(what){
                    self.startDfd.resolve(what);
                    self._ready = true;
                    self.resize();
                    head.resolve(what);
                }
                if(result && result.then){
                    result.then(ready);
                }else if(_.isArray(result)){
                    _.each(result,function(widget){
                        self.add(widget,null,false);
                    });
                    ready(result);
                }
            }
            return head;
        },
        onReady:function(){
            var self = this;
            setTimeout(function(){
                self._ready = true;
            },100);
        },
        destroy:function(destroyPanel){
            try {
                destroyPanel !== false && this.panel && this.panel.close();
                registry.remove(this.panel.id);
                //destroy
                if(this.headDfd){
                    this.headDfd.resolve(false);
                }
            }catch(e){
                logError(e,'panel close');
            }
        },
        show:function(options){
            var self=this;
            this.headDfd = new Deferred();
            if(!this.startDfd){
                this.startDfd = new Deferred();
                this.startDfd.then(function(){
                    self.onReady();
                });
            }

            this.panel = this.getInstance(options || this.options);
            //this.panel.id = this.panel[0].id;
            //registry.add(this.panel);
            return this.headDfd;
        },
        constructor:function(args){
            args = args || {};
            this.options = args.options || this.options || this.getDefaultOptions();
            utils.mixin(this,args);
        },
        onOk:function(){
            this.headDfd.resolve(true);
        },
        onCancel:function(){
            this.headDfd.resolve(false);
        }
    });


    dcl.chainAfter(Module, "onReady");
    dcl.chainAfter(Module, "onOk");
    dcl.chainAfter(Module, "onCancel");
    dcl.chainAfter(Module, "resize");

    return Module;

});