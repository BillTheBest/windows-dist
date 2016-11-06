define([
    "xdojo/declare",
    "dcl/dcl",
    'xide/utils',
    'xide/factory'
], function (declare,dcl,utils,factory) {

    var _Button = declare('xide.widgets.ActionToolbarButton',null,{

        btn:null,
        _args:null,
        size:'btn-default',
        disabled:false,
        startup:function(){},
        set:function(what,value){
            if(what==='disabled'){
                this.btn[value==true ? 'addClass' : 'removeClass']('disabled');
            }
        },
        get:function(what){

        },
        constructor:function(options,container){
            this._args = [options,container];
            utils.mixin(this,options);
            var _extraClasses = this.size || options.size;
            var _class = options['class'] || 'toolbar-button';
            _class+=(' ' + _extraClasses );
            var _disabled = options.disabled !==null ? options.disabled : this.disabled;
            options.disabled = null;
            options.delegate = null;
            options._parent = null;
            delete options['disabled'];

            var node = factory.createSimpleButton(options.label,options.iconClass,_class,options);
            this.domNode = node;
            this.btn = $(node);
            this._handles = [];
            utils.mixin(node,options);
            this.set('disabled',_disabled);
        },
        _handles:[],
        destroy:function(){

            if(this.btn){
                this.btn.off();
                this.btn.empty();
            }
        },
        on:function(event,handler){

            if(this.btn){

                var _handle = this.btn.on(event,handler);

            };
        }

    });

    return _Button;
});