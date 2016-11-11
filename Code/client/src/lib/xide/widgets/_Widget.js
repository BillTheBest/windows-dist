/** @module xide/widgets/_Widget **/
define([
    'xdojo/declare',
    'dcl/dcl',
    'xide/utils',
    'xide/mixins/EventedMixin',
    'xide/registry',
    'xlang/i18'
], function (declare,dcl,utils,EventedMixin,registry,i18) {
    
    var forwardMethods = ['resize'];

    function _resize(what){
        try {
            if (typeof what['resize'] === "function" && what._started) {
                what['resize'].apply(what,arguments);
            }else{
                console.warn('widget has no resize or is not started yet ' + what.declaredClass,[what,what.resize]);
            }
        }catch(e){
            logError(e,'error resizing sub widget ' + what.id + ' class:'+what.declaredClass);
        }
    }

    function forward(method,args){
        _.each(this._widgets,function(what){
            if (what && typeof what[method] === "function") {
                what[method].apply(what,args);
            }
        },this);
    }

    function set(prop,value){
        _.each(this._widgets,function(what){
            if (what && what[prop]) {
                what[prop] = value;
            }
        },this);
    }
    var Implementation = {
        _widgets:null,
        __eventHandles:null,
        _isResizing:false,
        cssClass:'',
        onResizeBegin:function(){
            this._isResizing=true;
            _.each(this._widgets,function(what){
                what && (what._isResizing=true);
            },this);
        },
        onResizeEnd:function(){
            this._isResizing=false;
            _.each(this._widgets,function(what){
                what && (what._isResizing=false);
            },this);
        },
        _toWidget:function(element){
            if(element && element.id){
                var widget = registry.byId(element.id);
                if(widget){
                    return widget;
                }
            }
            return null;
        },
        parentByClass :function(className,max){
            var i = 0,
                element = this.domNode,
                widget = null;
            max = max || 20;
            while (!widget && i < max && element) {
                if (element) {
                    var _widget = this._toWidget(element);
                    if(_widget && _widget.declaredClass){
                        if(_widget.declaredClass === className){
                            widget = _widget;
                        }
                    }
                    element = element.parentNode;
                }
                i++;
            }
            return widget;
        },
        _startWidgets:function(){
            var result = false;
            if(this._widgets) {
                for (var i = 0; i < this._widgets.length; i++) {
                    var w = this._widgets[i];
                    if (w && !w._started && w.startup) {
                        w.startup();
                        w._started = true;
                        result = true;
                        w._emit('startup');
                    }
                }
            }
            return result;
        },
        _createForward:function(method){
            var self = this;
            if(!this[method]){
                this[method] = function(){
                    for (var i = 0; i < self._widgets.length; i++) {
                        var w = self._widgets[i];
                        w[method] && w[method]();
                    }
                };
            }
        },
        onShow:function(){
            if(this._widgets){
                this._startWidgets();
                for (var i = 0; i < this._widgets.length; i++) {
                    var w = this._widgets[i];
                    if(w && w!==this) {
                        w._showing=true;
                        w.open = true;
                        w.onShow && w.onShow();
                        w._emit && w._emit('show',{});

                    }
                }
            }
        },
        onHide:function(){
            if(this._widgets){
                for (var i = 0; i < this._widgets.length; i++) {
                    var w = this._widgets[i];
                    
                    if(!w){
                        console.warn('invalid widget');
                    }else {
                        if(w!==this){
                            w._showing = false;
                            w.open = false;
                            w.onHide && w.onHide();
                            try{
                                w._emit && w._emit('hide',{});
                            }catch(e){
                                logError(e,'error emitting on-hide');
                            }

                        }
                    }
                }
            }
        },
        _getChildren:function(){
            return this._widgets;
        },
        debounce:function(methodName,_function,delay,options,now){
            return utils.debounce(this,methodName,_function,delay,options,now);
        },
        __addHandler:function(element,type,handler){
            if(!element){
                return;
            }
            handler = _.isString(handler) ? this[handler] ? this[handler] : null : handler;
            var self = this;

            if(typeof handler ==='function'){
                return this.__on(element,type,null,function(){
                    handler.apply(self,arguments);
                });
            }
            return false;
        },
        _shouldResizeWidgets:function(){
            return true;
        },
        resize:function(){
            var _args = arguments;
            
            this.inherited && this.inherited(_args);
            
            if(this.shouldResizeWidgets && this.shouldResizeWidgets()===false){
                return;
            }
            //if(this._isResizing ===true){return;}
            if(this._widgets){
                for (var i = 0; i < this._widgets.length; i++) {
                    var what = this._widgets[i];
                    if (what) {
                        what.resizeToParent && utils.resizeTo(what, this, true, true);
                        if (what && typeof what['resize'] === "function" && what._started) {
                            what['resize'].apply(what, _args);
                        }
                    }
                }
            }
        },
        destroy:function(){
            this.inherited && this.inherited(arguments);
            var _widgets = this._widgets;
            if (_widgets) {
                for (var i = 0; i < _widgets.length; i++) {
                    var widget = _widgets[i];
                    if (widget && widget != this && widget._destroyed !== true) {
                        utils.destroy(widget);
                    }
                }
                delete this._widgets;
                this._widgets = null;
            }
            if(this.domNode) {
                registry.remove(this.domNode.id);
                utils.destroy(this.domNode);
            }
            this._destroyed = true;
        },
        onAdded:function(){
        },
        /**
         *
         * @param mixed
         * @param options
         * @param parent
         * @param startup
         * @param select
         * @param extension
         * @returns {*}
         */
        add:function(mixed,options,parent,startup,select,extension){
            if(mixed==this){
                return mixed;
            }
            !this._widgets && (this._widgets = []);

            var widgets = this._widgets;
            if(_.isNumber(options)){
                options = null;
            }
            if(options!==null && !_.isObject(options)){
                options ={};
            }
            var result = null;

            _.isEmpty(options) && (options=null);

            var _parent = parent || ( parent!==false ? this.containerNode || this.domNode : null);

            //case 1: instance or object
            if((mixed && !options && !parent) || (!options && !parent && !startup && !select && !extension)){
                widgets.indexOf(mixed)==-1 && (widgets.push(mixed));
                return mixed;

            //case 2: proto
            }else if(mixed && options){
                result = utils.addWidget(mixed,options,this,_parent,startup,null,null,select,extension);
                widgets.push(result);
            }
            return result;
        },
        remove:function(mixed){
            this._widgets && this._widgets.remove(mixed);
        },
        buildRendering:function() {
            this.inherited && this.inherited(arguments);
            var node = utils.getNode(this);
            node && this.cssClass && $(node).addClass(this.cssClass);
            node && this.style && $(node).attr('style',this.style);
        }
    };

    var _Widget = dcl([EventedMixin.dcl,i18.dcl],Implementation);
    var Module = declare('xide/widgets/_Widget',i18,Implementation);
    Module.Implmentation = Implementation;
    Module.dcl = _Widget;
    dcl.chainAfter(_Widget,'destroy');
    dcl.chainAfter(_Widget,'onResizeBegin');
    dcl.chainAfter(_Widget,'onResizeEnd');
    return Module;
});
