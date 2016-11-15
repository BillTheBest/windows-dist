/** @module xgrid/Base **/
define([
    "dcl/dcl",
    'xide/types',
    'xide/utils',
    'xide/factory',
    "xide/_base/_Widget"
], function (dcl,types,utils,factory,_Widget) {
    /**
     *
     * @param baseClass
     * @returns {*}
     */
    function createTabClass(baseClass){

        function _publishResize(widget,delay){
            setTimeout(function(){
                factory.publish(types.EVENTS.RESIZE,{
                    view:widget
                });
            },1000);
        }

        return dcl(baseClass||_Widget,{
            declaredClass:'xide/widgets/TabContainerTab',
            iconClass:null,
            _open:true,
            titleBar:null,
            titleNode:null,
            toggleNode:null,
            containerNode:null,
            height:'400px',
            padding:'0px',
            panelNode:null,
            templateString:'<div></div>',
            isContainer:true,
            lazy:true,
            containerRoot:null,
            scrollable:false,
            unselect:function(){
                this.hide();
            },
            select:function(){
                return this.show();
            },
            set:function(what,value){
                if(what==='loading'){
                    this.$loading && utils.destroy(this.$loading[0]);
                    if(value===true) {
                        var markup = '<div class="container-fluid center-block panel-spinner" style="opacity: 1;position: absolute;top:50%;">' +
                            '<div class="">' +
                            '<div class="offset3 span6 centering center-block">' +
                            '<div class="fa fa-3x fa-spinner fa-spin "/>' +
                            '</div>' +
                            '</div>' +
                            '</div>';
                        this.$loading = $(markup);
                        this.$containerNode.append(this.$loading);
                    }
                }
            },
            show:function(){
                var container = $(this.containerRoot),
                    toggleNode = $(this.toggleNode);
                toggleNode.removeClass('collapsed');
                toggleNode.attr('aria-expanded',true);
                container.removeClass('collapse');
                container.addClass('collapse in');
                container.attr('aria-expanded',true);
                this.open = true;
                this._startWidgets();
            },
            hide:function(){
                var container = $(this.containerRoot),
                    toggleNode= $(this.toggleNode);

                toggleNode.addClass('collapsed');
                toggleNode.attr('aria-expanded',false);
                container.removeClass('collapse in');
                container.addClass('collapse');
                container.attr('aria-expanded',false);
                this.open = false;
            },
            onFirstTimeShown:function(){
                var self = this;
                _.each(this._getChildren(),function(widget){
                    if(!widget._started && widget.startup){
                        var _res = widget.startup();
                        if(widget.resizeAfterStartup){
                            if(_res.then){
                                _res.then(function(){
                                   _publishResize.apply(self,[widget,1]);
                                });
                            }else{
                                _publishResize.apply(self,[widget,1]);
                            }
                        }
                    }
                },this);
            },
            _onHided:function(){
                this.open = false;
                this._emit('hide',{
                    view:this
                });
                this.onHide();
            },
            _onShown:function(e){
                this.open = true;
                this._startWidgets();
                this._onShow(e);
                this.resize();
                this._emit('show',{
                    view:this
                });
                this.onShow();
            },
            _onShow:function(){
                this.open = true;
                this.resize();
            },
            getChildren:function(){
                return this._widgets;
            },
            shouldResizeWidgets:function(){
                return this.open;
            },
            _onHide:function(){
                this.open = false;
            },
            add:dcl.superCall(function(sup) {
                return function (mixed,options,parent,startup) {
                    if(this.lazy && (mixed.allowLazy!==false && (options ? options.allowLazy!==false : true))){
                        startup = false;
                    }
                    return sup.apply(this, [mixed,options,parent,startup]);
                }
            }),
            addChild:function(what,mixed,startup){
                //collect widget
                this.add(what,mixed);
                what.domNode && utils.addChild(this.containerNode,what.domNode);
                if(startup!==false && !what._started && what.startup){
                    what.startup();
                }
            },

            buildRendering:function(){
                this.inherited(arguments);
                var panel = this.panelNode;
                this.__addHandler(panel,'hidden.bs.collapse','_onHided');
                this.__addHandler(panel,'hide.bs.collapse','_onHide');
                this.__addHandler(panel,'shown.bs.collapse','_onShown');
                this.__addHandler(panel,'show.bs.collapse','_onShow');
            },
            postMixInProperties:function(){
                var closed = !this.open;
                this.ariaOpen = closed ? 'true' : 'false';
                this.containerClass = closed ? 'collapse' : 'collapse in';
                this.titleClass = closed ? 'collapsed' : '';

                var iconStr = this.iconClass ? '<span attachTo="iconNode" class="${!iconClass}"/>' : '';

                var titleStr = '<span attachTo="titleNode" class=""> ${!title}</span>';
                var toggleNodeStr =
                    '<a tabIndex="-1" attachTo="toggleNode" href="#${!id}-Collapse" data-toggle="collapse" class="accordion-toggle ${!titleClass} ellipsis" aria-expanded="${!ariaOpen}">'+
                    iconStr +   titleStr + '</a>';

                this.scrollable = true;
                var extra = '';
                this.templateString = '<div tabindex="1"  class="panel ' + extra + '" attachTo="panelNode"><div class="panel-heading" attachTo="titleBar">'+
                    toggleNodeStr +
                    '</div><div attachTo="containerRoot" class="containerNode panel-collapse ${!containerClass}" id="${!id}-Collapse" aria-expanded="${!ariaOpen}">'+
                    '<div style="height: ${!height};padding:${!padding};position:relative" class="panel-body" attachTo="containerNode"></div>'+
                    '</div></div>';

                return this.inherited(arguments);
            },
            startup:function(){
                if(this.containerNode){
                    var self = this;
                    this.containerNode.set = function(key,value){
                        if(key==='title'){
                            self.titleNode.innerHTML = '&nbsp' + value;
                        }else if(key==='iconClass'){
                            var $icon = $(self.iconNode);
                            $icon.removeAttr('class');
                            $icon.addClass(value);
                        }
                    }
                }
            }
        });
    }
    /**
     *
     * @param baseClass
     * @param tabClass
     * @returns {*}
     */
    function createTabContainerClass(baseClass,tabClass){
        return dcl(baseClass,{
            scrollable:false,
            tabHeight:null,
            declaredClass:'xide/layout/_Accordion',
            defaultIcons:{
                "General":'fa-cogs',
                "Send":'fa-terminal',
                "Description":'fa-info',
                "Files":"fa-folder",
                "Special":"fa-cogs"
            },
            postMixInProperties:dcl.superCall(function(sup) {
                return function () {
                    return sup ? sup.apply(this,arguments) : null;
                }
            }),
            selectedChildWidget:null,
            tabClass:tabClass || createTabClass(_Widget),

            templateString:'<div class="panel-group" attachTo="containerNode"></div>',
            getTab:function(name){
                return _.find(this._widgets,{
                    title:name
                });
            },
            onShow:function(){
            },
            selectChild:function(mixed,start){
                if(mixed) {
                    if (_.isString(mixed)) {
                        var tab = this.getTab(mixed);
                        if (tab && tab.select) {
                            this._unselectAll(mixed);
                            tab.select();
                            this.selectedChildWidget = tab;
                            if(start){
                                tab._onShown();
                            }
                        }
                    }
                }
            },
            addWidget:function(widgetProto, ctrArgsIn, delegate, parent, startup, cssClass,baseClasses,select,classExtension){

                var target = parent;
                if(widgetProto.isContainer){
                }else{
                    target = this._createTab(this.tabClass,{
                        title:ctrArgsIn.title,
                        iconClass:ctrArgsIn.icon || this.defaultIcons[ctrArgsIn.title],
                        open:ctrArgsIn.open,
                        ignoreAddChild:true,
                        scrollable:this.scrollable,
                        height:this.tabHeight || '400px'
                    });
                }
                return target.add(widgetProto,ctrArgsIn,null,startup);
            },
            _unselectAll:function(except){
                _.each(this._widgets,function(tab){
                    if(except && except===tab.title){

                    }else{
                        tab.unselect();
                    }
                });
            },
            _createTab:function(tabClass,options){
                return this.add(tabClass,options,this.containerNode,true);
            },
            createTab:function(title,icon,open,tabClass,mixin){
                var tab = this._wireTab(this._createTab(tabClass||this.tabClass,utils.mixin({
                    iconClass:icon || this.defaultIcons[title],
                    open:open,
                    title:title,
                    scrollable:this.scrollable
                },mixin)));

                return tab;
            },
            _wireTab:function(tab){
                var thiz = this;
                tab._on('show',function(evt){
                    thiz._emit('show',evt);
                });
                tab._on('hide',function(evt){
                    thiz._emit('hide',evt);
                });
                return tab;
            },
            removeChild:function(tab,selectNew){
                tab = _.isString(tab) ? this.getTab(tab) : tab;
                if(!tab){
                    console.error('invalid child !');
                    return;
                }
                //@TODO: no no no:
                tab.destroy();
                if(!this._widgets){
                    this._widgets=[];
                }
                this._widgets.remove(tab);
                if(selectNew!==false) {
                    var newTab = this._widgets[this._widgets.length - 1];
                    if (newTab) {
                        this.resize();
                        this.selectChild(newTab);
                    }
                }
            },
            addChild:function(mixed,options){
                if(!mixed){
                    return;
                }
                var node = $(mixed.domNode || mixed.containerNode);
                //is tab:
                if(node.hasClass('panel')){
                    return this.add(mixed);
                }
                //something else, create tab
                var tab = this.createTab(options);
                tab.add(mixed,options);
            }
        });
    }

    var widgetBaseClass = _Widget;

    var Module = createTabContainerClass(widgetBaseClass);
    Module.tabClass = createTabClass(widgetBaseClass);

    Module.createTabClass = createTabClass;
    Module.createTabContainerClass = createTabContainerClass;

    return Module;

});